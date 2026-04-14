import React from 'react';
import { Camera, Home, LayoutDashboard, Image as ImageIcon, Upload, MessageSquare, Edit, History, Settings, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('drishyamitra_user') || 'User';

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Gallery', icon: ImageIcon, path: '/gallery' },
    { name: 'Upload', icon: Upload, path: '/upload' },
    { name: 'AI Chat', icon: MessageSquare, path: '/chat' }
  ];

  // REAL LOGOUT: Clears the memory so accounts don't get tangled!
  const handleLogout = () => {
    localStorage.clear(); // Clears tokens, usernames, and chat history!
    navigate('/auth');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="bg-blue-600 p-2 rounded-lg"><Camera className="w-5 h-5 text-white" /></div>
        <div>
          <h1 className="font-bold text-gray-900 leading-tight text-lg">Drishyamitra</h1>
          <p className="text-[10px] text-gray-500 font-medium tracking-wide">Professional Photography</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.name} onClick={() => navigate(item.path)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <item.icon className="w-4 h-4" /> {item.name}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <div className="bg-blue-600 rounded-full p-1.5"><User className="w-4 h-4 text-white" /></div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{username}</p>
            <p className="text-[10px] text-gray-500">Photographer</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors" title="Log Out">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}