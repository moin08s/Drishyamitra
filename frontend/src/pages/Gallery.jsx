import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { UploadCloud, Trash2, X, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [unlabeledFaces, setUnlabeledFaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labelName, setLabelName] = useState('');

  useEffect(() => {
    fetchPhotos();
    fetchUnlabeledFaces();
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await axios.get(`${API_URL}/photos/gallery`);
      // BULLETPROOF ARRAY CHECK
      setPhotos(Array.isArray(res.data) ? res.data : []);
    } catch (error) { 
      setPhotos([]); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchUnlabeledFaces = async () => {
    try {
      const res = await axios.get(`${API_URL}/photos/unlabeled`);
      setUnlabeledFaces(Array.isArray(res.data) ? res.data : []);
    } catch (error) { 
      setUnlabeledFaces([]); 
    }
  };

  const handleLabelFace = async () => {
    if (!labelName.trim() || unlabeledFaces.length === 0) return;
    try {
      await axios.post(`${API_URL}/photos/label`, { face_id: unlabeledFaces[0].face_id, name: labelName });
      setLabelName('');
      setUnlabeledFaces(prev => prev.slice(1)); 
    } catch (error) {
      alert("Error labeling face.");
    }
  };

  const skipFace = () => {
    setLabelName('');
    setUnlabeledFaces(prev => prev.slice(1));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Gallery</h1>

        {loading ? (
          <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
        ) : photos.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No photos yet. Go to the Upload page to add some!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <img src={`${API_URL}/photos/file/${photo.filename}`} alt="Gallery" className="w-full h-48 object-cover" />
                <div className="p-3">
                  <p className="text-xs font-bold text-gray-800 truncate">{photo.filename}</p>
                  <p className="text-[10px] text-blue-600 mb-2 font-semibold">{photo.faces_count} Face(s) Detected</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {unlabeledFaces.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Label AI Faces</h2>
              <button onClick={() => setUnlabeledFaces([])} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 flex flex-col items-center text-center">
              <p className="text-sm text-gray-500 mb-4">Who is in this photo?</p>
              <img src={`${API_URL}/photos/file/${unlabeledFaces[0].photo_filename}`} alt="Face" className="w-48 h-48 rounded-lg object-cover shadow-md mb-6" />
              <input type="text" value={labelName} onChange={(e) => setLabelName(e.target.value)} placeholder="Enter person's name" className="w-full px-4 py-3 border-2 border-blue-500 rounded-xl outline-none mb-4" />
              <div className="flex w-full gap-3">
                <button onClick={handleLabelFace} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2"><Check className="w-5 h-5" /> Save Name</button>
                <button onClick={skipFace} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl">Skip</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}