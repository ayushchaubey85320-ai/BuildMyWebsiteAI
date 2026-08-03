import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, Loader2, X } from 'lucide-react';

const STEPS = [
  "Analyzing Prompt & Theme System...",
  "Structuring Hero, Features, & Interactive Forms...",
  "Applying Custom Branding & Colors...",
  "Optimizing Layout for Viewports..."
];

const CreationLoader = ({ isOpen, currentStep = 0, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-lg p-8 glass-panel rounded-3xl border border-indigo-500/30 text-center shadow-2xl space-y-6"
        >
          <div className="relative inline-block">
            <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-10 h-10 animate-pulse" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Synthesizing Your Website
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              BuildMyWebsiteAI Engine is constructing your enterprise layout...
            </p>
          </div>

          {/* Multi-stage Progress Indicators */}
          <div className="space-y-3 text-left">
            {STEPS.map((stepText, idx) => {
              const isDone = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 text-xs font-semibold ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : isCurrent
                      ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreationLoader;
