import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Terms from './pages/Terms'
import Privacy from './pages/privacy'
import AboutUs from './pages/AboutUs'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageStations from './pages/admin/ManageStations'
import ManageReviews from './pages/admin/ManageReviews'
import AuthPage from './auth'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/stations" element={<ManageStations />} />
          <Route path="/admin/reviews" element={<ManageReviews />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
