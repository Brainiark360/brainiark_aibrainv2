// /src/components/onboarding/AnimatedBrain.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedBrainProps {
  size?: number;
  color?: string;
  orbitCount?: number;
  pulseSpeed?: number;
  orbitSpeed?: number;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

const AnimatedBrain: React.FC<AnimatedBrainProps> = ({
  size = 120,
  color = 'rgb(var(--os-accent))',
  orbitCount = 6,
  pulseSpeed = 2,
  orbitSpeed = 1,
  intensity = 'medium',
  className,
}) => {
  const brainSize = size;
  const orbitRadius = size * 0.6;
  
  // Configuration based on intensity
  const intensityConfig = {
    low: { glowIntensity: 0.1, dotSize: 2, opacity: 0.4 },
    medium: { glowIntensity: 0.2, dotSize: 3, opacity: 0.6 },
    high: { glowIntensity: 0.3, dotSize: 4, opacity: 0.8 },
  }[intensity];

  // Generate orbital dots with varying properties
  const orbitalDots = Array.from({ length: orbitCount }).map((_, i) => {
    const angle = (i * (2 * Math.PI)) / orbitCount;
    const speed = orbitSpeed * (0.5 + Math.random() * 1.5); // Varied speeds
    const delay = Math.random() * 2;
    const radius = orbitRadius * (0.8 + Math.random() * 0.4); // Slightly varied radii
    
    return {
      angle,
      speed,
      delay,
      radius,
      size: intensityConfig.dotSize * (0.7 + Math.random() * 0.6),
      color: i % 3 === 0 ? color : 
             i % 3 === 1 ? `${color}/0.4` : 
             'rgb(var(--foreground)/0.3)',
    };
  });

  return (
    <div 
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      {/* Outer Glow Aura */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, intensityConfig.glowIntensity, 0.3],
        }}
        transition={{
          duration: pulseSpeed * 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Pulsing Core Ring */}
      <motion.div
        className="absolute border-2 rounded-full"
        style={{
          borderColor: color,
          width: brainSize * 1.4,
          height: brainSize * 1.4,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: pulseSpeed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orbiting Dots */}
      {orbitalDots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
            boxShadow: `0 0 8px ${dot.color}`,
            x: dot.radius * Math.cos(dot.angle),
            y: dot.radius * Math.sin(dot.angle),
          }}
          animate={{
            rotate: 360,
            x: [
              dot.radius * Math.cos(dot.angle),
              dot.radius * Math.cos(dot.angle + Math.PI),
              dot.radius * Math.cos(dot.angle + 2 * Math.PI),
            ],
            y: [
              dot.radius * Math.sin(dot.angle),
              dot.radius * Math.sin(dot.angle + Math.PI),
              dot.radius * Math.sin(dot.angle + 2 * Math.PI),
            ],
          }}
          transition={{
            duration: 10 / dot.speed,
            repeat: Infinity,
            ease: "linear",
            delay: dot.delay,
          }}
        />
      ))}

      {/* Brain Icon */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 1, -1, 0],
        }}
        transition={{
          scale: {
            duration: pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: pulseSpeed * 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <Brain
          size={brainSize * 0.5}
          strokeWidth={1.5}
          style={{ color }}
          className="drop-shadow-lg"
        />
      </motion.div>

      {/* Inner Neural Connections */}
      <div className="absolute inset-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`connection-${i}`}
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
              width: brainSize * (0.3 + i * 0.1),
              height: brainSize * (0.3 + i * 0.1),
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: pulseSpeed * (0.8 + i * 0.2),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Subtle Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`scanline-${i}`}
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"
            style={{ top: `${(i / 20) * 100}%` }}
            animate={{
              opacity: [0, 0.1, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: Math.random(),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBrain;