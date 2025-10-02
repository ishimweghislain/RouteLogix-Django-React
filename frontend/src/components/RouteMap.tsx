import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { TripPlanResponse } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for different stop types
const createIcon = (color: string) => new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.59644 0 0 5.59644 0 12.5C0 19.4036 12.5 41 12.5 41C12.5 41 25 19.4036 25 12.5C25 5.59644 19.4036 0 12.5 0Z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="7.5" fill="white"/>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  shadowSize: [41, 41]
});

const icons = {
  pickup: createIcon('#22c55e'),    // Green
  dropoff: createIcon('#ef4444'),   // Red
  fuel: createIcon('#f59e0b'),      // Orange
  rest: createIcon('#3b82f6'),      // Blue
  break: createIcon('#8b5cf6'),     // Purple
  current: createIcon('#6b7280'),   // Gray
};

interface RouteMapProps {
  tripData?: TripPlanResponse;
  className?: string;
}

const RouteMap: React.FC<RouteMapProps> = ({ tripData, className = '' }) => {
  const defaultCenter: [number, number] = [39.8283, -98.5795]; // Center of US
  const defaultZoom = 4;

  // Calculate route points from trip data
  const getRoutePoints = (): [number, number][] => {
    if (!tripData) return [];

    const points: [number, number][] = [];
    
    // Mock coordinates based on locations (in production, these would come from the backend)
    const locationCoords: { [key: string]: [number, number] } = {
      'new york': [40.7128, -74.0060],
      'chicago': [41.8781, -87.6298],
      'los angeles': [34.0522, -118.2437],
      'dallas': [32.7767, -96.7970],
      'miami': [25.7617, -80.1918],
      'denver': [39.7392, -104.9903],
      'seattle': [47.6062, -122.3321],
    };

    const findCoords = (location: string): [number, number] => {
      const key = location.toLowerCase().replace(/[^a-z]/g, '');
      for (const [city, coords] of Object.entries(locationCoords)) {
        if (key.includes(city.replace(' ', ''))) {
          return coords;
        }
      }
      return defaultCenter;
    };

    // Add current location
    points.push(findCoords(tripData.route.current_location));
    
    // Add pickup location
    points.push(findCoords(tripData.route.pickup_location));
    
    // Add dropoff location
    points.push(findCoords(tripData.route.dropoff_location));

    return points;
  };

  const routePoints = getRoutePoints();
  const mapCenter = routePoints.length > 0 ? routePoints[1] : defaultCenter;

  return (
    <div className={`h-full w-full rounded-lg overflow-hidden ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route polyline */}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Markers for trip data */}
        {tripData && routePoints.length > 0 && (
          <>
            {/* Current location marker */}
            <Marker position={routePoints[0]} icon={icons.current}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">Current Location</h3>
                  <p className="text-sm text-gray-600">{tripData.route.current_location}</p>
                </div>
              </Popup>
            </Marker>

            {/* Pickup location marker */}
            <Marker position={routePoints[1]} icon={icons.pickup}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-green-700">Pickup Location</h3>
                  <p className="text-sm text-gray-600">{tripData.route.pickup_location}</p>
                </div>
              </Popup>
            </Marker>

            {/* Dropoff location marker */}
            <Marker position={routePoints[2]} icon={icons.dropoff}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-red-700">Dropoff Location</h3>
                  <p className="text-sm text-gray-600">{tripData.route.dropoff_location}</p>
                </div>
              </Popup>
            </Marker>

            {/* Fuel stop markers */}
            {tripData.fuel_stops?.map((stop, index) => {
              // Calculate approximate position along route
              const progress = stop.mile / tripData.route.total_distance;
              const lat = routePoints[1][0] + (routePoints[2][0] - routePoints[1][0]) * progress;
              const lng = routePoints[1][1] + (routePoints[2][1] - routePoints[1][1]) * progress;

              return (
                <Marker key={`fuel-${index}`} position={[lat, lng]} icon={icons.fuel}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-orange-700">Fuel Stop</h3>
                      <p className="text-sm text-gray-600">{stop.location}</p>
                      <p className="text-xs text-gray-500">Mile {stop.mile}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Rest stop markers */}
            {tripData.rest_stops?.map((stop, index) => {
              // Calculate approximate position along route
              const progress = 0.3 + (index * 0.4); // Spread rest stops along route
              const lat = routePoints[1][0] + (routePoints[2][0] - routePoints[1][0]) * progress;
              const lng = routePoints[1][1] + (routePoints[2][1] - routePoints[1][1]) * progress;

              return (
                <Marker key={`rest-${index}`} position={[lat, lng]} icon={icons.rest}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-blue-700">
                        {stop.duration_hours >= 8 ? 'Rest Period' : 'Break'}
                      </h3>
                      <p className="text-sm text-gray-600">{stop.location}</p>
                      <p className="text-xs text-gray-500">
                        {stop.duration_hours}h {stop.duration_hours >= 8 ? 'rest' : 'break'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        )}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10 text-xs">
        <h4 className="font-semibold mb-2">Map Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span>Current Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Pickup</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Dropoff</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span>Fuel Stop</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Rest/Break</span>
          </div>
        </div>
      </div>

      {/* Trip info overlay */}
      {tripData && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-10">
          <h4 className="font-semibold text-sm mb-2">Trip Summary</h4>
          <div className="text-xs space-y-1">
            <p><span className="font-medium">Distance:</span> {tripData.route.total_distance.toFixed(0)} miles</p>
            <p><span className="font-medium">Driving Time:</span> {tripData.route.estimated_duration.toFixed(1)} hours</p>
            <p><span className="font-medium">HOS Cycle:</span> {tripData.hos_compliance.cycle_type === '70_8' ? '70hr/8day' : '60hr/7day'}</p>
            <p><span className="font-medium">Fuel Stops:</span> {tripData.fuel_stops?.length || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
