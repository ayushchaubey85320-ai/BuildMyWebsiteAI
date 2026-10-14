import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle, Phone, MapPin } from 'lucide-react';

const CTASection = ({ data, colors, viewport = 'desktop', contactEmail, contactPhone, address, brandName, isEditMode = false, onUpdate }) => {
  const headline = data?.headline || "Ready to Get Started?";
  const subheadline = data?.subheadline || "Send us a direct message and our team will get back to you immediately.";
  const buttonText = data?.button_text || "Send Message";
  const isMobile = viewport === 'mobile';

  const phoneVal = contactPhone || data?.contact_phone || "";
  const addressVal = address || data?.address || "";
  const cleanWaDigits = (phoneVal || '').replace(/\D/g, '');
  const formattedWa = cleanWaDigits.length === 10 ? `91${cleanWaDigits}` : cleanWaDigits;
  const waUrl = formattedWa ? `https://wa.me/${formattedWa}?text=${encodeURIComponent(`Hello ${brandName || 'there'}! I am inquiring about your services from your website.`)}` : null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMode, setPaymentMode] = useState('Direct UPI');
  const [phoneError, setPhoneError] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const upiId = data?.upi_id || "";
  const upiPayUrl = upiId ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(brandName || 'Merchant')}&cu=INR` : null;
  const upiQrUrl = upiPayUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayUrl)}` : null;

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
    const targetEmail = contactEmail || "";
    if (targetEmail) {
      const mailtoUrl = `mailto:${targetEmail}?subject=Inquiry from ${encodeURIComponent(name || 'Website Visitor')}&body=${encodeURIComponent(`Name: ${name}\nPhone: ${countryCode} ${mobileNumber}\nEmail: ${email}\nLandmark: ${landmark}\nPincode: ${pincode}\nPayment Preference: ${paymentMode}\n\nMessage:\n${message}`)}`;
      window.location.href = mailtoUrl;
    }

    // Desi WhatsApp Order Dispatch
    if (formattedWa) {
      const waBookingMsg = `🙏 Namaste ${brandName || 'Store'}!\n\n*New Inquiry & Order Request:*\n👤 *Name:* ${name}\n📞 *Phone:* ${countryCode} ${mobileNumber}\n📍 *Landmark:* ${landmark || 'N/A'}\n📮 *Pincode:* ${pincode || 'N/A'}\n💳 *Payment Mode:* ${paymentMode}\n💬 *Message:* ${message}`;
      const directWaUrl = `https://wa.me/${formattedWa}?text=${encodeURIComponent(waBookingMsg)}`;
      setTimeout(() => {
        try { window.open(directWaUrl, '_blank'); } catch (err) {}
      }, 600);
    }

    setSent(true);
  };


  return (
    <section id="contact" className={`section cta-section container max-w-4xl mx-auto ${
      isMobile ? 'px-3 py-8' : 'px-4 sm:px-8 py-16'
    }`}>
      <div className={`card rounded-2xl sm:rounded-3xl border shadow-2xl text-center ${
        isMobile ? 'p-5' : 'p-8 sm:p-12'
      }`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
        <h2 
          contentEditable={isEditMode}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate && onUpdate({ headline: e.currentTarget.textContent })}
          className={`section-title font-black tracking-tight mb-3 ${
            isMobile ? 'text-xl' : 'text-2xl sm:text-4xl'
          } ${isEditMode ? 'outline-dashed outline-2 outline-indigo-400 p-1 rounded-lg cursor-text' : ''}`} 
        >
          {headline}
        </h2>
        <p 
          contentEditable={isEditMode}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate && onUpdate({ subheadline: e.currentTarget.textContent })}
          className={`section-subtitle max-w-2xl mx-auto mb-6 ${
            isMobile ? 'text-xs' : 'text-sm sm:text-base'
          } ${isEditMode ? 'outline-dashed outline-2 outline-indigo-400 p-1 rounded-lg cursor-text' : ''}`} 
          style={{ color: subtextColor }}
        >
          {subheadline}
        </p>

        {/* Instant Conversion Action Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm text-white bg-[#25D366] hover:bg-[#20ba59] shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp</span>
          </a>

          {phoneVal && (
            <a
              href={`tel:${phoneVal}`}
              className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm border transition"
              style={{ borderColor: colors.primary, color: 'var(--primary-color, ' + colors.primary + ')' }}
            >
              <Phone className="w-4 h-4" />
              <span>Call: {phoneVal}</span>
            </a>
          )}
        </div>

        {sent ? (
          <div className="p-4 sm:p-6 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">Thank you {name}! Your inquiry has been dispatched to {contactEmail || 'our team'}!</span>
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

            {/* Landmark & 6-Digit Pincode (IND-007) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: subtextColor }}>
                  Nearby Landmark
                </label>
                <input
                  type="text"
                  placeholder="Near Temple / Metro / Market"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none transition text-xs ${
                    isLight 
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600' 
                      : 'bg-slate-900/80 border-slate-700 text-white focus:border-indigo-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: subtextColor }}>
                  6-Digit Pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 110001 / 400001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none transition text-xs font-semibold ${
                    isLight 
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600' 
                      : 'bg-slate-900/80 border-slate-700 text-white focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            {/* Payment Preference (IND-001, IND-010) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: subtextColor }}>
                Payment Preference
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none font-bold text-xs ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="Direct UPI (GPay / PhonePe / Paytm)">⚡ Direct UPI QR (Zero Processing Fee)</option>
                <option value="Cash on Delivery / Pay at Shop (COD)">💵 Cash on Delivery / Pay at Shop (COD)</option>
                <option value="Pay after Consultation / Service">🤝 Pay after Consultation / Service</option>
              </select>
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
              className="btn-primary w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition transform hover:scale-105"
              style={{ backgroundColor: 'var(--btn-primary-bg, ' + colors.primary + ')', color: 'var(--btn-primary-text, #ffffff)' }}
            >
              <Send className="w-4 h-4" />
              <span>{buttonText}</span>
            </button>
          </form>
        )}

        {/* Direct UPI QR Code Card (IND-001) */}
        {upiId ? (
          <div className="mt-8 pt-6 border-t border-slate-800/40">
            <div className="max-w-sm mx-auto p-5 rounded-2xl border-2 border-dashed border-indigo-500/50 bg-slate-900/40 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xl">⚡</span>
                <h4 className="font-extrabold text-sm sm:text-base text-white">Direct Zero-Fee UPI Payment</h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Instant advance token / billing with any Indian UPI app</p>
              <div className="bg-white p-2.5 rounded-xl inline-block shadow-md mb-2.5">
                <img src={upiQrUrl} alt="UPI QR" className="w-36 h-36 rounded-lg block" />
              </div>
              <div className="text-xs font-mono font-bold text-indigo-400 mb-3 select-all bg-indigo-950/60 py-1 px-3 rounded-lg inline-block">
                UPI ID: {upiId}
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map(app => (
                  <span key={app} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {app}
                  </span>
                ))}
              </div>
              <a 
                href={upiPayUrl} 
                className="inline-block w-full py-2 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition"
              >
                📱 Tap to Pay on Mobile UPI App
              </a>
            </div>
          </div>
        ) : isEditMode ? (
          <div className="mt-6 p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/20 text-center">
            <span className="text-xs text-slate-400">💡 Tip: Add your merchant UPI ID in contact settings to enable instant 0%-fee QR payments.</span>
          </div>
        ) : null}

        {/* Embedded Interactive Google Maps */}
        {addressVal && (
          <div className="mt-8 pt-6 border-t border-slate-800/40 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold mb-3" style={{ color: textColor }}>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">Location: {addressVal}</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressVal)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold shadow-md shadow-rose-500/20 transition transform hover:scale-105"
              >
                <span>Open in Google Maps ↗</span>
              </a>
            </div>
            <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-800/50 shadow-inner bg-slate-900">
              <iframe
                title="Google Maps Location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                allow="geolocation; fullscreen"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(addressVal)}&t=&z=14&ie=UTF8&iwloc=B&output=embed`}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CTASection;

