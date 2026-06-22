import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GuidePage from './pages/GuidePage'
import ReadingPage from './pages/ReadingPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/reading" element={<ReadingPage />} />
      </Routes>
    </Router>
  )
}

export default App
