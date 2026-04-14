import React from 'react';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1e40af] to-[#2563eb] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Watermark Icons (Like your screenshot) */}
      <Camera className="absolute top-12 left-12 w-24 h-24 text-white opacity-5 rotate-12" />
      <Camera className="absolute bottom-12 right-12 w-32 h-32 text-white opacity-5 -rotate-12" />
      <div className="absolute top-1/4 right-1/4 w-16 h-16 border-4 border-white rounded-full opacity-5"></div>

      {/* Main Content */}
      <div className="z-10 text-center max-w-2xl px-4 flex flex-col items-center">
        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md mb-6">
          <Camera className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Drishyamitra
        </h1>
        <h2 className="text-xl text-blue-100 font-medium mb-6">
          Professional Photography Platform
        </h2>
        
        <p className="text-blue-100/80 mb-10 text-lg leading-relaxed">
          Transform your photography workflow with AI-powered tools, smart
          organization, and seamless sharing across multiple platforms. The complete
          solution for professional photographers and photography enthusiasts.
        </p>

        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/auth')}
            className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            Get Started Free <span className="text-xl">→</span>
          </button>
          <button className="bg-transparent border border-blue-300 text-white font-semibold py-3 px-6 rounded-lg hover:bg-white/10 transition-all">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}