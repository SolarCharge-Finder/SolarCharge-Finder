import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth state on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('AuthContext: Initializing with stored data', {
        storedToken: !!storedToken,
        storedUser: !!storedUser,
      });

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthContext: Setting user from localStorage', parsedUser);
        setToken(storedToken);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('AuthContext: Error parsing stored user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    console.log('AuthContext: Logging in user', userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
  };

  console.log('AuthContext: Current state', {
    user: !!user,
    token: !!token,
    isAuthenticated: !!user && !!token,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
