import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when typing
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Call the Backend API
      const res = await axios.post('http://localhost:5000/api/login', formData);
      
      // 2. If successful, save role and redirect
      if (res.data) {
        localStorage.setItem('userRole', res.data.role); // Save 'admin' or 'staff'
        localStorage.setItem('username', res.data.username);
        navigate('/dashboard');
      }
    } catch (err) {
      // 3. Handle Errors
      console.error(err);
      setError(err.response?.data?.error || "Connection failed. Is the server running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black flex items-center justify-center p-4">
      
      {/* Login Card */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">IMS Pro</h1>
          <p className="text-gray-400 mt-2">Inventory Management System</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg flex items-center gap-2 text-red-200 text-sm mb-6 animate-pulse">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Username Input */}
          <div className="relative group">
            <User className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input 
              type="text" 
              name="username" 
              value={formData.username}
              onChange={handleChange}
              placeholder="Username" 
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <Lock className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password" 
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? "Verifying..." : "Login"}
            {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>

        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          <p>Restricted Access • Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
};

export default Login;