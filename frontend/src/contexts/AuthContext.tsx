import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_active_driver: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: any, currentPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('routelogix_user');
    const savedToken = localStorage.getItem('routelogix_token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
      } catch (error) {
        localStorage.removeItem('routelogix_user');
        localStorage.removeItem('routelogix_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.login({ username, password });

      if (response.token && response.user) {
        const { token: authToken, user: userData } = response;
        
        setUser(userData);
        setToken(authToken);
        
        localStorage.setItem('routelogix_user', JSON.stringify(userData));
        localStorage.setItem('routelogix_token', authToken);
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.register(data);

      if (response.token && response.user) {
        const { token: authToken, user: userData } = response;
        
        setUser(userData);
        setToken(authToken);
        
        localStorage.setItem('routelogix_user', JSON.stringify(userData));
        localStorage.setItem('routelogix_token', authToken);
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      setIsLoading(false);
      
      // Re-throw the error so the form can handle it
      throw error;
    }
  };

  const updateProfile = async (data: any, currentPassword: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const response = await authAPI.updateProfile({
        ...data,
        current_password: currentPassword
      });

      if (response.user) {
        const updatedUser = response.user;
        setUser(updatedUser);
        localStorage.setItem('routelogix_user', JSON.stringify(updatedUser));
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('routelogix_user');
    localStorage.removeItem('routelogix_token');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
