import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false });
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

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

    const handleMouseMove = (e) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Particle colors: Cyan (#06b6d4), Sky Blue (#38bdf8), and Neon Pink (#ec4899)
    const colors = isLight
      ? ['rgba(6, 182, 212, ', 'rgba(56, 189, 248, ', 'rgba(236, 72, 153, ']
      : ['rgba(34, 211, 238, ', 'rgba(99, 102, 241, ', 'rgba(244, 114, 182, '];

    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1.5,
      colorPrefix: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.4 + 0.2,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      originalVx: (Math.random() - 0.5) * 0.8,
      originalVy: (Math.random() - 0.5) * 0.8,
    }));

    // Cursor trail ripples array
    let trail = [];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smoothly interpolate mouse position for fluid motion
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.15;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.15;

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      const isMouseActive = mouseRef.current.active && mouseX > 0 && mouseY > 0;

      // Add trail point when moving
      if (isMouseActive) {
        trail.push({
          x: mouseX,
          y: mouseY,
          radius: 12,
          alpha: 0.6,
        });
      }

      // Realistic Dynamic Background Gradient based on active Theme Mode
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (isLight) {
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(0.5, '#f0f9ff');
        bgGrad.addColorStop(1, '#fdf2f8');
      } else {
        bgGrad.addColorStop(0, '#020617');
        bgGrad.addColorStop(0.4, '#080e22');
        bgGrad.addColorStop(0.8, '#0f172a');
        bgGrad.addColorStop(1, '#110c2a');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floating ambient glowing AI neural orbs
      const time = Date.now() * 0.0006;

      // Cyan / Electric Orb Top-Left
      const orb1X = canvas.width * 0.25 + Math.sin(time) * 60;
      const orb1Y = canvas.height * 0.25 + Math.cos(time * 0.8) * 50;
      const rad1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, 400);
      rad1.addColorStop(0, isLight ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.25)');
      rad1.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = rad1;
      ctx.beginPath();
      ctx.arc(orb1X, orb1Y, 400, 0, Math.PI * 2);
      ctx.fill();

      // Neon Pink / Purple Orb Bottom-Right
      const orb2X = canvas.width * 0.75 + Math.cos(time * 0.7) * 70;
      const orb2Y = canvas.height * 0.75 + Math.sin(time * 0.9) * 60;
      const rad2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 450);
      rad2.addColorStop(0, isLight ? 'rgba(244, 114, 182, 0.15)' : 'rgba(236, 72, 153, 0.22)');
      rad2.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = rad2;
      ctx.beginPath();
      ctx.arc(orb2X, orb2Y, 450, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Interactive Mouse Spotlight Ambient Glow
      if (isMouseActive) {
        const mouseGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 220);
        mouseGlow.addColorStop(0, isLight ? 'rgba(99, 102, 241, 0.18)' : 'rgba(34, 211, 238, 0.28)');
        mouseGlow.addColorStop(0.5, isLight ? 'rgba(236, 72, 153, 0.08)' : 'rgba(236, 72, 153, 0.15)');
        mouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 220, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Cursor Motion Trail Particles
      for (let t = trail.length - 1; t >= 0; t--) {
        const tr = trail[t];
        tr.radius += 0.8;
        tr.alpha -= 0.035;

        if (tr.alpha <= 0) {
          trail.splice(t, 1);
        } else {
          ctx.beginPath();
          ctx.arc(tr.x, tr.y, tr.radius, 0, Math.PI * 2);
          ctx.strokeStyle = isLight
            ? `rgba(99, 102, 241, ${tr.alpha * 0.4})`
            : `rgba(34, 211, 238, ${tr.alpha * 0.6})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      // Render connected AI particle mesh with Cursor Magnetic Attraction & Laser Connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Cursor Attraction Physics
        if (isMouseActive) {
          const mdx = mouseX - p1.x;
          const mdy = mouseY - p1.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          const maxDist = 200;

          if (mdist < maxDist) {
            const force = (1 - mdist / maxDist) * 1.5;
            p1.vx += (mdx / mdist) * force * 0.08;
            p1.vy += (mdy / mdist) * force * 0.08;

            // Draw Energy Laser Beam from Cursor to Particle
            const laserAlpha = (1 - mdist / maxDist) * (isLight ? 0.4 : 0.65);
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(p1.x, p1.y);
            
            const beamGradient = ctx.createLinearGradient(mouseX, mouseY, p1.x, p1.y);
            beamGradient.addColorStop(0, isLight ? `rgba(99, 102, 241, ${laserAlpha})` : `rgba(34, 211, 238, ${laserAlpha})`);
            beamGradient.addColorStop(1, isLight ? `rgba(236, 72, 153, ${laserAlpha * 0.5})` : `rgba(244, 114, 182, ${laserAlpha * 0.5})`);
            
            ctx.strokeStyle = beamGradient;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }

        // Apply friction and speed limits
        p1.vx *= 0.98;
        p1.vy *= 0.98;

        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;

        // Draw Particle Circle
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p1.colorPrefix}${isLight ? p1.alpha : p1.alpha * 1.3})`;
        ctx.fill();

        // Connect nearby particles with neural mesh lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * (isLight ? 0.25 : 0.35);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isLight
              ? `rgba(56, 189, 248, ${lineAlpha})`
              : `rgba(99, 102, 241, ${lineAlpha})`;
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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLight]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
    />
  );
};

export default AnimatedBackground;
