import { Box, VStack } from '@chakra-ui/react';
import React, { Fragment } from 'react';

import { useIsMobile } from '../../components/contexts/MobileContext';
import PrivacyPolicy from '../../components/legal/LegalDoc';

import privacy_policy from './privacy_policy';

export default function Page() {
  const isMobile = useIsMobile();
  return (
    <Fragment>
      <VStack
        width={'100%'}
        align={'center'}
        height={!isMobile ? '100%' : '100%'}
        overflowX={'auto'}
      >
        <Box
          overflowY={isMobile ? 'scroll' : undefined}
          maxH={!isMobile ? '70vh' : '89vh'}
          mt={isMobile ? 24 : undefined}
        >
          <PrivacyPolicy text={privacy_policy} />
        </Box>
      </VStack>
    </Fragment>
  );
}
