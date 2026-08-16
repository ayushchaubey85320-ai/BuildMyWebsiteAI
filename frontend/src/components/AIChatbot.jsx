import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, X, Send, Key, Loader2, User, Cpu, Zap, MessageSquare 
} from 'lucide-react';
import api from '../api';
import { useTheme } from '../context/ThemeContext';

const AIChatbot = () => {
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hi there! I am your **BuildMyWebsiteAI Assistant** ✨. How can I help you build or customize your website today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [customKey, setCustomKey] = useState(localStorage.getItem('user_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSaveKey = () => {
    localStorage.setItem('user_gemini_key', customKey.trim());
    setShowKeyInput(false);
    alert('Gemini API Key saved successfully!');
  };

  const handleSendMessage = async (msgOverride) => {
    const textToSend = (msgOverride || inputText).trim();
    if (!textToSend || loading) return;

    const userMsgObj = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsgObj]);
    if (!msgOverride) setInputText('');
    setLoading(true);

    try {
      const storedKey = localStorage.getItem('user_gemini_key') || '';
      const resp = await api.post('/chatbot/query', {
        message: textToSend,
        history: messages.map(m => ({ sender: m.sender === 'user' ? 'user' : 'model', text: m.text })),
        api_key: storedKey
      });

      const aiReply = resp.data.reply || 'Sorry, I could not process that request.';
      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '⚠️ Connection timeout. Please check network or API key.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 text-white shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center group border border-white/20 shadow-indigo-500/40"
        title="Open AI Assistant"
        aria-label="Open AI Assistant"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-6 h-6 animate-pulse text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-black pl-0 group-hover:pl-2.5">
          AI Web Assistant
        </span>
      </motion.button>

      {/* Floating Chatbot Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[80vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
              isLight
                ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/80 backdrop-blur-xl'
                : 'bg-slate-900/95 border-slate-800 text-white shadow-slate-950/90 backdrop-blur-xl'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                {/* Premium Metallic AI Logo Avatar */}
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20 shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight flex items-center gap-1.5">
                    <span>BuildMyWebsiteAI Helper</span>
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-slate-400 font-semibold">Online & Ready</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className={`p-2 rounded-xl text-xs font-bold transition ${
                    showKeyInput
                      ? 'bg-indigo-600 text-white shadow-md'
                      : isLight
                      ? 'text-slate-600 hover:bg-slate-200'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                  title="Gemini API Key Settings"
                >
                  <Key className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-xl transition ${
                    isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Custom Gemini API Key Settings Panel */}
            {showKeyInput && (
              <div className={`p-4 border-b text-xs space-y-2.5 ${
                isLight ? 'bg-indigo-50/90 border-indigo-100' : 'bg-indigo-950/60 border-indigo-900/50'
              }`}>
                <div className="flex items-center justify-between font-bold text-indigo-400">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> Custom Gemini API Key
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="Paste custom Gemini API Key..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none text-xs font-mono ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
                <button
                  onClick={handleSaveKey}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md"
                >
                  Save Custom Key
                </button>
              </div>
            )}

            {/* Chat History Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md border border-white/20 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`p-3.5 rounded-2xl max-w-[82%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md rounded-br-none'
                      : isLight
                      ? 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-none'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5 items-center text-slate-400">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <span className="italic text-xs">AI Assistant is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Bar */}
            <div className={`px-3 py-2 border-t flex gap-2 overflow-x-auto ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              {[
                "Suggest prompt for Restaurant",
                "How to export ZIP code?",
                "What 18 categories are supported?"
              ].map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border shrink-0 transition ${
                    isLight
                      ? 'bg-white border-slate-300 text-indigo-600 hover:bg-slate-100'
                      : 'bg-slate-900 border-slate-800 text-cyan-400 hover:bg-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className={`p-3 border-t flex items-center gap-2 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <input
                type="text"
                placeholder="Ask BuildMyWebsiteAI Assistant..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none text-xs font-semibold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400'
                    : 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500'
                }`}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputText.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white flex items-center justify-center shadow-md transition disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
