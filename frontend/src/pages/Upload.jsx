import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/photos/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      setFile(null); // Clear file after success
    } catch (err) {
      setError('Error connecting to AI server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Photos</h1>
          <p className="text-gray-500 mb-8">Upload a photo and let DeepFace AI detect the faces.</p>

          <form onSubmit={handleUpload} className="space-y-6 flex flex-col items-center">
            <label className="w-full max-w-md flex flex-col items-center px-4 py-12 bg-blue-50 text-blue-600 rounded-xl border-2 border-dashed border-blue-300 cursor-pointer hover:bg-blue-100 transition-colors">
              <UploadCloud className="w-12 h-12 mb-3" />
              <span className="font-medium">{file ? file.name : 'Click to select a JPG or PNG'}</span>
              <input type="file" className="hidden" accept="image/jpeg, image/png" onChange={(e) => setFile(e.target.files[0])} />
            </label>

            <button type="submit" disabled={loading || !file} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition-all flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
              {loading ? 'AI is scanning...' : 'Upload & Analyze'}
            </button>
          </form>

          {error && <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>}
          
          {result && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="text-xl font-bold text-green-800">Scan Complete!</h3>
              <p className="text-green-700 mt-2">The AI detected <span className="font-extrabold text-2xl">{result.faces_detected}</span> face(s).</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}