from django.apps import AppConfig


class TripsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'routelogix.apps.trips'
    verbose_name = 'Trip Planning'
    
    def ready(self):
        import routelogix.apps.trips.signals
