import axios from 'axios';
import { API_BASE_URL, setAuthToken } from './api';

export interface User {
  id: string;
  userName: string;
  email: string;
  personName: string;
  role?: string;
}
''
export interface RegisterData {
  personName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export const validateSession = async (): Promise<{ user: User | null; token: string | null }> => {
  const savedToken = sessionStorage.getItem('token');
  const savedUser = sessionStorage.getItem('user');
  
  if (savedToken && savedUser) {
    try {
      const response = await axios.get(`${API_BASE_URL}/Movies/display-watchlist`, {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      if (response.status === 200) {
        setAuthToken(savedToken);
        return {
          token: savedToken,
          user: JSON.parse(savedUser)
        };
      } else {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setAuthToken(null);
        return { user: null, token: null };
      }
    } catch (error) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setAuthToken(null);
      return { user: null, token: null };
    }
  }
  
  return { user: null, token: null };
};

export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; token?: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/Account/login`, {
      email,
      password
    });

    if (response.data) {
      const authToken = response.data.token || response.data.accessToken || response.data;
      const userData = response.data.user || response.data;
      
      const user = userData.personName ? userData : {
        id: userData.id || '',
        userName: userData.userName || userData.email || email,
        email: userData.email || email,
        personName: userData.personName || userData.userName || email.split('@')[0],
        role: userData.role || response.data.role || 'client'
      };
      
      // Console log to check user role
      console.log('User logged in:', {
        email: user.email,
        role: user.role,
        isAdmin: user.role?.toLowerCase() === 'admin'
      });
      
      sessionStorage.setItem('token', authToken);
      sessionStorage.setItem('user', JSON.stringify(user));
      setAuthToken(authToken);
      
      return { success: true, user, token: authToken };
    }
    return { success: false };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false };
  }
};

export const register = async (userData: RegisterData): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/Account/register`, userData);
    return !!response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    return false;
  }
};

export const logout = (): void => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  setAuthToken(null);
};