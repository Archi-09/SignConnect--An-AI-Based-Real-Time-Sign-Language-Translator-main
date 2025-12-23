import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
      <div className="text-center max-w-2xl p-8">
        <h1 className="text-5xl font-extrabold mb-6 text-blue-600">
          Welcome to SignConnect
        </h1>
        <p className="text-xl mb-8 text-gray-600">
          Bridging the gap with real-time two-way sign language translation.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link 
            to="/login" 
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;