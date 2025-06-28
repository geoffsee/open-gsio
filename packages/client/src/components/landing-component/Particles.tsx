import { Box, useTheme } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';

interface ParticlesProps {
  speed: number;
  intensity: number;
  particles: boolean;
  glow: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const Particles: React.FC<ParticlesProps> = ({ speed, intensity, particles, glow }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const theme = useTheme();

  // Helper function to create a single particle with proper canvas dimensions
  const createParticle = (canvas: HTMLCanvasElement): Particle => ({
    x: Math.random() * canvas.parentElement!.getBoundingClientRect().width,
    y: Math.random() * canvas.parentElement!.getBoundingClientRect().height,
    vx: (Math.random() - 0.5) * speed,
    vy: (Math.random() - 0.5) * speed,
    size: Math.random() * 3 + 1,
  });

  // Main animation effect
  useEffect(() => {
    if (!particles) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      particlesRef.current = []; // Clear particles when disabled
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Reposition existing particles that are outside new bounds
      particlesRef.current.forEach(particle => {
        if (particle.x > canvas.width) particle.x = Math.random() * canvas.width;
        if (particle.y > canvas.height) particle.y = Math.random() * canvas.height;
      });
    };

    const ensureParticleCount = () => {
      const targetCount = Math.floor(intensity * 100);
      const currentCount = particlesRef.current.length;

      if (currentCount < targetCount) {
        // Add new particles
        const newParticles = Array.from({ length: targetCount - currentCount }, () =>
          createParticle(canvas),
        );
        particlesRef.current = [...particlesRef.current, ...newParticles];
      } else if (currentCount > targetCount) {
        // Remove excess particles
        particlesRef.current = particlesRef.current.slice(0, targetCount);
      }
    };

    const updateParticles = () => {
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = theme.colors.text.accent;
      ctx.globalCompositeOperation = 'lighter';

      if (glow) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'white';
      } else {
        ctx.shadowBlur = 0;
      }

      particlesRef.current.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const animate = () => {
      updateParticles();
      drawParticles();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);
    resizeCanvas(); // Set canvas size first
    ensureParticleCount(); // Then create particles with proper dimensions
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [particles, intensity, speed, glow, theme.colors.text.accent]);

  // Separate effect for speed changes - update existing particle velocities
  useEffect(() => {
    if (!particles) return;

    particlesRef.current.forEach(particle => {
      const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (currentSpeed > 0) {
        const normalizedVx = particle.vx / currentSpeed;
        const normalizedVy = particle.vy / currentSpeed;
        particle.vx = normalizedVx * speed;
        particle.vy = normalizedVy * speed;
      } else {
        particle.vx = (Math.random() - 0.5) * speed;
        particle.vy = (Math.random() - 0.5) * speed;
      }
    });
  }, [speed, particles]);

  return (
    <Box zIndex={0} pointerEvents={'none'}>
      <canvas
        ref={canvasRef}
        style={{ display: particles ? 'block' : 'none', pointerEvents: 'none' }}
      />
    </Box>
  );
};

export default Particles;
