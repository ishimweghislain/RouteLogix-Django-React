import React, { useState } from 'react';
import { TripPlanRequest } from '../types';

interface TripPlanFormProps {
  onSubmit: (data: TripPlanRequest) => void;
  loading?: boolean;
}

const TripPlanForm: React.FC<TripPlanFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<TripPlanRequest>({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    cycle_type: '70_8',
  });

  const [errors, setErrors] = useState<Partial<TripPlanRequest>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof TripPlanRequest]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TripPlanRequest> = {};

    if (!formData.current_location.trim()) {
      newErrors.current_location = 'Current location is required';
    }

    if (!formData.pickup_location.trim()) {
      newErrors.pickup_location = 'Pickup location is required';
    }

    if (!formData.dropoff_location.trim()) {
      newErrors.dropoff_location = 'Dropoff location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan Your Trip</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Location */}
        <div>
          <label htmlFor="current_location" className="block text-sm font-medium text-gray-700 mb-2">
            Current Location *
          </label>
          <input
            type="text"
            id="current_location"
            name="current_location"
            value={formData.current_location}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.current_location ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., New York, NY"
            disabled={loading}
          />
          {errors.current_location && (
            <p className="mt-1 text-sm text-red-600">{errors.current_location}</p>
          )}
        </div>

        {/* Pickup Location */}
        <div>
          <label htmlFor="pickup_location" className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Location *
          </label>
          <input
            type="text"
            id="pickup_location"
            name="pickup_location"
            value={formData.pickup_location}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.pickup_location ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Chicago, IL"
            disabled={loading}
          />
          {errors.pickup_location && (
            <p className="mt-1 text-sm text-red-600">{errors.pickup_location}</p>
          )}
        </div>

        {/* Dropoff Location */}
        <div>
          <label htmlFor="dropoff_location" className="block text-sm font-medium text-gray-700 mb-2">
            Dropoff Location *
          </label>
          <input
            type="text"
            id="dropoff_location"
            name="dropoff_location"
            value={formData.dropoff_location}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.dropoff_location ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Los Angeles, CA"
            disabled={loading}
          />
          {errors.dropoff_location && (
            <p className="mt-1 text-sm text-red-600">{errors.dropoff_location}</p>
          )}
        </div>

        {/* Cycle Type */}
        <div>
          <label htmlFor="cycle_type" className="block text-sm font-medium text-gray-700 mb-2">
            Hours of Service Cycle *
          </label>
          <select
            id="cycle_type"
            name="cycle_type"
            value={formData.cycle_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={loading}
          >
            <option value="70_8">70-hour/8-day cycle</option>
            <option value="60_7">60-hour/7-day cycle</option>
          </select>
        </div>

        {/* Advanced Options (Optional GPS Coordinates) */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-primary-600">
            Advanced Options (GPS Coordinates)
          </summary>
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
            {/* Current Location Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="current_lat" className="block text-xs font-medium text-gray-600 mb-1">
                  Current Latitude
                </label>
                <input
                  type="number"
                  id="current_lat"
                  name="current_lat"
                  value={formData.current_lat || ''}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="40.7128"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="current_lng" className="block text-xs font-medium text-gray-600 mb-1">
                  Current Longitude
                </label>
                <input
                  type="number"
                  id="current_lng"
                  name="current_lng"
                  value={formData.current_lng || ''}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="-74.0060"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Pickup Location Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pickup_lat" className="block text-xs font-medium text-gray-600 mb-1">
                  Pickup Latitude
                </label>
                <input
                  type="number"
                  id="pickup_lat"
                  name="pickup_lat"
                  value={formData.pickup_lat || ''}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="41.8781"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="pickup_lng" className="block text-xs font-medium text-gray-600 mb-1">
                  Pickup Longitude
                </label>
                <input
                  type="number"
                  id="pickup_lng"
                  name="pickup_lng"
                  value={formData.pickup_lng || ''}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="-87.6298"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Dropoff Location Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dropoff_lat" className="block text-xs font-medium text-gray-600 mb-1">
                  Dropoff Latitude
                </label>
                <input
                  type="number"
                  id="dropoff_lat"
                  name="dropoff_lat"
                  value={formData.dropoff_lat || ''}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="34.0522"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="dropoff_lng" className="block text-xs font-medium text-gray-600 mb-1">
                  Dropoff Longitude
                </label>
                <input
                  type="number"
                  id="dropoff_lng"
                  name="dropoff_lng"
                  value={formData.dropoff_lng || ''}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="-118.2437"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </details>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Planning Trip...
              </div>
            ) : (
              'Plan Trip'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TripPlanForm;
