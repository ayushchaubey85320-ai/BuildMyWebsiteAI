import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

const CTASection = ({ data, colors, viewport = 'desktop', contactEmail }) => {
  const headline = data?.headline || "Ready to Get Started?";
  const subheadline = data?.subheadline || "Send us a direct message and our team will get back to you immediately.";
  const buttonText = data?.button_text || "Send Message";
  const isMobile = viewport === 'mobile';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const isLight = colors?.mode === 'light';
  const textColor = isLight ? '#0f172a' : '#ffffff';
  const subtextColor = isLight ? '#475569' : '#94a3b8';
  const cardBg = isLight ? '#ffffff' : (colors.surface || '#1e293b');
  const cardBorder = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)';

  const handleMobileInput = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    setMobileNumber(digits);
    if (countryCode === '+91') {
      if (digits.length > 0 && (digits.length !== 10 || !['6', '7', '8', '9'].includes(digits[0]))) {
        setPhoneError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      } else {
        setPhoneError('');
      }
    } else {
      if (digits.length > 0 && digits.length < 7) {
        setPhoneError('Please enter a valid phone number (at least 7 digits)');
      } else {
        setPhoneError('');
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (countryCode === '+91' && (mobileNumber.length !== 10 || !['6', '7', '8', '9'].includes(mobileNumber[0]))) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }
    const targetEmail = contactEmail || "contact@buildmywebsiteai.site";
    const mailtoUrl = `mailto:${targetEmail}?subject=Inquiry from ${encodeURIComponent(name || 'Website Visitor')}&body=${encodeURIComponent(`Name: ${name}\nPhone: ${countryCode} ${mobileNumber}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
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
            <span className="text-xs sm:text-sm font-bold">Thank you {name}! Your appointment request has been dispatched to {contactEmail || 'our team'}!</span>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="max-w-md mx-auto space-y-3.5 text-left">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: subtextColor }}>
                Your Full Name *
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
                Mobile Number (with Country Code) *
              </label>
              <div className="grid grid-cols-[130px_1fr] gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    setPhoneError('');
                  }}
                  className={`px-2.5 py-2.5 rounded-xl border focus:outline-none font-bold text-xs ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                >
                  <option value="+91">🇮🇳 +91 (IN)</option>
                  <option value="+1">🇺🇸 +1 (US)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+971">🇦🇪 +971 (UAE)</option>
                  <option value="+1">🇨🇦 +1 (CA)</option>
                  <option value="+61">🇦🇺 +61 (AU)</option>
                  <option value="+65">🇸🇬 +65 (SG)</option>
                  <option value="+49">🇩🇪 +49 (DE)</option>
                  <option value="+966">🇸🇦 +966 (SA)</option>
                </select>
                <input
                  type="tel"
                  required
                  placeholder="10-digit number"
                  value={mobileNumber}
                  onChange={handleMobileInput}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none transition text-xs sm:text-sm font-semibold ${
                    isLight 
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600' 
                      : 'bg-slate-900/80 border-slate-700 text-white focus:border-indigo-500'
                  }`}
                />
              </div>
              {phoneError ? (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">⚠️ {phoneError}</p>
              ) : mobileNumber && mobileNumber.length === 10 && countryCode === '+91' ? (
                <p className="text-[11px] text-emerald-500 font-semibold mt-1">✓ Valid 10-digit Indian mobile number</p>
              ) : null}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: subtextColor }}>
                Your Email Address
              </label>
              <input
                type="email"
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
                Your Message / Service Request *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe what service you are looking for..."
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
