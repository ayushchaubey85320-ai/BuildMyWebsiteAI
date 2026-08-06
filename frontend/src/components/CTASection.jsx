import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

const CTASection = ({ data, colors, viewport = 'desktop', contactEmail }) => {
  const headline = data?.headline || "Ready to Get Started?";
  const subheadline = data?.subheadline || "Send us a direct message and our team will get back to you immediately.";
  const buttonText = data?.button_text || "Send Message";
  const isMobile = viewport === 'mobile';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const isLight = colors?.mode === 'light';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#475569' : '#94a3b8';
  const cardBg = isLight ? '#ffffff' : (colors.surface || '#1e293b');
  const cardBorder = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)';

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const targetEmail = contactEmail || "contact@buildmywebsiteai.site";
    const mailtoUrl = `mailto:${targetEmail}?subject=Inquiry from ${encodeURIComponent(name || 'Website Visitor')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    window.location.href = mailtoUrl;
    setSent(true);
  };

  return (
    <section id="contact" className={`max-w-4xl mx-auto ${
      isMobile ? 'px-3 py-8' : 'px-4 sm:px-8 py-16'
    }`}>
      <div className={`rounded-2xl sm:rounded-3xl border shadow-2xl text-center ${
        isMobile ? 'p-5' : 'p-8 sm:p-12'
      }`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
        <h2 className={`font-black tracking-tight mb-3 ${
          isMobile ? 'text-xl' : 'text-2xl sm:text-4xl'
        }`} style={{ color: textColor }}>
          {headline}
        </h2>
        <p className={`max-w-2xl mx-auto mb-6 ${
          isMobile ? 'text-xs' : 'text-sm sm:text-base'
        }`} style={{ color: subtextColor }}>
          {subheadline}
        </p>

        {sent ? (
          <div className="p-4 sm:p-6 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">Redirecting to mail client to send your message to {contactEmail || 'our team'}!</span>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="max-w-md mx-auto space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: subtextColor }}>
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none transition text-xs sm:text-sm ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600' 
                    : 'bg-slate-900/80 border-slate-700 text-white focus:border-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: subtextColor }}>
                Your Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none transition text-xs sm:text-sm ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600' 
                    : 'bg-slate-900/80 border-slate-700 text-white focus:border-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: subtextColor }}>
                Your Message
              </label>
              <textarea
                rows={3}
                required
                placeholder="Write your inquiry or question here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none transition text-xs sm:text-sm resize-none ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600' 
                    : 'bg-slate-900/80 border-slate-700 text-white focus:border-indigo-500'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition transform hover:scale-105"
              style={{ backgroundColor: colors.primary, color: '#ffffff' }}
            >
              <Send className="w-4 h-4" />
              <span>{buttonText}</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default CTASection;
