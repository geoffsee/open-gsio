import { useBreakpointValue, useTheme } from '@chakra-ui/react';
import React, { useEffect, useRef, useMemo } from 'react';

const MATRIX_CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface MatrixRainProps {
  speed?: number;
  glow?: boolean;
  intensity?: number;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({
  speed = 1,
  glow = false,
  intensity = 1,
}) => {
  const fontSize = useBreakpointValue({ base: 14, md: 18, lg: 22 }) ?? 14;
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const dropsRef = useRef<number[]>([]);
  const columnsRef = useRef<number>(0);

  const colors = useMemo(
    () => ({
      background: theme.colors.background.primary,
      textAccent: theme.colors.text.accent,
    }),
    [theme.colors.background.primary, theme.colors.text.accent],
  );

  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const newColumns = Math.floor(canvas.width / fontSize);
      if (newColumns !== columnsRef.current) {
        columnsRef.current = newColumns;
        const newDrops: number[] = [];

        for (let i = 0; i < newColumns; i++) {
          if (i < dropsRef.current.length) {
            newDrops[i] = dropsRef.current[i];
          } else {
            newDrops[i] = Math.random() * (canvas.height / fontSize);
          }
        }
        dropsRef.current = newDrops;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    if (dropsRef.current.length === 0) {
      const columns = Math.floor(canvas.width / fontSize);
      columnsRef.current = columns;

      for (let i = 0; i < columns; i++) {
        dropsRef.current[i] = Math.random() * (canvas.height / fontSize);
      }
    }

    const draw = () => {
      if (!ctx || !canvas) return;

      const currentColors = colorsRef.current;

      ctx.fillStyle = currentColors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < dropsRef.current.length; i++) {
        const text = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = i * fontSize;
        const y = dropsRef.current[i] * fontSize;

        ctx.fillStyle = currentColors.textAccent;
        if (glow) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = currentColors.textAccent;
        }
        ctx.fillText(text, x, y);

        if (y > canvas.height) {
          dropsRef.current[i] = -Math.random() * 5;
        } else {
          dropsRef.current[i] += (0.1 + Math.random() * 0.5) * speed * intensity;
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [fontSize, speed, glow, intensity]);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
};
