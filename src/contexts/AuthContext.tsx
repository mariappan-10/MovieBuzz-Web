import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  userName: string;
  email: string;
  personName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  personName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'https://localhost:7188/api/v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const savedToken = sessionStorage.getItem('token');
      const savedUser = sessionStorage.getItem('user');
      
      if (savedToken && savedUser) {
        try {
          // Validate token by making a test request
          const response = await axios.get('https://localhost:7188/api/Movies/display-watchlist', {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          
          // If request succeeds, token is valid
          if (response.status === 200) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          } else {
            // Token invalid, clear session
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          // Token invalid or expired, clear session
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };

    validateSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/Account/login`, {
        email,
        password
      });

      if (response.data) {
        // Handle different response structures from API
        const authToken = response.data.token || response.data.accessToken || response.data;
        const userData = response.data.user || response.data;
        
        // If no separate user object, create one from the response
        const user = userData.personName ? userData : {
          id: userData.id || '',
          userName: userData.userName || userData.email || email,
          email: userData.email || email,
          personName: userData.personName || userData.userName || email.split('@')[0]
        };
        
        setToken(authToken);
        setUser(user);
        
        sessionStorage.setItem('token', authToken);
        sessionStorage.setItem('user', JSON.stringify(user));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/Account/register`, userData);
      
      if (response.data) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};