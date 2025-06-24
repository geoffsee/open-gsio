import { Box, Heading, Text } from '@chakra-ui/react';
import React from 'react';

import { useIsMobile } from '../components/contexts/MobileContext';
import Routes from '../renderer/routes';
import { usePageContext } from '../renderer/usePageContext';

export default function Hero() {
  const pageContext = usePageContext();
  const isMobile = useIsMobile();

  return (
    <Box p={2}>
      <Box>
        <Heading
          textAlign={isMobile ? 'left' : 'right'}
          minWidth="90px"
          maxWidth={'220px'}
          color="text.accent"
          as="h3"
          letterSpacing={'tight'}
          size="lg"
        >
          {Routes[normalizePath(pageContext.urlPathname)]?.heroLabel}
        </Heading>
      </Box>

      <Text
        isTruncated
        maxWidth="100%"
        whiteSpace="nowrap"
        letterSpacing={'tight'}
        color="text.accent"
        textAlign={isMobile ? 'left' : 'right'}
        overflow="hidden"
      >
        {new Date().toLocaleDateString()}
      </Text>
    </Box>
  );
}

const normalizePath = path => {
  if (!path) return '/';
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path.toLowerCase();
};
