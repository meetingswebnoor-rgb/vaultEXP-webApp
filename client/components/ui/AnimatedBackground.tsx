'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-vault-obsidian">
      {/* Mesh Gradient Base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-vault-navy via-vault-obsidian to-vault-obsidian opacity-80" />
      
      {/* Animated Mesh Overlay */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-30 animate-mesh-pan mix-blend-screen" />

      {/* Floating Glowing Orbs */}
      <motion.div
        className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-vault-emerald/10 blur-[120px]"
        animate={{
          x: mousePosition.x * 0.05,
          y: mousePosition.y * 0.05,
        }}
        transition={{ type: 'spring', damping: 50, stiffness: 50 }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-vault-cyan/10 blur-[120px]"
        animate={{
          x: mousePosition.x * -0.05,
          y: mousePosition.y * -0.05,
        }}
        transition={{ type: 'spring', damping: 50, stiffness: 50 }}
      />
      
      {/* Mouse Tracking Glow Spot */}
      <motion.div
        className="pointer-events-none absolute w-[600px] h-[600px] rounded-full bg-vault-emerald/5 blur-[100px] -translate-x-1/2 -translate-y-1/2"
        animate={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.5 }}
      />

      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
}
