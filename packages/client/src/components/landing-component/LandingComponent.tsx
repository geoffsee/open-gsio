import { Box, useBreakpointValue, useTheme } from '@chakra-ui/react';
import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';

import { MatrixRain } from './MatrixRain.tsx';
import Particles from './Particles.tsx';
import Tweakbox from './Tweakbox.tsx';

export const LandingComponent: React.FC = () => {
  const [speed, setSpeed] = useState(0.2);
  const [intensity, setIntensity] = useState(0.5);
  const [particles, setParticles] = useState(false);
  const [glow, setGlow] = useState(false);

  return (
    <Box
      as="section"
      bg="background.primary"
      w="100%"
      h="100vh"
      overflow="hidden"
      position="relative"
    >
      <Box
        position="fixed"
        bottom="24px"
        right="24px"
        maxWidth="300px"
        minWidth="200px"
        zIndex={1000}
      >
        <Tweakbox
          sliders={{
            speed: {
              value: speed,
              onChange: setSpeed,
              label: 'Animation Speed',
              min: 0.01,
              max: 0.99,
              step: 0.01,
              ariaLabel: 'animation-speed',
            },
            intensity: {
              value: intensity,
              onChange: setIntensity,
              label: 'Effect Intensity',
              min: 0.01,
              max: 0.99,
              step: 0.01,
              ariaLabel: 'effect-intensity',
            },
          }}
          switches={{
            particles: {
              value: particles,
              onChange: setParticles,
              label: 'Particles',
            },
            glow: {
              value: glow,
              onChange: setGlow,
              label: 'Glow Effect',
            },
          }}
        />
      </Box>
      {!particles && <MatrixRain speed={speed} intensity={intensity} glow={glow} />}
      {particles && <Particles particles glow speed={speed} intensity={intensity} />}
    </Box>
  );
};
