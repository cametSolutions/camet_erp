import React, { useMemo } from 'react';

const AnimatedBackground = () => {
  const particles = useMemo(() =>
    [...Array(25)].map((_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      moveX: (Math.random() - 0.5) * 200,
      moveY: (Math.random() - 0.5) * 200,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 15,
      size: 1 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.4,
    })), []
  );

  return (
    <>
      <style>{`
        @keyframes floatMove {
          0%, 100% { transform: translate(0, 0); opacity: 0.1; }
          25% { opacity: 0.6; }
          50% { transform: translate(var(--move-x), var(--move-y)); opacity: 0.8; }
          75% { opacity: 0.3; }
        }

        .floating-particle {
          animation: floatMove var(--duration) ease-in-out var(--delay) infinite alternate;
        }
      `}</style>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1D34] via-[#0B1D34] to-[#0B1D34]"></div>

        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white floating-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.startX}%`,
              top: `${particle.startY}%`,
              '--move-x': `${particle.moveX}px`,
              '--move-y': `${particle.moveY}px`,
              '--duration': `${particle.duration}s`,
              '--delay': `${particle.delay}s`,
              opacity: particle.opacity,
            }}
          ></div>
        ))}

        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        ></div>
      </div>
    </>
  );
};

export default AnimatedBackground;
