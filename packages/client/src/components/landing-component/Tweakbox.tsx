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
  exclusive?: boolean;
}

interface TweakboxProps {
  sliders: {
    speed: SliderControl;
    intensity: SliderControl;
  };
  switches: {
    particles: SwitchControl;
    glow: SwitchControl;
  } & Record<string, SwitchControl>;
}

const Tweakbox = observer(({ sliders, switches }: TweakboxProps) => {
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
            {Object.keys(switches).map(key => {
              return (
                <GridItem key={key}>
                  <Text mb={2} color="text.accent">
                    {switches[key].label}
                  </Text>
                  <Switch
                    isChecked={switches[key].value}
                    onChange={e => switches[key].onChange(e.target.checked)}
                  />
                </GridItem>
              );
            })}
            {Object.entries(sliders).map(([key, slider]) => (
              <GridItem key={key}>
                <Text mb={2} color="text.accent">
                  {slider.label}
                </Text>
                <Slider
                  aria-label={slider.ariaLabel}
                  value={slider.value}
                  min={slider.min}
                  step={slider.step}
                  max={slider.max}
                  onChange={slider.onChange}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </GridItem>
            ))}
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
});

export default Tweakbox;
