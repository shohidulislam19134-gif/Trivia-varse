import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number; // initial x offset (-100 to 100vw percentage)
  y: number; // initial y offset
  targetX: number;
  targetY: number;
  rotate: number;
  scale: number;
  color: string;
  shape: 'rect' | 'circle' | 'star' | 'ribbon';
  duration: number;
  delay: number;
}

const CONFETTI_COLORS = [
  '#f59e0b', // gold/amber
  '#ec4899', // pink/rose
  '#00baf2', // paytm sky blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f97316', // orange
  '#eab308', // yellow
  '#ffffff', // bright white sparkle
];

interface MotionConfettiProps {
  isTopScore?: boolean;
  count?: number;
}

export const MotionConfetti: React.FC<MotionConfettiProps> = ({
  isTopScore = false,
  count = 70,
}) => {
  // Generate random explosion particle trajectories
  const particles: Particle[] = useMemo(() => {
    const total = isTopScore ? Math.min(100, count + 30) : count;
    const items: Particle[] = [];

    for (let i = 0; i < total; i++) {
      // Angle spread: erupt upward and outwards from screen bottom/center
      const angle = (Math.random() * Math.PI) + (Math.PI * 0.1); // mostly upward arch
      const velocity = 350 + Math.random() * 650;
      const targetX = Math.cos(angle) * (velocity * (Math.random() > 0.5 ? 1 : -1));
      const targetY = - (Math.sin(angle) * velocity) + (Math.random() * 400 + 400); // arches then falls downward

      const shapes: Array<'rect' | 'circle' | 'star' | 'ribbon'> = ['rect', 'circle', 'star', 'ribbon'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

      items.push({
        id: i,
        x: (Math.random() - 0.5) * 200, // spawn clustered around center
        y: 0,
        targetX,
        targetY: Math.random() * 600 + 300, // falls all the way down
        rotate: (Math.random() - 0.5) * 1440, // multiple full spins
        scale: 0.6 + Math.random() * 0.8,
        color,
        shape,
        duration: 3.5 + Math.random() * 2.5,
        delay: Math.random() * 0.4,
      });
    }

    return items;
  }, [isTopScore, count]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center"
      aria-hidden="true"
    >
      <AnimatePresence>
        {particles.map((p) => {
          // Render specific shape
          return (
            <motion.div
              key={p.id}
              initial={{
                x: p.x,
                y: 100, // start near lower center
                opacity: 1,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: [p.x, p.targetX * 0.6, p.targetX],
                y: [100, -350 - Math.random() * 200, p.targetY], // pop up then drift down with gravity
                opacity: [0, 1, 1, 0.8, 0],
                scale: [0, p.scale, p.scale, p.scale * 0.8, 0.4],
                rotate: p.rotate,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                position: 'absolute',
                width: p.shape === 'ribbon' ? '6px' : p.shape === 'rect' ? '12px' : '10px',
                height: p.shape === 'ribbon' ? '24px' : p.shape === 'rect' ? '14px' : '10px',
                borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'star' ? '2px' : '2px',
                backgroundColor: p.color,
                boxShadow: isTopScore ? `0 0 10px ${p.color}` : undefined,
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};
