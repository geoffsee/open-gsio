import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Switch,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';

import { useIsMobile } from '../contexts/MobileContext';

interface SliderControl {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min: number;
  max: number;
  step: number;
  ariaLabel: string;
}

interface SwitchControl {
  value: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
}

interface TweakboxProps {
  sliders: {
    speed: SliderControl;
    intensity: SliderControl;
  };
  switches: {
    particles: SwitchControl;
    glow: SwitchControl;
  };
}

const Tweakbox = observer(({ sliders, switches }: TweakboxProps) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Box display="flex" alignItems="flex-start">
      <IconButton
        aria-label="Toggle controls"
        borderRadius="lg"
        bg="whiteAlpha.300"
        backdropFilter="blur(10px)"
        boxShadow="xl"
        icon={isCollapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
        onClick={() => setIsCollapsed(!isCollapsed)}
        size="sm"
        marginRight={2}
      />
      <Collapse in={!isCollapsed} style={{ width: '100%' }}>
        <Box p={4} borderRadius="lg" bg="whiteAlpha.100" backdropFilter="blur(10px)" boxShadow="xl">
          <Grid templateColumns="1fr" gap={4}>
            <GridItem>
              <Heading hidden={true} size="sm" mb={4} color="text.accent">
                Controls
              </Heading>
            </GridItem>

            <GridItem>
              <Text mb={2} color="text.accent">
                {sliders.speed.label}
              </Text>
              <Slider
                aria-label={sliders.speed.ariaLabel}
                value={sliders.speed.value}
                min={sliders.speed.min}
                step={sliders.speed.step}
                max={sliders.speed.max}
                onChange={sliders.speed.onChange}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </GridItem>

            <GridItem>
              <Text mb={2} color="text.accent">
                {sliders.intensity.label}
              </Text>
              <Slider
                aria-label={sliders.intensity.ariaLabel}
                value={sliders.intensity.value}
                min={sliders.intensity.min}
                step={sliders.intensity.step}
                max={sliders.intensity.max}
                onChange={sliders.intensity.onChange}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </GridItem>

            <GridItem display="flex" alignItems="center" justifyContent="space-between">
              <Text color="text.accent">{switches.particles.label}</Text>
              <Switch
                isChecked={switches.particles.value}
                onChange={e => switches.particles.onChange(e.target.checked)}
              />
            </GridItem>

            <GridItem display="flex" alignItems="center" justifyContent="space-between">
              <Text color="text.accent">{switches.glow.label}</Text>
              <Switch
                isChecked={switches.glow.value}
                onChange={e => switches.glow.onChange(e.target.checked)}
              />
            </GridItem>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
});

export default Tweakbox;
