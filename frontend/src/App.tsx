import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import WelcomePage from './components/WelcomePage';
import Dashboard from './components/Dashboard';
import TripPlanForm from './components/TripPlanForm';
import RouteMap from './components/RouteMap';
import DailyLogSheet from './components/DailyLogSheet';
import UserProfile from './components/UserProfile';
import Sidebar from './components/Sidebar';
import NotificationToast from './components/NotificationToast';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { tripAPI } from './services/api';
import { TripPlanRequest, TripPlanResponse, TripLogsResponse } from './types';
import { exportLogsToPDF } from './utils/pdfExport';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tripData, setTripData] = useState<TripPlanResponse | null>(null);
  const [logsData, setLogsData] = useState<TripLogsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTripPlan = async (planRequest: TripPlanRequest) => {
    setLoading(true);
    setError(null);
    setTripData(null);
    setLogsData(null);
    
    try {
      const response = await tripAPI.planTrip(planRequest);
      
      if (response && response.trip_id) {
        setTripData(response);
        
        try {
          const logsResponse = await tripAPI.getTripLogs(response.trip_id);
          setLogsData(logsResponse);
        } catch (logsError) {
          console.warn('Could not fetch trip logs:', logsError);
        }
      }
    } catch (err: any) {
      console.error('Error planning trip:', err);
      setError('Failed to plan trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!logsData) return;
    
    try {
      await exportLogsToPDF(logsData);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
  };

  const handleLogin = () => {
    // This will be called after successful login
    console.log('User logged in successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading RouteLogix...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <WelcomePage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 lg:pl-0">
        {/* Top Header for mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">RouteLogix</h1>
          <motion.button
            onClick={() => setSidebarOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Bars3Icon className="h-6 w-6 text-gray-600" />
          </motion.button>
        </div>

        {/* Desktop sidebar toggle */}
        <div className="hidden lg:block">
          <motion.button
            onClick={() => setSidebarOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed top-4 left-4 z-30 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border"
          >
            <Bars3Icon className="h-6 w-6 text-gray-600" />
          </motion.button>
        </div>

        {/* Routes */}
        <main className="p-4 lg:p-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/plan" element={
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <TripPlanForm onSubmit={handleTripPlan} loading={loading} />
                  </div>
                  <div className="lg:col-span-2">
                    <div className="bg-white shadow-xl rounded-2xl p-6">
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
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-gray-400 text-6xl mb-4">🚛</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Trip Planned</h3>
                          <p className="text-gray-500">Fill out the form to plan your trip</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/dashboard/route" element={
              <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden" style={{ height: '600px' }}>
                  <RouteMap tripData={tripData || undefined} />
                </div>
              </div>
            } />
            <Route path="/dashboard/logs" element={
              <div className="max-w-7xl mx-auto">
                <DailyLogSheet logsData={logsData || undefined} onExportPDF={handleExportPDF} />
              </div>
            } />
            <Route path="/dashboard/analytics" element={
              <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h2>
                  <p className="text-gray-600">Trip statistics and reports coming soon...</p>
                </div>
              </div>
            } />
            <Route path="/dashboard/profile" element={<UserProfile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <NotificationToast />
      </Router>
    </AuthProvider>
  );
}

export default App;
