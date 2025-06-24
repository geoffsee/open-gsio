import { Grid, GridItem } from '@chakra-ui/react';
import React from 'react';

import { useIsMobile } from '../components/contexts/MobileContext';
import Routes from '../renderer/routes';

import Content from './Content';
import Hero from './Hero';
import Navigation from './Navigation';

export default function LayoutComponent({ children }) {
  const isMobile = useIsMobile();

  return (
    <Grid
      templateAreas={
        isMobile
          ? `"nav"
                               "main"`
          : `"nav main"`
      }
      gridTemplateRows={isMobile ? 'auto 1fr' : '1fr'}
      gridTemplateColumns={isMobile ? '1fr' : 'auto 1fr'}
      minHeight="100vh"
      gap="1"
    >
      <GridItem area={'nav'} hidden={false}>
        <Navigation routeRegistry={Routes}>
          <Hero />
        </Navigation>
      </GridItem>
      <GridItem area={'main'}>
        <Content>{children}</Content>
      </GridItem>
    </Grid>
  );
}
