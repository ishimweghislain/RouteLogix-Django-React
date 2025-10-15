import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
// ...existing code...
import { 
  TruckIcon,
  MapIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
// ...existing code...
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalTrips: 0,
    hoursDrawn: 0,
    milesDriven: 0,
    hosCompliance: 100
  });

  // Load user-specific data when component mounts
  useEffect(() => {
    if (user) {
      // Load user-specific activity from localStorage or API
      const savedActivity = localStorage.getItem(`activity_${user.id}`);
      const savedStats = localStorage.getItem(`stats_${user.id}`);
      
      if (savedActivity) {
        try {
          setUserActivity(JSON.parse(savedActivity));
        } catch (e) {
          console.error('Error parsing saved activity:', e);
        }
      } else {
        // Initialize with welcome activity for new users
        const initialActivity = [
          {
            id: 1,
            type: 'welcome',
            message: `Welcome to RouteLogix, ${user.first_name || user.username}!`,
            time: 'Just now',
            icon: 'user'
          },
          {
            id: 2,
            type: 'tip',
            message: 'Start by planning your first trip',
            time: 'Just now',
            icon: 'truck'
          }
        ];
        setUserActivity(initialActivity);
        localStorage.setItem(`activity_${user.id}`, JSON.stringify(initialActivity));
      }
      
      if (savedStats) {
        try {
          setUserStats(JSON.parse(savedStats));
        } catch (e) {
          console.error('Error parsing saved stats:', e);
        }
      }
    }
  }, [user]);

  const quickActions = [
    {
      name: 'Plan New Trip',
      href: '/dashboard/plan',
      icon: TruckIcon,
      color: 'bg-blue-500',
      description: 'Create a new HOS compliant trip plan'
    },
    {
      name: 'View Route Map',
      href: '/dashboard/route',
      icon: MapIcon,
      color: 'bg-green-500',
      description: 'Interactive maps and route visualization'
    },
    {
      name: 'Daily Logs',
      href: '/dashboard/logs',
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500',
      description: 'ELD compliance and logbook entries'
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      description: 'Trip statistics and performance reports'
    }
  ];

  const stats = [
    {
      name: 'Total Trips',
      value: userStats.totalTrips.toString(),
      icon: TruckIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      name: 'Hours Driven',
      value: `${userStats.hoursDrawn}h`,
      icon: ClockIcon,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      name: 'Miles Driven',
      value: userStats.milesDriven.toLocaleString(),
      icon: CalendarDaysIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      name: 'HOS Compliance',
      value: `${userStats.hosCompliance}%`,
      icon: UserGroupIcon,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.first_name || user?.username}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to plan your next journey? Your RouteLogix dashboard is here to help.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 p-4 rounded-xl">
              <TruckIcon className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={action.href}
                className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${action.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {action.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-xl`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {userActivity.length > 0 ? (
            userActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="bg-blue-100 p-2 rounded-full">
                  {activity.icon === 'truck' && <TruckIcon className="h-5 w-5 text-blue-600" />}
                  {activity.icon === 'user' && <UserCircleIcon className="h-5 w-5 text-green-600" />}
                  {activity.icon === 'log' && <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />}
                  {activity.icon === 'map' && <MapIcon className="h-5 w-5 text-orange-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{activity.message}</p>
                  <p className="text-gray-500 text-sm">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📋</div>
              <p className="text-gray-500">No recent activity yet</p>
              <p className="text-gray-400 text-sm">Start using RouteLogix to see your activity here</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Getting Started */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">New to RouteLogix?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Learn how to plan your first trip and use our ELD compliance features.
            </p>
            <Link 
              to="/dashboard/plan" 
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              Plan Your First Trip
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Contact our support team or view the user documentation.
            </p>
            <div className="flex space-x-4">
              <a 
                href="mailto:ishimweghislain82@gmail.com" 
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm"
              >
                Email Support
              </a>
              <a 
                href="tel:+250781262526" 
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm"
              >
                Call Support
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;