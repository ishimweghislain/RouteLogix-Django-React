import axios from 'axios';
import { TripPlanRequest, TripPlanResponse, TripLogsResponse } from '../types';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Transform backend response to frontend expected format
const transformTripPlanResponse = (backendData: any): TripPlanResponse => {
  return {
    trip_id: backendData.trip_id || 1,
    route: {
      current_location: backendData.current_location || '',
      pickup_location: backendData.pickup_location || '',
      dropoff_location: backendData.dropoff_location || '',
      total_distance: parseFloat(backendData.estimated_distance?.replace(/[^\d.]/g, '') || '0'),
      estimated_duration: parseFloat(backendData.estimated_duration?.replace(/[^\d.]/g, '') || '0'),
    },
    schedule: {
      trip_distance: parseFloat(backendData.estimated_distance?.replace(/[^\d.]/g, '') || '0'),
      total_driving_hours: parseFloat(backendData.estimated_duration?.replace(/[^\d.]/g, '') || '0'),
      start_time: new Date().toISOString(),
      driving_periods: [],
      break_periods: [],
      rest_periods: [],
      daily_logs: [],
      estimated_completion: new Date(Date.now() + parseFloat(backendData.estimated_duration?.replace(/[^\d.]/g, '') || '0') * 3600000).toISOString(),
      fuel_stops: backendData.fuel_stops?.map((stop: any, index: number) => ({
        type: 'fuel' as const,
        mile: stop.distance_from_start || index * 100,
        time: new Date(Date.now() + (index + 1) * 3600000).toISOString(),
        location: stop.name || stop.location || `Fuel Stop ${index + 1}`,
      })) || [],
    },
    hos_compliance: {
      cycle_type: backendData.cycle_type || '70_8',
      max_cycle_hours: backendData.cycle_type === '60_7' ? 60 : 70,
      violations: [],
    },
    fuel_stops: backendData.fuel_stops?.map((stop: any, index: number) => ({
      type: 'fuel' as const,
      mile: stop.distance_from_start || index * 100,
      time: new Date(Date.now() + (index + 1) * 3600000).toISOString(),
      location: stop.name || stop.location || `Fuel Stop ${index + 1}`,
    })) || [],
    rest_stops: [],
  };
};

export const tripAPI = {
  // Plan a new trip
  planTrip: async (data: TripPlanRequest): Promise<TripPlanResponse> => {
    console.log('🚀 Sending trip plan request:', data);
    
    try {
      const response = await api.post('/api/trip/plan/', data);
      console.log('✅ Backend response received:', response.data);
      
      const transformedData = transformTripPlanResponse(response.data);
      console.log('🔄 Transformed data for frontend:', transformedData);
      
      return transformedData;
    } catch (error: any) {
      console.error('❌ Trip plan API error:', error);
      
      // Enhanced error handling
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.error || 'Invalid trip data provided');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw error;
    }
  },

  // Get trip logs
  getTripLogs: async (tripId: number): Promise<TripLogsResponse> => {
    console.log('📋 Fetching trip logs for trip ID:', tripId);
    
    try {
      const response = await api.get(`/api/trip/${tripId}/logs/`);
      return response.data;
    } catch (error: any) {
      console.warn('⚠️ Trip logs endpoint not implemented yet, returning mock data');
      
      // Return mock data for now
      return {
        trip_id: tripId,
        daily_logs: [],
        log_grids: [],
        hos_summary: {
          trip_duration_days: 1,
          total_driving_hours: 8,
          total_on_duty_hours: 10,
          cycle_hours_used: 10,
          cycle_hours_remaining: 60,
          cycle_type: '70_8',
          max_cycle_hours: 70,
        },
        violations: [],
      };
    }
  },

  // Export logs as PDF
  exportLogsPDF: async (tripId: number): Promise<{ download_url: string }> => {
    const response = await api.get(`/api/trip/${tripId}/logs/export/pdf/`);
    return response.data;
  },

  // Add manual log entry
  addLogEntry: async (tripId: number, logEntry: {
    date: string;
    status: string;
    start_time: string;
    end_time: string;
    location?: string;
    remarks?: string;
  }) => {
    const response = await api.post(`/api/trip/${tripId}/logs/add/`, logEntry);
    return response.data;
  },

  // Get all trips
  getTrips: async () => {
    const response = await api.get('/api/trips/');
    return response.data;
  },

  // Get single trip
  getTrip: async (tripId: number) => {
    const response = await api.get(`/api/trips/${tripId}/`);
    return response.data;
  },
};

export default api;
