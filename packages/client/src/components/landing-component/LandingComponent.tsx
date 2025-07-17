import { Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { useComponent } from '../contexts/ComponentContext.tsx';

import { BevyScene } from './BevyScene.tsx';
import Tweakbox from './Tweakbox.tsx';

export const LandingComponent: React.FC = () => {
  const [speed, setSpeed] = useState(0.2);
  const [intensity, setIntensity] = useState(0.99);
  const [glow, setGlow] = useState(false);
  const [bevyScene, setBevyScene] = useState(true);
  const [mapActive, setMapActive] = useState(true);
  const [aiActive, setAiActive] = useState(false);

  const component = useComponent();
  const { setEnabledComponent } = component;

  useEffect(() => {
    if (mapActive) {
      setEnabledComponent('gpsmap');
    }
    if (aiActive) {
      setEnabledComponent('ai');
    }
  }, []);

  return (
    <Box as="section" bg="background.primary" overflow="hidden" position="relative">
      <Box position="fixed" right={0} maxWidth="300px" minWidth="200px" zIndex={1000}>
        <Tweakbox
          sliders={{
            intensity: {
              value: intensity,
              onChange: setIntensity,
              label: 'Brightness',
              min: 0.01,
              max: 0.99,
              step: 0.01,
              ariaLabel: 'effect-intensity',
            },
          }}
          switches={{
            GpsMap: {
              value: mapActive,
              onChange(enabled) {
                if (enabled) {
                  setEnabledComponent('gpsmap');
                  setAiActive(false);
                } else {
                  setEnabledComponent('');
                }
                setMapActive(enabled);
              },
              label: 'GPS',
            },
            AI: {
              value: aiActive,
              onChange(enabled) {
                if (enabled) {
                  setEnabledComponent('ai');
                  setMapActive(false);
                } else {
                  setEnabledComponent('');
                }
                setAiActive(enabled);
              },
              label: 'AI',
            },
          }}
        />
      </Box>
      {/*<BevyScene speed={speed} intensity={intensity} glow={glow} visible={bevyScene} />*/}
    </Box>
  );
};
