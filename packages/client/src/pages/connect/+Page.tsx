import { Box, VStack } from '@chakra-ui/react';
import React, { Fragment } from 'react';

import ConnectComponent from '../../components/connect/ConnectComponent';
import { useIsMobile } from '../../components/contexts/MobileContext';

export default function ConnectPage() {
  const isMobile = useIsMobile();

  return (
    <Fragment>
      <VStack minH={'100%'} maxW={'40rem'} align="start" h={!isMobile ? '90vh' : '70vh'}>
        <Box maxW={'710px'} p={2} overflowY={'auto'} mt={isMobile ? 24 : 0}>
          <ConnectComponent />
        </Box>
      </VStack>
    </Fragment>
  );
}
