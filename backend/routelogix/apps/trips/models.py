"""
Trip planning models for RouteLogix ELD system.
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from datetime import datetime, timedelta


class Trip(models.Model):
    """
    Main trip model containing route information and HOS cycle settings.
    """
    CYCLE_CHOICES = [
        ('70_8', '70-hour/8-day cycle'),
        ('60_7', '60-hour/7-day cycle'),
    ]
    
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    
    # Route information
    current_location = models.CharField(max_length=255, help_text="Starting location address")
    current_lat = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    current_lng = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    pickup_location = models.CharField(max_length=255, help_text="Pickup location address")
    pickup_lat = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    pickup_lng = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    dropoff_location = models.CharField(max_length=255, help_text="Dropoff location address")
    dropoff_lat = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    dropoff_lng = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    # Trip details
    total_distance = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Total distance in miles"
    )
    estimated_duration = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Estimated driving duration in hours"
    )
    
    # HOS configuration
    cycle_type = models.CharField(max_length=10, choices=CYCLE_CHOICES, default='70_8')
    
    # Timing
    planned_start_time = models.DateTimeField(null=True, blank=True)
    actual_start_time = models.DateTimeField(null=True, blank=True)
    estimated_completion = models.DateTimeField(null=True, blank=True)
    actual_completion = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"Trip {str(self.id)[:8]} - {self.current_location} → {self.dropoff_location}"
    
    @property
    def duration_days(self):
        """Calculate estimated trip duration in days."""
        if not self.estimated_duration:
            return 1
        # Assume 11 hours of driving per day max
        return max(1, (self.estimated_duration / 11).as_integer_ratio()[0])
    
    @property
    def cycle_hours_limit(self):
        """Get the cycle hour limit based on cycle type."""
        return 70 if self.cycle_type == '70_8' else 60
    
    @property
    def cycle_days_limit(self):
        """Get the cycle days limit based on cycle type."""
        return 8 if self.cycle_type == '70_8' else 7


class RouteStop(models.Model):
    """
    Individual stops along the route (fuel, rest, breaks, pickup/dropoff).
    """
    STOP_TYPES = [
        ('current', 'Current Location'),
        ('pickup', 'Pickup Location'),
        ('dropoff', 'Dropoff Location'),
        ('fuel', 'Fuel Stop'),
        ('rest', 'Rest Stop'),
        ('break', '30-min Break'),
        ('customs', 'Customs/Border'),
        ('weigh_station', 'Weigh Station'),
    ]
    
    # Primary fields
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='route_stops')
    stop_type = models.CharField(max_length=20, choices=STOP_TYPES)
    
    # Location information
    location = models.CharField(max_length=255, help_text="Stop location address or description")
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    
    # Route position
    distance_from_start = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Distance from trip start in miles"
    )
    order = models.PositiveIntegerField(help_text="Order of stop in the route")
    
    # Timing information
    estimated_arrival = models.DateTimeField(null=True, blank=True)
    actual_arrival = models.DateTimeField(null=True, blank=True)
    estimated_departure = models.DateTimeField(null=True, blank=True)
    actual_departure = models.DateTimeField(null=True, blank=True)
    
    # Stop-specific details
    duration_minutes = models.PositiveIntegerField(
        default=0,
        validators=[MaxValueValidator(1440)],  # Max 24 hours
        help_text="Planned duration of stop in minutes"
    )
    
    # Additional information
    notes = models.TextField(blank=True, help_text="Additional notes about this stop")
    is_mandatory = models.BooleanField(default=True, help_text="Whether this stop is mandatory for HOS compliance")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['trip', 'order']
        unique_together = [['trip', 'order']]
        indexes = [
            models.Index(fields=['trip', 'order']),
            models.Index(fields=['trip', 'stop_type']),
        ]
    
    def __str__(self):
        return f"{self.get_stop_type_display()} - {self.location} (Mile {self.distance_from_start})"
    
    @property
    def duration_hours(self):
        """Convert duration from minutes to hours."""
        return self.duration_minutes / 60.0


class TripSettings(models.Model):
    """
    Custom settings and preferences for a specific trip.
    """
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='settings')
    
    # Driver preferences
    average_speed_mph = models.PositiveIntegerField(
        default=65,
        validators=[MinValueValidator(30), MaxValueValidator(80)],
        help_text="Average driving speed in mph"
    )
    fuel_efficiency_mpg = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=6.5,
        validators=[MinValueValidator(4.0), MaxValueValidator(12.0)],
        help_text="Truck fuel efficiency in mpg"
    )
    fuel_tank_capacity = models.PositiveIntegerField(
        default=300,
        validators=[MinValueValidator(100), MaxValueValidator(500)],
        help_text="Fuel tank capacity in gallons"
    )
    
    # HOS preferences
    preferred_rest_duration = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(8), MaxValueValidator(24)],
        help_text="Preferred rest period duration in hours"
    )
    max_daily_driving = models.PositiveIntegerField(
        default=11,
        validators=[MinValueValidator(8), MaxValueValidator(11)],
        help_text="Maximum daily driving hours"
    )
    
    # Route preferences
    avoid_tolls = models.BooleanField(default=False)
    avoid_highways = models.BooleanField(default=False)
    hazmat_restrictions = models.BooleanField(default=False)
    
    # Notification preferences
    break_reminders = models.BooleanField(default=True)
    hos_warnings = models.BooleanField(default=True)
    fuel_stop_alerts = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Settings for {self.trip}"
