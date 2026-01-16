import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'WRITER';
  status: string;
  walletBalance?: number;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      const parsedUser = JSON.parse(storedUser);
      // Normalize walletBalance to number if it exists
      if (parsedUser.walletBalance !== undefined) {
        parsedUser.walletBalance = typeof parsedUser.walletBalance === 'string'
          ? parseFloat(parsedUser.walletBalance)
          : Number(parsedUser.walletBalance);
      }
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const register = async (data: RegisterData) => {
    try {
      await api.register({
        ...data,
        role: 'WRITER', // Default role for registration
      });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message || 'Registration failed',
        };
      }
      return {
        success: false,
        error: 'Unable to connect to the server',
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);

      // Store token and user data
      const accessToken = data.token.accessToken;
      
      // Normalize walletBalance to number if it exists
      const normalizedUser = {
        ...data.user,
        walletBalance: data.user.walletBalance 
          ? (typeof data.user.walletBalance === 'string' 
              ? parseFloat(data.user.walletBalance) 
              : Number(data.user.walletBalance))
          : 0,
      };
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      
      setToken(accessToken);
      setUser(normalizedUser);

      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message || 'Login failed',
        };
      }
      return {
        success: false,
        error: 'Unable to connect to the server',
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await api.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API error:', error);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      navigate('/auth/login');
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}