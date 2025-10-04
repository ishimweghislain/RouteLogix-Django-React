from django.apps import AppConfig


class EldConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'routelogix.apps.eld'
    verbose_name = 'Electronic Logging Device'
    
    def ready(self):
        import routelogix.apps.eld.signals
