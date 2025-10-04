"""
Authentication models for RouteLogix ELD system.
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class UserProfile(models.Model):
    """
    Extended user profile for RouteLogix drivers and administrators.
    """
    USER_TYPES = [
        ('driver', 'Driver'),
        ('admin', 'Administrator'),
        ('fleet_manager', 'Fleet Manager'),
        ('dispatcher', 'Dispatcher'),
    ]
    
    # Primary fields
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='driver')
    
    # Driver information
    driver_license = models.CharField(max_length=50, blank=True, help_text="Driver's license number")
    cdl_number = models.CharField(max_length=50, blank=True, help_text="Commercial Driver's License number")
    cdl_expiry = models.DateField(null=True, blank=True, help_text="CDL expiration date")
    
    # Contact information
    phone = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    
    # Preferences
    timezone = models.CharField(max_length=50, default='UTC', help_text="User's timezone")
    language = models.CharField(max_length=10, default='en', help_text="Preferred language")
    
    # System settings
    is_active_driver = models.BooleanField(default=True, help_text="Whether user is currently an active driver")
    auto_logout_minutes = models.PositiveIntegerField(default=480, help_text="Auto logout after minutes of inactivity")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user_type', 'is_active_driver']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.get_user_type_display()})"


class LoginSession(models.Model):
    """
    Track user login sessions for security and audit purposes.
    """
    # Primary fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_sessions')
    
    # Session information
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Device/location information
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    device_type = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=255, blank=True)
    
    # Security flags
    is_suspicious = models.BooleanField(default=False)
    failed_attempts = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-login_time']
        indexes = [
            models.Index(fields=['user', '-login_time']),
            models.Index(fields=['is_active', 'is_suspicious']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.login_time.strftime('%Y-%m-%d %H:%M:%S')}"
    
    def logout(self):
        """Mark session as logged out."""
        self.logout_time = timezone.now()
        self.is_active = False
        self.save()
    
    @property
    def duration(self):
        """Calculate session duration."""
        if not self.logout_time:
            return timezone.now() - self.login_time
        return self.logout_time - self.login_time
