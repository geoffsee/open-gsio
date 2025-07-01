import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';

export interface BevySceneProps {
  speed?: number; // transition seconds
  intensity?: number;
  glow?: boolean;
}

export const BevyScene: React.FC<BevySceneProps> = ({ speed = 1, intensity = 1, glow = false }) => {
  useEffect(() => {
    (async () => {
      const module = await import('/public/yachtpit.js', { type: 'module' });
      console.log('init', module);
      await module.default();
    })();
    // const script = document.createElement('script');
    // script.src = '';
    // script.type = 'module';
    // document.body.appendChild(script);
    // script.onload = loaded => {
    //   loaded.target?.init();
    //   console.log('loaded', loaded);
    // };
  }, []);

  return (
    <Box
      pos="absolute"
      inset={0}
      zIndex={0}
      pointerEvents="none"
      opacity={Math.min(Math.max(intensity, 0), 1)}
      filter={glow ? 'blur(1px)' : 'none'}
      transition={`opacity ${speed}s ease-in-out`}
    >
      <script type="module"></script>
      <canvas id="yachtpit-canvas" width="1280" height="720"></canvas>
      {/*<iframe*/}
      {/*  src="/yachtpit.html"*/}
      {/*  style={{*/}
      {/*    width: '100%',*/}
      {/*    height: '100%',*/}
      {/*    border: 'none',*/}
      {/*    backgroundColor: 'transparent',*/}
      {/*  }}*/}
      {/*  title="Bevy Scene"*/}
      {/*/>*/}
    </Box>
  );
};
