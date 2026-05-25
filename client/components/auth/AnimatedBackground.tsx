'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#05050A] pointer-events-none">
      {/* Dynamic Grid Overlay */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
        }}
      />

      {/* Mouse Tracking Aura */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-30 mix-blend-screen"
        animate={{
          x: mousePosition.x - 300,
          y: mousePosition.y - 300,
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
        style={{
          background: 'radial-gradient(circle, rgba(0,255,136,0.15) 0%, rgba(59,130,246,0.1) 50%, transparent 100%)',
        }}
      />

      {/* Ambient Static Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(0,255,136,0.03)_0%,transparent_70%)] blur-[80px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.03)_0%,transparent_70%)] blur-[100px]" />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.3 + 0.1
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              x: [null, (Math.random() - 0.5) * 100],
              opacity: [null, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              background: i % 2 === 0 ? '#00FF88' : '#3B82F6',
              boxShadow: `0 0 10px ${i % 2 === 0 ? 'rgba(0,255,136,0.5)' : 'rgba(59,130,246,0.5)'}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
