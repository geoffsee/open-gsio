import { IconButton } from '@chakra-ui/react';
import { LucideHammer } from 'lucide-react';
import React from 'react';

import { toolbarButtonZIndex } from './toolbar/Toolbar';

export default function BuiltWithButton() {
  return (
    <IconButton
      aria-label="Build Info"
      icon={<LucideHammer />}
      size="md"
      bg="transparent"
      stroke="text.accent"
      color="text.accent"
      onClick={() => alert('Built by GSIO')}
      _hover={{
        bg: 'transparent',
        svg: {
          stroke: 'accent.secondary',
          transition: 'stroke 0.3s ease-in-out',
        },
      }}
      zIndex={toolbarButtonZIndex}
    />
  );
}
