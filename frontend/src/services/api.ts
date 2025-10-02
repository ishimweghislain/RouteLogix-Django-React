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

export const tripAPI = {
  // Plan a new trip
  planTrip: async (data: TripPlanRequest): Promise<TripPlanResponse> => {
    const response = await api.post('/api/trip/plan/', data);
    return response.data;
  },

  // Get trip logs
  getTripLogs: async (tripId: number): Promise<TripLogsResponse> => {
    const response = await api.get(`/api/trip/${tripId}/logs/`);
    return response.data;
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
