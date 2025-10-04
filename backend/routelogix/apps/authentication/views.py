"""
Authentication views for RouteLogix ELD system.
"""

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
import json
import logging

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """
    Handle user login and token generation.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            data = json.loads(request.body) if isinstance(request.body, bytes) else request.data
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return Response({
                    'error': 'Username and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Authenticate user
            user = authenticate(username=username, password=password)
            
            if user and user.is_active:
                # Create or get token
                token, created = Token.objects.get_or_create(user=user)
                
                # Create login session record
                from .models import LoginSession
                login_session = LoginSession.objects.create(
                    user=user,
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                )
                
                # Get user profile
                profile = getattr(user, 'profile', None)
                
                return Response({
                    'token': token.key,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'user_type': profile.user_type if profile else 'driver',
                        'is_active_driver': profile.is_active_driver if profile else True,
                    },
                    'session_id': str(login_session.id),
                    'message': 'Login successful'
                }, status=status.HTTP_200_OK)
            
            else:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        
        except json.JSONDecodeError:
            return Response({
                'error': 'Invalid JSON data'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({
                'error': 'Login failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_client_ip(self, request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    """
    Handle user logout and token cleanup.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Get session ID if provided
            session_id = request.data.get('session_id')
            
            if session_id:
                from .models import LoginSession
                try:
                    session = LoginSession.objects.get(id=session_id, user=request.user)
                    session.logout()
                except LoginSession.DoesNotExist:
                    pass
            
            # Delete the token
            try:
                token = Token.objects.get(user=request.user)
                token.delete()
            except Token.DoesNotExist:
                pass
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response({
                'error': 'Logout failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """
    Get current user profile information.
    """
    try:
        user = request.user
        profile = getattr(user, 'profile', None)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'user_type': profile.user_type if profile else 'driver',
                'is_active_driver': profile.is_active_driver if profile else True,
                'phone': profile.phone if profile else '',
                'timezone': profile.timezone if profile else 'UTC',
                'language': profile.language if profile else 'en',
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Profile fetch error: {str(e)}")
        return Response({
            'error': 'Failed to fetch profile'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_admin_user(request):
    """
    Create the default admin user (username: admin, password: 123).
    This is for development purposes only.
    """
    try:
        # Check if admin user already exists
        if User.objects.filter(username='admin').exists():
            return Response({
                'message': 'Admin user already exists'
            }, status=status.HTTP_200_OK)
        
        # Create admin user
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@routelogix.com',
            password='123',
            first_name='Admin',
            last_name='User',
            is_staff=True,
            is_superuser=True
        )
        
        # Create profile
        from .models import UserProfile
        UserProfile.objects.create(
            user=admin_user,
            user_type='admin',
            phone='',
            is_active_driver=True
        )
        
        logger.info("Admin user created successfully")
        
        return Response({
            'message': 'Admin user created successfully',
            'username': 'admin',
            'password': '123'  # Only for development!
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        logger.error(f"Admin user creation error: {str(e)}")
        return Response({
            'error': 'Failed to create admin user'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def login_sessions(request):
    """
    Get current user's login sessions.
    """
    try:
        from .models import LoginSession
        sessions = LoginSession.objects.filter(user=request.user).order_by('-login_time')[:10]
        
        session_data = []
        for session in sessions:
            session_data.append({
                'id': str(session.id),
                'login_time': session.login_time.isoformat(),
                'logout_time': session.logout_time.isoformat() if session.logout_time else None,
                'is_active': session.is_active,
                'ip_address': session.ip_address,
                'device_type': session.device_type,
                'location': session.location,
                'duration': str(session.duration) if session.logout_time else None
            })
        
        return Response({
            'sessions': session_data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Sessions fetch error: {str(e)}")
        return Response({
            'error': 'Failed to fetch sessions'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
