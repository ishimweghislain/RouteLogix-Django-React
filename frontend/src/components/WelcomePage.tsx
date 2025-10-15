import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TruckIcon, MapPinIcon, ClockIcon, ShieldCheckIcon, StarIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface WelcomePageProps {
  onLogin: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const features = [
    {
      icon: TruckIcon,
      title: 'Trip Planning',
      description: 'Plan FMCSA HOS compliant routes with automatic fuel stops and rest periods'
    },
    {
      icon: MapPinIcon,
      title: 'Interactive Maps',
      description: 'Visual route display with real-time trip information and markers'
    },
    {
      icon: ClockIcon,
      title: 'ELD Compliance',
      description: 'Automatic daily log generation with 24-hour grid display and violation tracking'
    },
    {
      icon: ShieldCheckIcon,
      title: 'HOS Rules',
      description: 'Complete FMCSA Hours of Service implementation with cycle management'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/Journey.jpg)` }}
      />
      
      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TruckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RouteLogix</h1>
                <p className="text-sm text-gray-600">ELD & Trip Planning System</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <motion.button
                onClick={() => setShowLogin(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Login
              </motion.button>
              <motion.button
                onClick={() => setShowRegister(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Register
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
              Your Journey
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Starts Here</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional ELD & Trip Planning System designed for commercial truck drivers. 
              Plan compliant routes, track hours of service, and generate official daily logs.
            </p>
            <motion.button
              onClick={() => setShowRegister(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Today
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RouteLogix?</h3>
            <p className="text-lg text-gray-600">Everything you need for compliant and efficient trucking operations</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-6">About Our Project</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              RouteLogix is a comprehensive full-stack web application designed specifically for commercial truck drivers. 
              Our system combines advanced trip planning with Electronic Logging Device (ELD) functionality, ensuring 
              full FMCSA Hours of Service compliance while optimizing your routes for efficiency and safety.
            </p>
            <div className="flex justify-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">Trusted by professional drivers nationwide</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">RouteLogix</h4>
                  <p className="text-gray-400 text-sm">ELD & Trip Planning</p>
                </div>
              </div>
              <p className="text-gray-300">
                Professional transportation solutions for the modern trucking industry.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Contact Information</h5>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">+250 781 262 526</span>
                </div>
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">ishimweghislain82@gmail.com</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">About the Owner</h5>
              <p className="text-gray-300 mb-2">
                <strong className="text-white">Ishimwe Ghislain</strong>
              </p>
              <p className="text-gray-300 text-sm">
                Experienced software developer specializing in transportation management systems 
                and ELD compliance solutions.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 RouteLogix. All rights reserved. | Developed by Ishimwe Ghislain
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <LoginForm 
          onClose={() => setShowLogin(false)} 
          onSuccess={onLogin}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {/* Register Modal */}
      {showRegister && (
        <RegisterForm 
          onClose={() => setShowRegister(false)} 
          onSuccess={onLogin}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
};

export default WelcomePage;