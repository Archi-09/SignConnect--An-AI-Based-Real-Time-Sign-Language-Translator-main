import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ token, onLogout }) => {
  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Home Link */}
        <Link to="/" className="text-2xl font-bold flex items-center">
          👋 SignConnect
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {token ? (
            // Links shown WHEN LOGGED IN
            <>
              <Link to="/translate" className="hover:text-blue-200 transition">
                 🖐️ Sign to Text
              </Link>
              <Link to="/text-to-sign" className="hover:text-blue-200 transition">
                 🗣️ Text to Sign
              </Link>
              <Link to="/dashboard" className="hover:text-blue-200 transition">
                 📊 Dashboard
              </Link>
              <button 
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-bold transition shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            // Links shown WHEN LOGGED OUT
            <Link 
              to="/login" 
              className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition shadow-sm"
            >
              Login / Signup
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;