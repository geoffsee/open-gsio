import { Box, VStack } from '@chakra-ui/react';
import React, { Fragment } from 'react';

import { useIsMobile } from '../../components/contexts/MobileContext';
import TermsOfService from '../../components/legal/LegalDoc';

import terms_of_service from './terms_of_service';

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
          <TermsOfService text={terms_of_service} />
        </Box>
      </VStack>
    </Fragment>
  );
}
