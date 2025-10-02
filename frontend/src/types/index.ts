export interface Trip {
  id: number;
  current_location: string;
  current_lat: number;
  current_lng: number;
  pickup_location: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_location: string;
  dropoff_lat: number;
  dropoff_lng: number;
  cycle_type: '70_8' | '60_7';
  total_distance?: number;
  estimated_duration?: number;
  created_at: string;
  updated_at: string;
}

export interface RouteStop {
  id: number;
  trip: number;
  stop_type: 'fuel' | 'rest' | 'break' | 'pickup' | 'dropoff';
  location: string;
  latitude: number;
  longitude: number;
  distance_from_start: number;
  estimated_arrival?: string;
  order: number;
}

export interface TripPlanRequest {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_type: '70_8' | '60_7';
  current_lat?: number;
  current_lng?: number;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
}

export interface TripPlanResponse {
  trip_id: number;
  route: {
    current_location: string;
    pickup_location: string;
    dropoff_location: string;
    total_distance: number;
    estimated_duration: number;
  };
  schedule: {
    trip_distance: number;
    total_driving_hours: number;
    start_time: string;
    driving_periods: DrivingPeriod[];
    break_periods: BreakPeriod[];
    rest_periods: RestPeriod[];
    daily_logs: DailyLogData[];
    estimated_completion: string;
    fuel_stops: FuelStop[];
  };
  hos_compliance: {
    cycle_type: string;
    max_cycle_hours: number;
    violations: any[];
  };
  fuel_stops: FuelStop[];
  rest_stops: RestPeriod[];
}

export interface DrivingPeriod {
  type: 'driving';
  start_time: string;
  end_time: string;
  duration_hours: number;
  distance_miles: number;
  start_mile: number;
  end_mile: number;
}

export interface BreakPeriod {
  type: 'break_30min';
  start_time: string;
  end_time: string;
  duration_hours: number;
  location: string;
}

export interface RestPeriod {
  type: 'rest';
  start_time: string;
  end_time: string;
  duration_hours: number;
  location: string;
}

export interface FuelStop {
  type: 'fuel';
  mile: number;
  time: string;
  location: string;
}

export interface DailyLogData {
  date: string;
  entries: LogEntryData[];
  total_driving_time: number;
  total_on_duty_time: number;
  total_sleeper_time: number;
  total_off_duty_time: number;
}

export interface LogEntryData {
  status: 'off_duty' | 'sleeper' | 'driving' | 'on_duty';
  start_time: string;
  end_time: string;
}

export interface DailyLog {
  id: number;
  trip: number;
  user?: number;
  log_date: string;
  total_driving_time: number;
  total_on_duty_time: number;
  total_sleeper_time: number;
  total_off_duty_time: number;
  cycle_hours_used: number;
  created_at: string;
  updated_at: string;
  entries: LogEntry[];
  violations: HOSViolation[];
}

export interface LogEntry {
  id: number;
  daily_log: number;
  status: 'off_duty' | 'sleeper' | 'driving' | 'on_duty';
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location: string;
  remarks: string;
  is_automatic: boolean;
}

export interface HOSViolation {
  id: number;
  daily_log: number;
  violation_type: string;
  description: string;
  severity: 'warning' | 'violation' | 'critical';
  created_at: string;
}

export interface LogGrid {
  date: string;
  grid: string[];
  grid_slots: number;
  minutes_per_slot: number;
  entries: LogEntry[];
  total_driving_time: number;
  total_on_duty_time: number;
  total_sleeper_time: number;
  total_off_duty_time: number;
}

export interface TripLogsResponse {
  trip_id: number;
  daily_logs: DailyLog[];
  log_grids: LogGrid[];
  hos_summary: {
    trip_duration_days: number;
    total_driving_hours: number;
    total_on_duty_hours: number;
    cycle_hours_used: number;
    cycle_hours_remaining: number;
    cycle_type: string;
    max_cycle_hours: number;
  };
  violations: HOSViolation[];
}
