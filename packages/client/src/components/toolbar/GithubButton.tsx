import { IconButton } from '@chakra-ui/react';
import { Github } from 'lucide-react';
import React from 'react';

import { toolbarButtonZIndex } from './Toolbar';

export default function GithubButton() {
  return (
    <IconButton
      as="a"
      href="https://github.com/geoffsee"
      target="_blank"
      aria-label="GitHub"
      icon={<Github />}
      size="md"
      bg="transparent"
      stroke="text.accent"
      color="text.accent"
      _hover={{
        bg: 'transparent',
        svg: {
          stroke: 'accent.secondary',
          transition: 'stroke 0.3s ease-in-out',
        },
      }}
      title="GitHub"
      zIndex={toolbarButtonZIndex}
    />
  );
}
