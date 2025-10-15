import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  TruckIcon,
  MapIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'Overview and quick actions'
    },
    {
      name: 'Plan Trip',
      href: '/dashboard/plan',
      icon: TruckIcon,
      description: 'Create new trip plans'
    },
    {
      name: 'Route Map',
      href: '/dashboard/route',
      icon: MapIcon,
      description: 'View trip routes and maps'
    },
    {
      name: 'Daily Logs',
      href: '/dashboard/logs',
      icon: ClipboardDocumentListIcon,
      description: 'ELD compliance logs'
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: ChartBarIcon,
      description: 'Trip statistics and reports'
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserCircleIcon,
      description: 'Account settings and profile'
    }
  ];

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  const backdropVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <TruckIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">RouteLogix</h1>
                    <p className="text-blue-100 text-sm">ELD & Trip Planning</p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="lg:hidden bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              
              {/* User Info */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <UserCircleIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {user?.first_name && user?.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user?.username || 'User'}
                    </p>
                    <p className="text-blue-100 text-sm">
                      {user?.user_type === 'driver' ? 'Driver' : user?.user_type}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-md'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-2 rounded-lg mr-3 ${
                            isActive
                              ? 'bg-blue-100'
                              : 'bg-gray-100 group-hover:bg-gray-200'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${
                            isActive ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        </motion.div>
                        <div>
                          <p className={`text-sm font-medium ${
                            isActive ? 'text-blue-700' : 'text-gray-900'
                          }`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
              >
                <div className="p-2 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Sign Out</p>
                  <p className="text-xs text-red-400">End current session</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;