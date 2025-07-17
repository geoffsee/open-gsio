import { Box } from '@chakra-ui/react';
import React, { useEffect, useLayoutEffect, useState } from 'react';

import { useComponent } from '../contexts/ComponentContext.tsx';

// import { BevyScene } from './BevyScene.tsx';
import Tweakbox from './Tweakbox.tsx';

export const LandingComponent: React.FC = () => {
  const [intensity, setIntensity] = useState(0.99);
  const [mapActive, setMapActive] = useState(true);
  const [aiActive, setAiActive] = useState(false);

  const appCtlState = `app-ctl-state`;

  useLayoutEffect(() => {
    const value = localStorage.getItem(appCtlState);
    if (value) {
      const parsed = JSON.parse(value);
      setIntensity(parsed.intensity);
      setMapActive(parsed.mapActive);
      setAiActive(parsed.aiActive);
    }
  }, []);

  // create a hook for saving the state as a json object when it changes
  useEffect(() => {
    localStorage.setItem(appCtlState, JSON.stringify({ intensity, mapActive, aiActive }));
  });

  const component = useComponent();
  const { setEnabledComponent } = component;

  useEffect(() => {
    if (mapActive) {
      setEnabledComponent('gpsmap');
    }
    if (aiActive) {
      setEnabledComponent('ai');
    }
  }, [mapActive, aiActive, setEnabledComponent]);

  return (
    <Box as="section" bg="background.primary" overflow="hidden">
      <Box position="fixed" right={0} maxWidth="300px" minWidth="200px" zIndex={1000}>
        <Tweakbox
          id="app-tweaker"
          persist={true}
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
    </Box>
  );
};
