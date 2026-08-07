import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const { themeMode } = useTheme();
  const isLight = themeMode === 'light';

  useEffect(() => {
    const onMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Check if mouse is hovering an interactive element
      const target = e.target;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.onclick ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      {/* Small Precision Cursor Dot */}
      <motion.div
        className={`fixed top-0 left-0 w-2.5 h-2.5 rounded-full pointer-events-none z-50 transition-transform ${
          isLight ? 'bg-indigo-600' : 'bg-cyan-400'
        }`}
        animate={{
          x: mousePosition.x - 5,
          y: mousePosition.y - 5,
          scale: isClicked ? 0.6 : isHovered ? 1.5 : 1,
        }}
        transition={{ type: 'spring', stiffness: 800, damping: 35, mass: 0.1 }}
      />

      {/* Smooth Outer Glowing Ring Follower */}
      <motion.div
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border-2 pointer-events-none z-50 shadow-lg ${
          isLight
            ? 'border-indigo-500/50 bg-indigo-500/10 shadow-indigo-500/20'
            : 'border-cyan-400/60 bg-cyan-400/10 shadow-cyan-400/30'
        }`}
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isClicked ? 1.4 : isHovered ? 2.2 : 1,
          borderColor: isHovered
            ? isLight
              ? '#ec4899'
              : '#f472b6'
            : isLight
            ? 'rgba(99, 102, 241, 0.5)'
            : 'rgba(34, 211, 238, 0.6)',
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25, mass: 0.2 }}
      />
    </>
  );
};

export default CustomCursor;
