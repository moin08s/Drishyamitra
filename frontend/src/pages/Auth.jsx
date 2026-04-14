import React, { useState } from 'react';
import { User, Lock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, { username, password });
      
      if (!isLogin) {
        // If registered successfully, switch to login mode
        setIsLogin(true);
        setError('Registration successful! Please log in.');
      } else {
        // If logged in, save the token and go to dashboard
        localStorage.setItem('drishyamitra_token', res.data.token);
        localStorage.setItem('drishyamitra_user', username); // Save name for navbar
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Drishyamitra</h1>
          <p className="text-gray-500 text-sm">{isLogin ? 'Login to your workspace' : 'Create your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="text" required value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="username" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {error && <p className={`text-sm text-center ${error.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>{error}</p>}

          <button type="submit" className="w-full bg-[#4b5563] hover:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-6">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => {setIsLogin(!isLogin); setError('');}} className="font-semibold text-gray-800 hover:underline">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}