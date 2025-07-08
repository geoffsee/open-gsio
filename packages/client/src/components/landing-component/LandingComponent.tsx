import { Box } from '@chakra-ui/react';
import React, { useState } from 'react';

import { BevyScene } from './BevyScene.tsx';
import Map from './Map.tsx';
import Tweakbox from './Tweakbox.tsx';

export const LandingComponent: React.FC = () => {
  const [speed, setSpeed] = useState(0.2);
  const [intensity, setIntensity] = useState(0.5);
  const [particles, setParticles] = useState(false);
  const [glow, setGlow] = useState(false);
  const [matrixRain, setMatrixRain] = useState(false);
  const [bevyScene, setBevyScene] = useState(true);
  const [mapActive, setMapActive] = useState(false);

  const map = <Map visible={mapActive} />;

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
        bottom="100x"
        right="12px"
        maxWidth="300px"
        minWidth="200px"
        zIndex={1000}
      >
        <Tweakbox
          sliders={{
            intensity: {
              value: !particles ? intensity : 0.99,
              onChange: setIntensity,
              label: 'Brightness',
              min: 0.01,
              max: 0.99,
              step: 0.01,
              ariaLabel: 'effect-intensity',
            },
          }}
          switches={{
            bevyScene: {
              value: bevyScene,
              onChange(enabled) {
                if (enabled) {
                  setParticles(!enabled);
                  setMatrixRain(!enabled);
                  setMapActive(!enabled);
                }
                setBevyScene(enabled);
              },
              label: 'Instruments',
            },
            GpsMap: {
              value: mapActive,
              onChange(enabled) {
                if (enabled) {
                  setParticles(!enabled);
                  setMatrixRain(!enabled);
                  setBevyScene(!enabled);
                }
                setMapActive(enabled);
              },
              label: 'Map',
            },
          }}
        />
      </Box>
      <BevyScene speed={speed} intensity={intensity} glow={glow} visible={bevyScene} />
      {mapActive && map}
    </Box>
  );
};
