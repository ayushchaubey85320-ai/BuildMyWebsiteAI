import React from 'react';

const TestimonialsSection = ({ data, colors, viewport = 'desktop' }) => {
  const items = data?.items || [];
  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  const gridClass = isMobile
    ? "grid grid-cols-1 gap-4"
    : isTablet
    ? "grid grid-cols-2 gap-4"
    : "grid grid-cols-1 md:grid-cols-2 gap-8";

  return (
    <section id="testimonials" className={isMobile ? 'px-4 py-10' : 'px-6 py-20'}>
      <div className="max-w-5xl mx-auto">
        <div className={`text-center ${isMobile ? 'mb-8' : 'mb-16'}`}>
          <h2 className={`font-extrabold ${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'}`} style={{ color: colors.text }}>
            {data?.section_title || "What Our Clients Say"}
          </h2>
        </div>

        <div className={gridClass}>
          {items.map((item, idx) => (
            <div key={idx} className={`rounded-2xl border border-white/10 flex flex-col justify-between ${isMobile ? 'p-4' : 'p-8'}`} style={{ backgroundColor: colors.surface }}>
              <p className={`font-medium italic mb-4 opacity-90 ${isMobile ? 'text-xs' : 'text-base mb-6'}`} style={{ color: colors.text }}>
                "{item.quote}"
              </p>
              <div className="flex items-center gap-3">
                {item.avatar && (
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-xs sm:text-sm" style={{ color: colors.accent }}>{item.name}</h4>
                  <p className="text-[11px] opacity-60" style={{ color: colors.text }}>{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
