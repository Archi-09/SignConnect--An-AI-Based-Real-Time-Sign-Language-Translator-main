import React, { useState } from 'react';
import { login, signup } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  // State to switch between Login and Signup
  const [isSignup, setIsSignup] = useState(false);
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isSignup) {
        // 1. Register the user
        console.log("Signing up...");
        response = await signup(formData);
        alert("Account created! You are now logged in.");
      } else {
        // 2. Log in the user
        console.log("Logging in...");
        response = await login(formData);
      }

      // 3. Save Token & Email
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('userEmail', formData.email);
      
      // 4. Go to Dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Authentication Failed! Check your email/password.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Email Address" 
            type="email"
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input 
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            type="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          
          <button className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-200">
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
          </p>
          <button 
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-600 font-bold hover:underline mt-1"
          >
            {isSignup ? 'Switch to Login' : 'Create an Account'}
          </button>
        </div>
      </div>
    </div>
  );
}