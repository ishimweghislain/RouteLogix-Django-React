"""
Hours of Service (HOS) validator for FMCSA compliance.
Implements all major HOS rules for commercial drivers.
"""

from datetime import datetime, timedelta, time
from typing import List, Dict, Any, Optional
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class HOSValidator:
    """
    Validates Hours of Service compliance according to FMCSA regulations.
    """
    
    def __init__(self, cycle_type: str = '70_8'):
        """
        Initialize HOS validator with specific cycle type.
        
        Args:
            cycle_type: Either '70_8' or '60_7' for cycle limits
        """
        self.cycle_type = cycle_type
        self.rules = settings.ROUTELOGIX_SETTINGS['HOS_RULES'][cycle_type]
        self.violations = []
    
    def validate_daily_log(self, daily_log) -> List[Dict[str, Any]]:
        """
        Validate a single daily log for HOS violations.
        
        Args:
            daily_log: DailyLog model instance
            
        Returns:
            List of violation dictionaries
        """
        self.violations = []
        
        # Daily driving limit (11 hours)
        self._check_daily_driving_limit(daily_log)
        
        # Daily duty window (14 hours)
        self._check_duty_window(daily_log)
        
        # 30-minute break requirement
        self._check_30_minute_break(daily_log)
        
        # Rest period requirement (10 hours)
        self._check_rest_period(daily_log)
        
        # Data integrity checks
        self._check_data_integrity(daily_log)
        
        return self.violations
    
    def validate_trip_logs(self, trip) -> List[Dict[str, Any]]:
        """
        Validate all daily logs for a trip, including cycle violations.
        
        Args:
            trip: Trip model instance
            
        Returns:
            List of violation dictionaries
        """
        self.violations = []
        
        daily_logs = trip.daily_logs.order_by('log_date')
        
        for daily_log in daily_logs:
            # Validate individual daily log
            daily_violations = self.validate_daily_log(daily_log)
            self.violations.extend(daily_violations)
        
        # Check cycle violations across all logs
        self._check_cycle_violations(daily_logs)
        
        return self.violations
    
    def _check_daily_driving_limit(self, daily_log):
        """Check if daily driving limit (11 hours) is exceeded."""
        max_driving_hours = self.rules['daily_driving_limit']
        driving_hours = daily_log.total_driving_hours
        
        if driving_hours > max_driving_hours:
            self.violations.append({
                'type': 'daily_driving_limit',
                'description': f'Daily driving limit exceeded: {driving_hours:.1f} hours (max: {max_driving_hours} hours)',
                'severity': 'violation',
                'time': None,
                'value': driving_hours,
                'limit': max_driving_hours
            })
    
    def _check_duty_window(self, daily_log):
        """Check if duty window (14 hours) is exceeded."""
        max_duty_hours = self.rules['daily_duty_window']
        duty_hours = daily_log.total_on_duty_hours + daily_log.total_driving_hours
        
        if duty_hours > max_duty_hours:
            self.violations.append({
                'type': 'duty_window_limit',
                'description': f'Daily duty window exceeded: {duty_hours:.1f} hours (max: {max_duty_hours} hours)',
                'severity': 'violation',
                'time': None,
                'value': duty_hours,
                'limit': max_duty_hours
            })
    
    def _check_30_minute_break(self, daily_log):
        """Check 30-minute break requirement after 8 hours of driving."""
        entries = list(daily_log.entries.filter(status='driving').order_by('start_time'))
        
        if not entries:
            return
        
        cumulative_driving = 0
        break_taken = False
        
        for entry in entries:
            cumulative_driving += entry.duration_hours
            
            # Check if 8 hours of driving reached without break
            if cumulative_driving >= 8 and not break_taken:
                # Look for subsequent break of at least 30 minutes
                break_taken = self._check_for_break_after_entry(daily_log, entry)
                
                if not break_taken:
                    self.violations.append({
                        'type': 'break_requirement',
                        'description': '30-minute break required after 8 hours of driving',
                        'severity': 'violation',
                        'time': entry.end_time,
                        'value': cumulative_driving,
                        'limit': 8
                    })
                    break
    
    def _check_for_break_after_entry(self, daily_log, driving_entry):
        """Check if there's a qualifying break after a driving entry."""
        break_entries = daily_log.entries.filter(
            status__in=['off_duty', 'sleeper'],
            start_time__gte=driving_entry.end_time
        ).order_by('start_time')
        
        for break_entry in break_entries:
            if break_entry.duration_minutes >= 30:
                return True
        
        return False
    
    def _check_rest_period(self, daily_log):
        """Check if adequate rest period (10+ hours) was taken."""
        rest_hours = daily_log.total_off_duty_hours + daily_log.total_sleeper_hours
        min_rest_hours = self.rules['rest_period_hours']
        
        if rest_hours < min_rest_hours:
            self.violations.append({
                'type': 'rest_period_insufficient',
                'description': f'Insufficient rest period: {rest_hours:.1f} hours (min: {min_rest_hours} hours)',
                'severity': 'warning',
                'time': None,
                'value': rest_hours,
                'limit': min_rest_hours
            })
    
    def _check_data_integrity(self, daily_log):
        """Check for data integrity issues in the daily log."""
        entries = list(daily_log.entries.order_by('start_time'))
        
        if not entries:
            self.violations.append({
                'type': 'missing_entries',
                'description': 'No log entries found for this day',
                'severity': 'critical',
                'time': None,
                'value': 0,
                'limit': 1
            })
            return
        
        # Check for overlapping entries
        self._check_overlapping_entries(entries)
        
        # Check if total time equals 24 hours
        if not daily_log.validate_24_hour_total():
            total_minutes = (
                daily_log.total_driving_time + 
                daily_log.total_on_duty_time + 
                daily_log.total_sleeper_time + 
                daily_log.total_off_duty_time
            )
            self.violations.append({
                'type': 'invalid_time_sequence',
                'description': f'Daily log entries do not total 24 hours: {total_minutes/60:.1f} hours',
                'severity': 'violation',
                'time': None,
                'value': total_minutes / 60,
                'limit': 24
            })
    
    def _check_overlapping_entries(self, entries):
        """Check for overlapping time entries."""
        for i in range(len(entries) - 1):
            current_entry = entries[i]
            next_entry = entries[i + 1]
            
            if current_entry.end_time > next_entry.start_time:
                self.violations.append({
                    'type': 'overlapping_entries',
                    'description': f'Overlapping entries: {current_entry} overlaps with {next_entry}',
                    'severity': 'violation',
                    'time': current_entry.end_time,
                    'value': None,
                    'limit': None
                })
    
    def _check_cycle_violations(self, daily_logs):
        """Check for cycle hour violations across multiple days."""
        if len(daily_logs) < self.rules['cycle_days']:
            return  # Not enough days to check cycle
        
        max_cycle_hours = self.rules['max_cycle_hours']
        cycle_days = self.rules['cycle_days']
        
        # Check rolling window for each day
        for i in range(cycle_days - 1, len(daily_logs)):
            window_logs = daily_logs[i - cycle_days + 1:i + 1]
            
            total_duty_hours = sum(
                log.total_driving_hours + log.total_on_duty_hours 
                for log in window_logs
            )
            
            if total_duty_hours > max_cycle_hours:
                self.violations.append({
                    'type': 'cycle_limit_exceeded',
                    'description': f'Cycle limit exceeded: {total_duty_hours:.1f} hours in {cycle_days} days (max: {max_cycle_hours} hours)',
                    'severity': 'critical',
                    'time': None,
                    'value': total_duty_hours,
                    'limit': max_cycle_hours
                })


