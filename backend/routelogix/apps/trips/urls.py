from django.urls import path
from . import views

app_name = 'trips'

urlpatterns = [
    path('trip/plan/', views.plan_trip, name='plan_trip'),
    path('test/', views.test_endpoint, name='test_endpoint'),
]
