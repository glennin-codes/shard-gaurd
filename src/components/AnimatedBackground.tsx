import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTelegram } from '../context/TelegramContext';

const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
  }));
};

const AnimatedBackground = () => {
  const [particles, setParticles] = useState(generateParticles(50));
  const { isDarkMode } = useTelegram();

  // Regenerate particles on window resize
  useEffect(() => {
    const handleResize = () => {
      setParticles(generateParticles(50));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${
            isDarkMode ? 'bg-blue-400/10' : 'bg-blue-600/10'
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}rem`,
            height: `${particle.size}rem`,
          }}
          animate={{
            x: [
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
            ],
            y: [
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
              Math.random() * 100 - 50,
            ],
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      <div 
        className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-slate-900 via-slate-900/95 to-blue-900/20' 
            : 'bg-gradient-to-br from-white via-slate-50/95 to-blue-100/20'
        }`} 
      />
    </div>
  );
};

export default AnimatedBackground; 