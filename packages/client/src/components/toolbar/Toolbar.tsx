import { Flex } from '@chakra-ui/react';
import React from 'react';

import BuiltWithButton from '../BuiltWithButton';
import InstallButton from '../install/InstallButton.tsx';

import GithubButton from './GithubButton';
import SupportThisSiteButton from './SupportThisSiteButton';

const toolbarButtonZIndex = 901;

export { toolbarButtonZIndex };

function ToolBar({ isMobile }) {
  return (
    <Flex
      direction={isMobile ? 'row' : 'column'}
      alignItems={isMobile ? 'flex-start' : 'flex-end'}
      pb={4}
    >
      <InstallButton />
      <SupportThisSiteButton />
      <GithubButton />
      <BuiltWithButton />
    </Flex>
  );
}

export default ToolBar;
