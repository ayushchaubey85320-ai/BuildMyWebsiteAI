import React from 'react';

const TestimonialsSection = ({ data, colors, viewport = 'desktop', isEditMode = false, onUpdate }) => {
  const items = data?.items || [];
  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  const gridClass = isMobile
    ? "grid grid-cols-1 gap-4"
    : isTablet
    ? "grid grid-cols-2 gap-4"
    : "grid grid-cols-1 md:grid-cols-2 gap-8";

  return (
    <section id="testimonials" className={`section testimonials-section container max-w-5xl mx-auto ${isMobile ? 'px-4 py-10' : 'px-6 py-20'}`}>
      <div className="max-w-5xl mx-auto">
        <div className={`section-header text-center ${isMobile ? 'mb-8' : 'mb-16'}`}>
          <h2 
            contentEditable={isEditMode}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate && onUpdate({ section_title: e.currentTarget.textContent })}
            className={`section-title font-extrabold ${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} ${isEditMode ? 'outline-dashed outline-2 outline-indigo-400 p-1 rounded-lg cursor-text inline-block' : ''}`} 
          >
            {data?.section_title || "What Our Clients Say"}
          </h2>
        </div>

        <div className={gridClass}>
          {items.map((item, idx) => (
            <div key={idx} className={`card rounded-2xl border border-white/10 flex flex-col justify-between ${isMobile ? 'p-4' : 'p-8'}`} style={{ backgroundColor: colors.surface }}>
              <p 
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (onUpdate) {
                    const newItems = [...items];
                    newItems[idx] = { ...newItems[idx], quote: e.currentTarget.textContent.replace(/^"|"$/g, '') };
                    onUpdate({ items: newItems });
                  }
                }}
                className={`font-medium italic mb-4 opacity-90 ${isMobile ? 'text-xs' : 'text-base mb-6'} ${isEditMode ? 'outline-dashed outline-2 outline-indigo-400 p-1 rounded-lg cursor-text' : ''}`} 
                style={{ color: colors.text }}
              >
                "{item.quote}"
              </p>
              <div className="flex items-center gap-3">
                {item.avatar && (
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0" />
                )}
                <div>
                  <h4 
                    contentEditable={isEditMode}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (onUpdate) {
                        const newItems = [...items];
                        newItems[idx] = { ...newItems[idx], name: e.currentTarget.textContent };
                        onUpdate({ items: newItems });
                      }
                    }}
                    className={`font-bold text-xs sm:text-sm ${isEditMode ? 'outline-dashed outline-2 outline-indigo-400 p-0.5 rounded cursor-text' : ''}`} 
                    style={{ color: colors.accent }}
                  >
                    {item.name}
                  </h4>
                  <p 
                    contentEditable={isEditMode}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (onUpdate) {
                        const newItems = [...items];
                        newItems[idx] = { ...newItems[idx], role: e.currentTarget.textContent };
                        onUpdate({ items: newItems });
                      }
                    }}
                    className={`text-[11px] opacity-60 ${isEditMode ? 'outline-dashed outline-2 outline-indigo-400 p-0.5 rounded cursor-text' : ''}`} 
                    style={{ color: colors.text }}
                  >
                    {item.role}
                  </p>
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
