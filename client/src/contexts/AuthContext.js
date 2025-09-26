import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAIL: 'LOGIN_FAIL',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAIL: 'REGISTER_FAIL',
  LOGOUT: 'LOGOUT',
  USER_LOADED: 'USER_LOADED',
  AUTH_ERROR: 'AUTH_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  SET_LOADING: 'SET_LOADING'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.USER_LOADED:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    
    case AUTH_ACTIONS.LOGIN_FAIL:
    case AUTH_ACTIONS.REGISTER_FAIL:
    case AUTH_ACTIONS.AUTH_ERROR:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        error: null
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Configure axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Load user function
  const loadUser = useCallback(async () => {
    try {
      const res = await axios.get('/api/auth/me');
      dispatch({
        type: AUTH_ACTIONS.USER_LOADED,
        payload: res.data.user
      });
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.AUTH_ERROR,
        payload: error.response?.data?.message || 'Authentication failed'
      });
    }
  }, []);

  // Load user on app start and when token changes
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.token, loadUser]);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const res = await axios.post('/api/auth/login', { email, password });
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: res.data
      });
      
      toast.success('Login successful!');
      return { success: true, user: res.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAIL,
        payload: message
      });
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const res = await axios.post('/api/auth/register', userData);
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: res.data
      });
      
      toast.success('Registration successful!');
      return { success: true, user: res.data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAIL,
        payload: message
      });
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Google OAuth login
  const googleLogin = useCallback(() => {
    window.location.href = '/api/auth/google';
  }, []);

  // Logout function
  const logout = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully');
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (profileData) => {
    try {
      const res = await axios.put('/api/auth/profile', profileData);
      
      dispatch({
        type: AUTH_ACTIONS.USER_LOADED,
        payload: res.data.user
      });
      
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Change password function
  const changePassword = useCallback(async (passwordData) => {
    try {
      await axios.put('/api/auth/password', passwordData);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Clear errors function (stable identity)
  const clearErrors = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERRORS });
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return state.user && state.user.userType === role;
  }, [state.user]);

  // Check if user can access route
  const canAccess = useCallback((allowedRoles) => {
    if (!state.isAuthenticated) return false;
    return allowedRoles.includes(state.user.userType);
  }, [state.isAuthenticated, state.user]);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    changePassword,
    clearErrors,
    hasRole,
    canAccess,
    loadUser
  }), [state, login, register, googleLogin, logout, updateProfile, changePassword, clearErrors, hasRole, canAccess, loadUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
