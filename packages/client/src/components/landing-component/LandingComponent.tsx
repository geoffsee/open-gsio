import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';

import { BevyScene } from './BevyScene.tsx';
import { MatrixRain } from './MatrixRain.tsx';
import Particles from './Particles.tsx';
import Tweakbox from './Tweakbox.tsx';

export const LandingComponent: React.FC = () => {
  const [speed, setSpeed] = useState(0.2);
  const [intensity, setIntensity] = useState(0.5);
  const [particles, setParticles] = useState(false);
  const [glow, setGlow] = useState(false);
  const [matrixRain, setMatrixRain] = useState(false);
  const [bevyScene, setBevyScene] = useState(true);

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
              onChange(enabled) {
                if (enabled) {
                  setMatrixRain(!enabled);
                  setBevyScene(!enabled);
                }
                setParticles(enabled);
              },
              label: 'Particles',
            },
            matrixRain: {
              value: matrixRain,
              onChange(enabled) {
                if (enabled) {
                  setParticles(!enabled);
                  setBevyScene(!enabled);
                }
                setMatrixRain(enabled);
              },
              label: 'Matrix Rain',
            },
            bevyScene: {
              value: bevyScene,
              onChange(enabled) {
                if (enabled) {
                  setParticles(!enabled);
                  setMatrixRain(!enabled);
                }
                setBevyScene(enabled);
              },
              label: 'Bevy Scene',
            },
            glow: {
              value: glow,
              onChange: setGlow,
              label: 'Glow Effect',
            },
          }}
        />
      </Box>
      {!particles && !matrixRain && <BevyScene speed={speed} intensity={intensity} glow={glow} />}
      {!particles && matrixRain && <MatrixRain speed={speed} intensity={intensity} glow={glow} />}
      {particles && <Particles particles glow speed={speed} intensity={intensity} />}
    </Box>
  );
};
