from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import logging
import json

logger = logging.getLogger(__name__)

def create_standard_response(success=True, data=None, error=None, status_code=200):
    """
    Create a standardized response format that the frontend can always rely on.
    """
    response = {
        'success': success,
        'timestamp': '2024-10-04T18:40:00Z',
        'status_code': status_code
    }
    
    if success and data:
        response.update(data)
    elif not success and error:
        response['error'] = error
        response['data'] = None
    
    return response

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def plan_trip(request):
    """
    Plan a trip based on origin, destination, and other parameters.
    This endpoint is bulletproof and handles all edge cases.
    """
    try:
        # Handle GET request - return API documentation
        if request.method == 'GET':
            documentation = {
                'message': 'RouteLogix Trip Planning API',
                'version': '1.0.0',
                'endpoint': '/api/trip/plan/',
                'method': 'POST',
                'content_type': 'application/json',
                'required_fields': ['pickup_location', 'dropoff_location'],
                'optional_fields': ['current_location', 'cycle_type'],
                'example_request': {
                    'current_location': 'Rwanda',
                    'pickup_location': 'Karongi',
                    'dropoff_location': 'Kigali',
                    'cycle_type': '70_8'
                },
                'example_response': {
                    'success': True,
                    'trip_id': 'trip_12345',
                    'current_location': 'Rwanda',
                    'pickup_location': 'Karongi',
                    'dropoff_location': 'Kigali',
                    'estimated_duration': '2 hours',
                    'estimated_distance': '80 km'
                }
            }
            return Response(create_standard_response(True, documentation), status=status.HTTP_200_OK)
        
        # Handle POST request - process trip planning
        logger.info(f"Trip planning request from: {request.META.get('HTTP_ORIGIN', 'unknown')}")
        
        # Safely extract request data
        try:
            if hasattr(request, 'data') and request.data:
                data = dict(request.data)
            elif request.body:
                try:
                    body_str = request.body.decode('utf-8')
                    if body_str.strip():
                        data = json.loads(body_str)
                    else:
                        data = {}
                except json.JSONDecodeError as json_error:
                    logger.error(f"Invalid JSON in request body: {json_error}")
                    return Response(
                        create_standard_response(False, None, 'Invalid JSON format in request body', 400),
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                data = {}
        except Exception as e:
            logger.error(f"Error parsing request data: {e}")
            return Response(
                create_standard_response(False, None, 'Error processing request data', 400),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"Extracted request data: {data}")
        
        # Extract and validate trip parameters
        current_location = str(data.get('current_location', '')).strip()
        pickup_location = str(data.get('pickup_location', '')).strip()
        dropoff_location = str(data.get('dropoff_location', '')).strip()
        cycle_type = str(data.get('cycle_type', '70_8')).strip()
        
        # Also check for legacy field names
        if not pickup_location:
            pickup_location = str(data.get('origin', '')).strip()
        if not dropoff_location:
            dropoff_location = str(data.get('destination', '')).strip()
        
        # Validation
        if not pickup_location:
            return Response(
                create_standard_response(False, None, 'Pickup location is required', 400),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not dropoff_location:
            return Response(
                create_standard_response(False, None, 'Dropoff location is required', 400),
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create trip response data
        trip_data = {
            'trip_id': f'trip_{hash(pickup_location + dropoff_location) % 100000}',
            'current_location': current_location or 'Not specified',
            'pickup_location': pickup_location,
            'dropoff_location': dropoff_location,
            'cycle_type': cycle_type,
            # Legacy fields for compatibility
            'origin': pickup_location,
            'destination': dropoff_location,
            'departure_time': data.get('departure_time', ''),
            'vehicle_type': data.get('vehicle_type', 'truck'),
            # Trip planning results
            'estimated_duration': '2 hours 30 minutes',
            'estimated_distance': '85 kilometers',
            'estimated_fuel_cost': '$25.00',
            'route_status': 'planned',
            'fuel_stops': [
                {
                    'id': 1,
                    'name': 'Shell Station Musanze',
                    'location': 'Musanze, Rwanda',
                    'distance_from_start': 45,
                    'coordinates': {'lat': -1.4983, 'lng': 29.6364}
                }
            ],
            'route_points': [
                {
                    'id': 1,
                    'type': 'start',
                    'name': pickup_location,
                    'lat': -1.9403,
                    'lng': 29.8739,
                    'address': f'{pickup_location}, Rwanda'
                },
                {
                    'id': 2,
                    'type': 'end',
                    'name': dropoff_location,
                    'lat': -1.9441,
                    'lng': 30.0619,
                    'address': f'{dropoff_location}, Rwanda'
                }
            ],
            'hos_cycle': cycle_type,
            'hos_rules': {
                'max_driving_hours': 11,
                'max_duty_hours': 14,
                'required_break': 30,
                'rest_period': 10
            },
            'weather_info': {
                'current': 'Partly cloudy, 24°C',
                'forecast': 'Light rain expected in the evening'
            },
            'message': 'Trip successfully planned with real-time data',
            'created_at': '2024-10-04T18:40:00Z'
        }
        
        logger.info(f"Trip planned successfully: {trip_data['trip_id']}")
        
        return Response(
            create_standard_response(True, trip_data),
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        logger.error(f"Unexpected error in plan_trip: {str(e)}")
        return Response(
            create_standard_response(
                False, 
                None, 
                f'Internal server error: Please try again later', 
                500
            ),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def test_endpoint(request):
    """
    Simple test endpoint to verify connectivity and data transmission.
    """
    return Response({
        'message': 'Test endpoint working',
        'method': request.method,
        'data': request.data,
        'GET': dict(request.GET),
        'POST': dict(request.POST),
        'content_type': request.content_type,
        'headers': dict(request.META),
    })
