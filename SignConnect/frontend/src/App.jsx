import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SignToText from './pages/SignToText';
import TextToSign from './pages/TextToSign';
// Import the new security guard
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const location = useLocation();
  const navigate = useNavigate();

  // Sync state with local storage on route change (helps handle logouts)
  useEffect(() => {
      setToken(localStorage.getItem("token"));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("appLanguage");
    setToken(null);
    navigate("/"); // Redirect to home after logout
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Pass token and logout function to Navbar */}
      <Navbar token={token} onLogout={handleLogout} />
      
      <Routes>
        {/* Public Routes (Accessible by anyone) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        
        {/* PROTECTED ROUTES SECTION
           All routes inside this Route element require login.
        */}
        <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/translate" element={<SignToText />} />
            <Route path="/text-to-sign" element={<TextToSign />} />
        </Route>

      </Routes>
    </div>
  );
}

export default App;