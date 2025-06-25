import { Box, Collapse, Grid, GridItem, useBreakpointValue } from '@chakra-ui/react';
import { MenuIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';

import { useIsMobile } from '../components/contexts/MobileContext';
import { usePageContext } from '../renderer/usePageContext';
import menuState from '../stores/AppMenuStore';
import userOptionsStore from '../stores/UserOptionsStore';

import NavItem from './NavItem';
import Sidebar from './Sidebar';
import { getTheme } from './theme/color-themes';

const Navigation = observer(({ children, routeRegistry }) => {
  const isMobile = useIsMobile();
  const pageContext = usePageContext();

  const currentPath = pageContext.urlPathname || '/';

  const getTopValue = () => {
    if (!isMobile) return undefined;
    if (currentPath === '/') return 12;
    return 0;
  };

  const variant = useBreakpointValue(
    {
      base: 'outline',
      md: 'solid',
    },
    {
      fallback: 'md',
    },
  );

  useEffect(() => {
    menuState.closeMenu();
  }, [variant]);

  return (
    <Grid templateColumns="1fr" templateRows="auto 1fr">
      <GridItem
        p={4}
        position="fixed"
        top={0}
        left={0}
        zIndex={1100}
        width={isMobile ? '20%' : '100%'}
        hidden={!isMobile}
      >
        <Grid templateColumns="auto 1fr" alignItems="center">
          <GridItem>
            <MenuIcon
              cursor="pointer"
              w={6}
              h={6}
              stroke={getTheme(userOptionsStore.theme).colors.text.accent}
              onClick={() => {
                switch (menuState.isOpen) {
                  case true:
                    menuState.closeMenu();
                    break;
                  case false:
                    menuState.openMenu();
                    break;
                }
              }}
            />
          </GridItem>
          <GridItem>{children}</GridItem>
        </Grid>
      </GridItem>
      <GridItem>
        <Collapse
          hidden={isMobile && !menuState.isOpen}
          in={(isMobile && menuState.isOpen) || !isMobile}
          animateOpacity
        >
          <Grid
            as="nav"
            templateColumns="1fr"
            width="100%"
            h={isMobile ? '100vh' : '100vh'}
            top={getTopValue()}
            position={'relative'}
            bg={'transparent'}
            zIndex={1000}
            gap={4}
            p={isMobile ? 4 : 0}
          >
            <GridItem>{!isMobile && children}</GridItem>
            <GridItem>
              <Sidebar>
                {Object.keys(routeRegistry)
                  .filter(p => !routeRegistry[p].hideNav)
                  .map(path => (
                    <NavItem key={path} path={path}>
                      {routeRegistry[path].sidebarLabel}
                    </NavItem>
                  ))}
              </Sidebar>
            </GridItem>
          </Grid>
        </Collapse>
      </GridItem>
      {isMobile && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          height={menuState.isOpen ? '100vh' : 'auto'}
          pointerEvents="none"
          zIndex={900}
        >
          <Box height="100%" transition="all 0.3s" opacity={menuState.isOpen ? 1 : 0} />
        </Box>
      )}
    </Grid>
  );
});

export default Navigation;
