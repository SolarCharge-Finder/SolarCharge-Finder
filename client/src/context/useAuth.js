import { useContext } from 'react';
import AuthContext from './AuthContext.jsx';

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    console.error('useAuth must be used within an AuthProvider');
    return {
      user: null,
      token: null,
      login: () => {},
      logout: () => {},
      loading: false,
      isAuthenticated: false,
    };
  }

  return context;
};

export default useAuth;
