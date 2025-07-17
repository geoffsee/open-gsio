import { IconButton } from '@chakra-ui/react';
import { HardDriveDownload } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { toolbarButtonZIndex } from '../toolbar/Toolbar.tsx';

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = e => {
      // Prevent the default prompt
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the installation prompt');
        } else {
          console.log('User dismissed the installation prompt');
        }
      });
      setDeferredPrompt(null);
    }
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
      onClick={handleInstall}
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