class HOSCalculator:
    """
    Calculate HOS-compliant schedules and driving periods.
    """
    
    def __init__(self, cycle_type: str = '70_8'):
        self.cycle_type = cycle_type
        self.rules = settings.ROUTELOGIX_SETTINGS['HOS_RULES'][cycle_type]
    
    def calculate_driving_schedule(self, trip_distance: float, average_speed: float = 65) -> Dict[str, Any]:
        """
        Calculate a HOS-compliant driving schedule for a trip.
        
        Args:
            trip_distance: Total distance in miles
            average_speed: Average driving speed in mph
            
        Returns:
            Dictionary with schedule details
        """
        total_driving_hours = trip_distance / average_speed
        
        # Calculate number of days needed
        max_daily_driving = self.rules['daily_driving_limit']
        days_needed = max(1, int(total_driving_hours / max_daily_driving) + 1)
        
        # Generate daily schedule
        daily_schedules = []
        remaining_hours = total_driving_hours
        remaining_miles = trip_distance
        
        for day in range(days_needed):
            if remaining_hours <= 0:
                break
                
            # Calculate driving hours for this day
            daily_driving = min(remaining_hours, max_daily_driving)
            daily_miles = min(remaining_miles, daily_driving * average_speed)
            
            # Generate driving periods with breaks
            periods = self._generate_driving_periods(daily_driving)
            
            daily_schedules.append({
                'day': day + 1,
                'driving_hours': daily_driving,
                'distance_miles': daily_miles,
                'periods': periods
            })
            
            remaining_hours -= daily_driving
            remaining_miles -= daily_miles
        
        return {
            'total_driving_hours': total_driving_hours,
            'total_days': days_needed,
            'daily_schedules': daily_schedules,
            'cycle_type': self.cycle_type
        }
    
    def _generate_driving_periods(self, total_hours: float) -> List[Dict[str, Any]]:
        """Generate driving periods with required breaks."""
        periods = []
        remaining_hours = total_hours
        current_time = time(6, 0)  # Start at 6 AM
        
        while remaining_hours > 0:
            # Drive for up to 8 hours before break
            drive_hours = min(remaining_hours, 8)
            
            end_time = self._add_hours_to_time(current_time, drive_hours)
            
            periods.append({
                'type': 'driving',
                'start_time': current_time.strftime('%H:%M'),
                'end_time': end_time.strftime('%H:%M'),
                'duration_hours': drive_hours
            })
            
            remaining_hours -= drive_hours
            current_time = end_time
            
            # Add break if more driving remaining
            if remaining_hours > 0:
                break_end = self._add_hours_to_time(current_time, 0.5)  # 30-minute break
                
                periods.append({
                    'type': 'break',
                    'start_time': current_time.strftime('%H:%M'),
                    'end_time': break_end.strftime('%H:%M'),
                    'duration_hours': 0.5
                })
                
                current_time = break_end
        
        return periods
    
    def _add_hours_to_time(self, time_obj: time, hours: float) -> time:
        """Add hours to a time object."""
        dt = datetime.combine(datetime.today(), time_obj)
        dt += timedelta(hours=hours)
        return dt.time()
    
    def calculate_fuel_stops(self, trip_distance: float, fuel_interval: int = 1000) -> List[Dict[str, Any]]:
        """Calculate required fuel stops along the route."""
        fuel_stops = []
        
        current_mile = fuel_interval
        stop_number = 1
        
        while current_mile < trip_distance:
            fuel_stops.append({
                'stop_number': stop_number,
                'mile': current_mile,
                'distance_from_start': current_mile,
                'fuel_needed': True,
                'duration_minutes': 45  # Standard fuel stop duration
            })
            
            current_mile += fuel_interval
            stop_number += 1
        
        return fuel_stops
    
    def calculate_rest_periods(self, schedule: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Calculate required rest periods based on driving schedule."""
        rest_periods = []
        
        for i, daily_schedule in enumerate(schedule['daily_schedules']):
            if i < len(schedule['daily_schedules']) - 1:  # Not the last day
                rest_periods.append({
                    'day': daily_schedule['day'],
                    'type': 'mandatory_rest',
                    'duration_hours': self.rules['rest_period_hours'],
                    'start_time': '22:00',  # 10 PM
                    'end_time': '08:00',   # 8 AM next day
                    'location': 'Rest Area/Truck Stop'
                })
        
        return rest_periods
