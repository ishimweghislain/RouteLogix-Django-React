import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import TripPlanForm from './components/TripPlanForm';
import RouteMap from './components/RouteMap';
import DailyLogSheet from './components/DailyLogSheet';
import { tripAPI } from './services/api';
import { TripPlanRequest, TripPlanResponse, TripLogsResponse } from './types';
import { exportLogsToPDF } from './utils/pdfExport';

function App() {
  const [tripData, setTripData] = useState<TripPlanResponse | null>(null);
  const [logsData, setLogsData] = useState<TripLogsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTripPlan = async (planRequest: TripPlanRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      // Plan the trip
      const response = await tripAPI.planTrip(planRequest);
      setTripData(response);
      
      // Get the logs for the planned trip
      const logsResponse = await tripAPI.getTripLogs(response.trip_id);
      setLogsData(logsResponse);
      
    } catch (err: any) {
      console.error('Error planning trip:', err);
      setError(err.response?.data?.error || 'Failed to plan trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!logsData) return;
    
    try {
      await exportLogsToPDF(logsData);
      // Show success message
      alert('ELD logs exported successfully! Check your downloads folder.');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-gray-900">RouteLogix</h1>
                  <p className="text-sm text-gray-500">ELD & Trip Planning System</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-8">
                <NavLink to="/" label="Plan Trip" />
                <NavLink to="/route" label="Route Map" disabled={!tripData} />
                <NavLink to="/logs" label="Daily Logs" disabled={!tripData} />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
              <button
                onClick={() => setError(null)}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
              >
                <span className="sr-only">Dismiss</span>
                ×
              </button>
            </div>
          )}

          {/* Success Alert */}
          {tripData && !loading && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Trip planned successfully! Distance: {tripData.route.total_distance.toFixed(0)} miles, 
              Estimated time: {tripData.route.estimated_duration.toFixed(1)} hours
            </div>
          )}

          <Routes>
            <Route path="/" element={
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <TripPlanForm onSubmit={handleTripPlan} loading={loading} />
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Overview</h2>
                    {tripData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Route</h3>
                            <p className="text-sm text-gray-900">
                              {tripData.route.current_location} → {tripData.route.pickup_location} → {tripData.route.dropoff_location}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">HOS Cycle</h3>
                            <p className="text-sm text-gray-900">
                              {tripData.hos_compliance.cycle_type === '70_8' ? '70-hour/8-day' : '60-hour/7-day'}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Total Distance</h3>
                            <p className="text-sm text-gray-900">{tripData.route.total_distance.toFixed(0)} miles</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Driving Time</h3>
                            <p className="text-sm text-gray-900">{tripData.route.estimated_duration.toFixed(1)} hours</p>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Quick Stats</h3>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-semibold text-primary-600">
                                {tripData.fuel_stops?.length || 0}
                              </div>
                              <div className="text-xs text-gray-500">Fuel Stops</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-primary-600">
                                {tripData.rest_stops?.length || 0}
                              </div>
                              <div className="text-xs text-gray-500">Rest Periods</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-primary-600">
                                {Math.ceil(tripData.route.estimated_duration / 11) || 1}
                              </div>
                              <div className="text-xs text-gray-500">Est. Days</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🚛</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Trip Planned</h3>
                        <p className="text-gray-500">Fill out the form to plan your trip and see route details</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            } />
            
            <Route path="/route" element={
              <div className="h-[600px]">
                <RouteMap tripData={tripData || undefined} />
              </div>
            } />
            
            <Route path="/logs" element={
              <DailyLogSheet logsData={logsData || undefined} onExportPDF={handleExportPDF} />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Navigation Link Component
function NavLink({ to, label, disabled = false }: { to: string; label: string; disabled?: boolean }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  if (disabled) {
    return (
      <span className="text-gray-400 cursor-not-allowed px-3 py-2 rounded-md text-sm font-medium">
        {label}
      </span>
    );
  }
  
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  );
}

export default App;
