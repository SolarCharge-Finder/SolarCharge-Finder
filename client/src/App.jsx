import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    <Router>
      <div className="App">
        <h1>SolarCharge Finder</h1>
        <p>Find solar charging stations near you</p>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </div>
    </Router>
  )
}

function Home() {
  return (
    <div>
      <h2>Welcome to SolarCharge Finder</h2>
      <p>Your one-stop solution for finding solar charging stations</p>
    </div>
  )
}

export default App

