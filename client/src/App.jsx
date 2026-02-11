import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Terms from './pages/Terms'
import Privacy from './pages/privacy'
import AboutUs from './pages/AboutUs'
import './App.css'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

