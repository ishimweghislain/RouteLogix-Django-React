"""
Electronic Logging Device (ELD) models for FMCSA compliance.
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import datetime, timedelta, time
import uuid
from routelogix.apps.trips.models import Trip


class DailyLog(models.Model):
    """
    Daily log sheet representing a single 24-hour period of HOS tracking.
    """
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='daily_logs')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # Log date (24-hour period starting at midnight)
    log_date = models.DateField(help_text="The date this log covers (24-hour period)")
    
    # Daily totals (in minutes for precision)
    total_driving_time = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(660)],  # Max 11 hours
        help_text="Total driving time in minutes"
    )
    total_on_duty_time = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(840)],  # Max 14 hours
        help_text="Total on-duty time in minutes"
    )
    total_sleeper_time = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(1440)],  # Max 24 hours
        help_text="Total sleeper berth time in minutes"
    )
    total_off_duty_time = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(1440)],  # Max 24 hours
        help_text="Total off-duty time in minutes"
    )
    
    # HOS cycle tracking
    cycle_hours_used = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(84)],  # Max possible with sleeper berth
        help_text="Cumulative cycle hours used"
    )
    
    # Status tracking
    is_complete = models.BooleanField(default=False, help_text="Whether this daily log is complete")
    has_violations = models.BooleanField(default=False, help_text="Whether this log has HOS violations")
    is_locked = models.BooleanField(default=False, help_text="Whether this log is locked from editing")
    
    # Driver certification
    driver_signature = models.CharField(max_length=100, blank=True, help_text="Digital signature")
    certified_at = models.DateTimeField(null=True, blank=True)
    
    # Additional information
    remarks = models.TextField(blank=True, help_text="Driver remarks for this day")
    odometer_start = models.PositiveIntegerField(null=True, blank=True, help_text="Starting odometer reading")
    odometer_end = models.PositiveIntegerField(null=True, blank=True, help_text="Ending odometer reading")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['trip', 'log_date']
        unique_together = [['trip', 'log_date']]
        indexes = [
            models.Index(fields=['trip', 'log_date']),
            models.Index(fields=['user', 'log_date']),
            models.Index(fields=['has_violations']),
        ]
    
    def __str__(self):
        return f"Daily Log {self.log_date} - Trip {str(self.trip.id)[:8]}"
    
    @property
    def total_driving_hours(self):
        """Convert driving time from minutes to hours."""
        return self.total_driving_time / 60.0
    
    @property
    def total_on_duty_hours(self):
        """Convert on-duty time from minutes to hours."""
        return self.total_on_duty_time / 60.0
    
    @property
    def total_sleeper_hours(self):
        """Convert sleeper time from minutes to hours."""
        return self.total_sleeper_time / 60.0
    
    @property
    def total_off_duty_hours(self):
        """Convert off-duty time from minutes to hours."""
        return self.total_off_duty_time / 60.0
    
    def validate_24_hour_total(self):
        """Ensure all time periods add up to 24 hours (1440 minutes)."""
        total_minutes = (
            self.total_driving_time + 
            self.total_on_duty_time + 
            self.total_sleeper_time + 
            self.total_off_duty_time
        )
        return total_minutes == 1440
    
    def check_hos_violations(self):
        """Check for HOS violations and update violation flags."""
        from routelogix.apps.eld.services.hos_validator import HOSValidator
        validator = HOSValidator(self.trip.cycle_type)
        violations = validator.validate_daily_log(self)
        
        # Update violation flag
        self.has_violations = len(violations) > 0
        self.save()
        
        # Create violation records
        for violation_data in violations:
            HOSViolation.objects.get_or_create(
                daily_log=self,
                violation_type=violation_data['type'],
                defaults={
                    'description': violation_data['description'],
                    'severity': violation_data['severity']
                }
            )
        
        return violations


class LogEntry(models.Model):
    """
    Individual duty status entries within a daily log.
    """
    DUTY_STATUS_CHOICES = [
        ('off_duty', 'Off Duty'),
        ('sleeper', 'Sleeper Berth'),
        ('driving', 'Driving'),
        ('on_duty', 'On Duty (Not Driving)'),
    ]
    
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name='entries')
    
    # Duty status information
    status = models.CharField(max_length=20, choices=DUTY_STATUS_CHOICES)
    start_time = models.TimeField(help_text="Start time for this duty status")
    end_time = models.TimeField(help_text="End time for this duty status")
    
    # Duration (calculated field for efficiency)
    duration_minutes = models.PositiveIntegerField(
        validators=[MaxValueValidator(1440)],  # Max 24 hours
        help_text="Duration of this entry in minutes"
    )
    
    # Location information
    location = models.CharField(max_length=255, blank=True, help_text="Location where status change occurred")
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    # Additional details
    remarks = models.TextField(blank=True, help_text="Driver remarks for this entry")
    odometer = models.PositiveIntegerField(null=True, blank=True, help_text="Odometer reading")
    
    # Entry metadata
    is_automatic = models.BooleanField(default=True, help_text="Whether this entry was auto-generated")
    is_edited = models.BooleanField(default=False, help_text="Whether this entry has been manually edited")
    edit_reason = models.CharField(max_length=255, blank=True, help_text="Reason for manual edit")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['daily_log', 'start_time']
        indexes = [
            models.Index(fields=['daily_log', 'start_time']),
            models.Index(fields=['status', 'start_time']),
        ]
    
    def __str__(self):
        return f"{self.get_status_display()} - {self.start_time} to {self.end_time}"
    
    @property
    def duration_hours(self):
        """Convert duration from minutes to hours."""
        return self.duration_minutes / 60.0
    
    def calculate_duration(self):
        """Calculate duration in minutes between start and end times."""
        if not self.start_time or not self.end_time:
            return 0
        
        # Handle overnight entries (end time is next day)
        start_datetime = datetime.combine(datetime.today(), self.start_time)
        end_datetime = datetime.combine(datetime.today(), self.end_time)
        
        if self.end_time < self.start_time:  # Overnight
            end_datetime += timedelta(days=1)
        
        duration = end_datetime - start_datetime
        return int(duration.total_seconds() / 60)  # Convert to minutes
    
    def save(self, *args, **kwargs):
        """Override save to calculate duration automatically."""
        if self.start_time and self.end_time:
            self.duration_minutes = self.calculate_duration()
        super().save(*args, **kwargs)


class HOSViolation(models.Model):
    """
    Hours of Service violations detected in daily logs.
    """
    VIOLATION_TYPES = [
        # Daily violations
        ('daily_driving_limit', 'Daily Driving Limit Exceeded'),
        ('duty_window_limit', 'Daily Duty Window Exceeded'),
        ('break_requirement', '30-Minute Break Requirement Not Met'),
        ('rest_period_insufficient', 'Insufficient Rest Period'),
        
        # Cycle violations
        ('cycle_limit_exceeded', 'Cycle Hour Limit Exceeded'),
        ('no_restart', '34-Hour Restart Required'),
        
        # Sleeper berth violations
        ('sleeper_berth_invalid', 'Invalid Sleeper Berth Period'),
        ('sleeper_berth_combination', 'Invalid Sleeper Berth Combination'),
        
        # Data integrity violations
        ('missing_entries', 'Missing Log Entries'),
        ('overlapping_entries', 'Overlapping Log Entries'),
        ('invalid_time_sequence', 'Invalid Time Sequence'),
    ]
    
    SEVERITY_CHOICES = [
        ('warning', 'Warning'),
        ('violation', 'Violation'),
        ('critical', 'Critical'),
    ]
    
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name='violations')
    
    # Violation details
    violation_type = models.CharField(max_length=50, choices=VIOLATION_TYPES)
    description = models.TextField(help_text="Detailed description of the violation")
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='violation')
    
    # Time information
    violation_time = models.TimeField(null=True, blank=True, help_text="Time when violation occurred")
    
    # Resolution tracking
    is_resolved = models.BooleanField(default=False)
    resolution_notes = models.TextField(blank=True, help_text="Notes on how violation was resolved")
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['daily_log', 'severity', 'created_at']
        indexes = [
            models.Index(fields=['daily_log', 'violation_type']),
            models.Index(fields=['severity', 'is_resolved']),
        ]
    
    def __str__(self):
        return f"{self.get_violation_type_display()} - {self.daily_log.log_date}"
    
    def resolve(self, user=None, notes=""):
        """Mark violation as resolved."""
        self.is_resolved = True
        self.resolved_at = timezone.now()
        self.resolved_by = user
        self.resolution_notes = notes
        self.save()


class LogGrid(models.Model):
    """
    24-hour visual grid representation of a daily log for display purposes.
    Each slot represents a time period (typically 15 minutes).
    """
    # Primary fields
    daily_log = models.OneToOneField(DailyLog, on_delete=models.CASCADE, related_name='grid')
    
    # Grid configuration
    grid_slots = models.PositiveIntegerField(default=96, help_text="Number of grid slots (96 = 15-min intervals)")
    minutes_per_slot = models.PositiveIntegerField(default=15, help_text="Minutes each slot represents")
    
    # Grid data (JSON or comma-separated values)
    grid_data = models.TextField(help_text="Comma-separated duty status for each time slot")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['daily_log']),
        ]
    
    def __str__(self):
        return f"Grid for {self.daily_log}"
    
    @property
    def grid_array(self):
        """Convert grid data string to array."""
        if not self.grid_data:
            return ['off_duty'] * self.grid_slots
        return self.grid_data.split(',')
    
    @grid_array.setter
    def grid_array(self, value):
        """Convert array to grid data string."""
        self.grid_data = ','.join(value)
    
    def generate_grid(self):
        """Generate grid data from daily log entries."""
        grid = ['off_duty'] * self.grid_slots
        
        for entry in self.daily_log.entries.all():
            start_slot = self._time_to_slot(entry.start_time)
            end_slot = self._time_to_slot(entry.end_time)
            
            # Handle overnight entries
            if end_slot <= start_slot:
                end_slot = self.grid_slots
            
            # Fill grid slots
            for slot in range(start_slot, end_slot):
                if slot < self.grid_slots:
                    grid[slot] = entry.status
        
        self.grid_array = grid
        self.save()
    
    def _time_to_slot(self, time_obj):
        """Convert time to grid slot index."""
        if not time_obj:
            return 0
        
        total_minutes = time_obj.hour * 60 + time_obj.minute
        return min(total_minutes // self.minutes_per_slot, self.grid_slots - 1)
    
    def _slot_to_time(self, slot):
        """Convert grid slot to time."""
        total_minutes = slot * self.minutes_per_slot
        hours = total_minutes // 60
        minutes = total_minutes % 60
        return time(hour=hours, minute=minutes)
