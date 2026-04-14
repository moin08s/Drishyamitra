import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Upload, Image as ImageIcon, MessageSquare, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [totalPhotos, setTotalPhotos] = useState(0);
  
  // Get the real username from the logged-in session
  const username = localStorage.getItem('drishyamitra_user') || 'User';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Fetch real photo count from the backend
  useEffect(() => {
    axios.get(`${API_URL}/photos/dashboard-stats`)
      .then(res => setTotalPhotos(res.data.total))
      .catch(err => console.error("Could not fetch stats", err));
  }, []);

  const actionCards = [
    { title: 'Upload', desc: 'Add new photos', icon: Upload, color: 'text-blue-600', path: '/upload' },
    { title: 'Gallery', desc: 'Browse collection', icon: ImageIcon, color: 'text-blue-500', path: '/gallery' },
    { title: 'AI Chat', desc: 'Get assistance', icon: MessageSquare, color: 'text-orange-500', path: '/chat' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      
      <main className="max-w-5xl mx-auto py-8 px-4 space-y-6">
        
        {/* Welcome Banner (Now 100% Real!) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, {username.split('@')[0]}!</h2>
            <p className="text-gray-500 mb-4">Ready to capture and create amazing memories?</p>
            <div className="flex items-center text-sm text-gray-400 gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
              {today}
            </div>
          </div>
          <div className="text-right flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-500">Portfolio Status</p>
              <p className="text-xl font-bold text-gray-900">{totalPhotos} Photos</p>
            </div>
            <div className="bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-200">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Action Grid (Removed the fake stat cards!) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actionCards.map((card, idx) => (
            <div key={idx} onClick={() => navigate(card.path)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center">
              <div className={`p-3 rounded-xl bg-gray-50 mb-4 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Quick Upload Button */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="bg-blue-50 p-6 rounded-xl border-2 border-dashed border-blue-200 mb-4">
            <Camera className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="font-bold text-gray-800">Need to add new photos?</p>
          </div>
          <button onClick={() => navigate('/upload')} className="w-full bg-[#818cf8] hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">
            Go to Upload Page
          </button>
        </div>

      </main>
    </div>
  );
}