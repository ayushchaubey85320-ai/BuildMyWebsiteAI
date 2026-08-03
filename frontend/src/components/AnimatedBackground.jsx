import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Cyan (#06b6d4), Sky Blue (#38bdf8), and Light Pink (#f472b6) color palette
    const colors = [
      'rgba(6, 182, 212, ',   // Cyan
      'rgba(56, 189, 248, ',  // Sky Blue
      'rgba(244, 114, 182, '  // Light Pink
    ];

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1.5,
      colorPrefix: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.4 + 0.2,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Soft ambient light gradient background (Light Mode Base)
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(0.5, '#f0f9ff');
      bgGrad.addColorStop(1, '#fdf2f8');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floating ambient glowing orbs
      const time = Date.now() * 0.0008;

      // Cyan Orb Top-Left
      const orb1X = canvas.width * 0.2 + Math.sin(time) * 50;
      const orb1Y = canvas.height * 0.25 + Math.cos(time * 0.8) * 40;
      const rad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, 350);
      rad1.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      rad1.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = rad1;
      ctx.beginPath();
      ctx.arc(orb1X, orb1Y, 350, 0, Math.PI * 2);
      ctx.fill();

      // Light Pink Orb Bottom-Right
      const orb2X = canvas.width * 0.8 + Math.cos(time * 0.7) * 60;
      const orb2Y = canvas.height * 0.7 + Math.sin(time * 0.9) * 50;
      const rad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 400);
      rad2.addColorStop(0, 'rgba(244, 114, 182, 0.15)');
      rad2.addColorStop(1, 'rgba(244, 114, 182, 0)');
      ctx.fillStyle = rad2;
      ctx.beginPath();
      ctx.arc(orb2X, orb2Y, 400, 0, Math.PI * 2);
      ctx.fill();

      // Sky Blue Center Orb
      const orb3X = canvas.width * 0.5 + Math.cos(time * 0.5) * 40;
      const orb3Y = canvas.height * 0.5 + Math.sin(time * 0.6) * 40;
      const rad3 = ctx.createRadialGradient(orb3X, orb3Y, 0, orb3X, orb3Y, 300);
      rad3.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      rad3.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = rad3;
      ctx.beginPath();
      ctx.arc(orb3X, orb3Y, 300, 0, Math.PI * 2);
      ctx.fill();

      // Render connected particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;

        // Draw Particle Circle
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p1.colorPrefix}${p1.alpha})`;
        ctx.fill();

        // Connect nearby particles with subtle gradient lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500"
    />
  );
};

export default AnimatedBackground;
