import { Box } from '@chakra-ui/react';
import React, { memo, useEffect, useMemo } from 'react';

export interface BevySceneProps {
  speed?: number;
  intensity?: number; // 0-1 when visible
  glow?: boolean;
  visible?: boolean; // NEW — defaults to true
}

const BevySceneInner: React.FC<BevySceneProps> = ({
  speed = 1,
  intensity = 1,
  glow = false,
  visible,
}) => {
  /* initialise once */
  useEffect(() => {
    let dispose: (() => void) | void;
    (async () => {
      const { default: init } = await import(/* webpackIgnore: true */ '/public/yachtpit.js');
      dispose = await init(); // zero-arg, uses #yachtpit-canvas
    })();
    return () => {
      if (typeof dispose === 'function') dispose();
    };
  }, []);

  /* memoised styles */
  const wrapperStyles = useMemo(
    () => ({
      position: 'absolute' as const,
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none' as const,
      opacity: visible ? Math.min(Math.max(intensity, 0), 1) : 0,
      filter: glow ? 'blur(1px)' : 'none',
      transition: `opacity ${speed}s ease-in-out`,
      display: visible ? 'block' : 'none', // optional: reclaim hit-testing entirely
    }),
    [visible, intensity, glow, speed],
  );

  return (
    <Box as="div" sx={wrapperStyles}>
      <canvas id="yachtpit-canvas" width={1280} height={720} aria-hidden />
    </Box>
  );
};

export const BevyScene = memo(BevySceneInner);
