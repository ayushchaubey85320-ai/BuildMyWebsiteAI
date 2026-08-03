import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, History, Clock, ArrowLeft, Loader2 } from 'lucide-react';

const AIEditBar = ({ onApplyEdit, histories, onRestoreSnapshot, isUpdating }) => {
  const [instruction, setInstruction] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!instruction.trim() || isUpdating) return;
    onApplyEdit(instruction);
    setInstruction('');
  };

  return (
    <>
      {/* Floating Bottom Edit Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 p-2 rounded-2xl glass-panel border border-indigo-500/40 shadow-2xl bg-slate-950/85 backdrop-blur-xl"
        >
          <div className="flex items-center justify-center pl-3 text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <input
            type="text"
            placeholder="Ask AI Assistant to tweak website layout (e.g. 'Make primary button purple and change hero tagline')"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isUpdating}
            className="w-full py-2 px-3 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Version Control History"
          >
            <History className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={!instruction.trim() || isUpdating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium text-sm flex items-center gap-1.5 shrink-0 disabled:opacity-50 transition shadow-md shadow-indigo-500/20"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Apply</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Version Control History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl p-6 glass-panel rounded-2xl border border-slate-700 bg-slate-950/95 backdrop-blur-2xl shadow-2xl max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-white text-base">Aiven MySQL Version Control</h4>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            {histories && histories.length > 0 ? (
              <div className="space-y-3">
                {histories.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="text-xs font-semibold text-indigo-300 mb-1">
                        Revision #{histories.length - idx} • {new Date(item.created_at).toLocaleTimeString()}
                      </div>
                      <div className="text-sm text-slate-200">{item.prompt_instruction}</div>
                    </div>
                    {/* Revert button if available */}
                    <span className="text-xs text-slate-500 font-mono">Synced to Aiven</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-slate-400">
                No edit history recorded yet. Use the prompt bar to make your first change!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIEditBar;
