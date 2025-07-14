import { IconButton } from '@chakra-ui/react';
import { HardDriveDownload } from 'lucide-react';
import React from 'react';

import { toolbarButtonZIndex } from './toolbar/Toolbar.tsx';

function InstallButton() {
  // const install = usePWAInstall();

  const install = () => {
    console.warn('this does not work in all browsers');
  };
  return (
    <IconButton
      aria-label="Install App"
      title="Install App"
      icon={<HardDriveDownload />}
      size="md"
      bg="transparent"
      stroke="text.accent"
      color="text.accent"
      onClick={() => install}
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

export default InstallButton;
