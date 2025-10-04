"""
URL patterns for authentication app.
"""

from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.user_profile, name='user_profile'),
    path('sessions/', views.login_sessions, name='login_sessions'),
    path('create-admin/', views.create_admin_user, name='create_admin_user'),
]
