import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { MessageSquare, Mail, Send, Trash } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export default function Chat() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // BULLETPROOF MEMORY LOAD (Using _v2 to escape the old corrupted memory)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('drishyamitra_chat_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { console.error("Memory corrupted, starting fresh."); }
    
    return [{ id: 1, sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: 'Hello! I am the Drishyamitra AI Assistant. How can I help you today?' }];
  });

  // Save to memory
  useEffect(() => {
    localStorage.setItem('drishyamitra_chat_v2', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearChat = () => {
    setMessages([{ id: 1, sender: 'bot', text: 'Chat history cleared. How can I help you?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText('');
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat/message`, { message: userText });
      const data = response.data;

      if (data.type === 'action_success') {
        // Notice we only save TEXT now, not React Icons!
        setMessages(prev => [...prev, {
          id: Date.now() + 1, sender: 'bot', text: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionLabel: `Send ${data.photo_count} Photos to ${data.target_email}`
        }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Error connecting to AI.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8f4] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full py-8 px-4 flex flex-col">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[#d26b38]" />
            <h1 className="text-3xl font-extrabold text-[#d26b38]">Chat Assistant</h1>
          </div>
          <button onClick={handleClearChat} className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm"><Trash className="w-4 h-4"/> Clear History</button>
        </div>

        <div className="bg-white flex-1 rounded-t-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-white h-[500px]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-4 shadow-sm ${msg.sender === 'user' ? 'bg-[#d06224] text-white' : 'bg-[#f1f3f5] text-gray-800'}`}>
                  <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* We render the icon directly in the HTML, not from the state memory! */}
                  {msg.actionLabel && (
                    <button className="mt-3 flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold transition-colors shadow-sm bg-[#6bc16d] hover:bg-green-600">
                      <Mail className="w-4 h-4" /> {msg.actionLabel}
                    </button>
                  )}
                  <p className={`text-[10px] mt-2 font-medium ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            {loading && <div className="text-gray-500 text-sm animate-pulse">AI is typing...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} disabled={loading} placeholder="Type your message..." className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#d26b38] outline-none" />
              <button type="submit" disabled={loading || !inputText.trim()} className="bg-[#dca484] hover:bg-[#d06224] text-white p-3 px-6 rounded-xl"><Send className="w-5 h-5" /></button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}