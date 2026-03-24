import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Terms from './pages/Terms';
import Privacy from './pages/privacy';
import AboutUs from './pages/AboutUs';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageStations from './pages/admin/ManageStations';
import ManageReviews from './pages/admin/ManageReviews';
import ProtectedRoute from './components/routing/ProtectedRoute';
import UserDashboard from './pages/User/UserDashboard';
import SearchPage from './pages/SearchPage'; //new search page with filters (adeesha)
import StationDetails from './pages/StationDetails';
import AddSellRequest from './components/SellRequest/AddSellRequest'; //modal for excess energy sell requests, details on user page
import AuthPage from './auth';
import EmailVerification from './auth/EmailVerification';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import OAuthCallback from './auth/OAuthCallback';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-email/:token" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/stations/:id" element={<StationDetails />} />
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/stations" element={<ManageStations />} />
              <Route path="/admin/reviews" element={<ManageReviews />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/user" element={<UserDashboard />} />
              <Route path="/sell-request" element={<AddSellRequest />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
