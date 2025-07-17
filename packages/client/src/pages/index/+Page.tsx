import { Box, Grid, GridItem, Stack } from '@chakra-ui/react';
import React, { useEffect } from 'react';

import Chat from '../../components/chat/Chat.tsx';
import { useComponent } from '../../components/contexts/ComponentContext.tsx';
import { LandingComponent } from '../../components/landing-component/LandingComponent.tsx';
import ReactMap from '../../components/landing-component/Map.tsx';
import clientChatStore from '../../stores/ClientChatStore';

// renders "/"
export default function IndexPage() {
  useEffect(() => {
    try {
      const model = localStorage.getItem('recentModel');

      clientChatStore.setModel(model as string);
    } catch (_) {
      // Fall back to default model
    }
  }, []);

  const component = useComponent();

  return (
    <Grid templateColumns="1" height="100%" width="100%" gap={0}>
      <GridItem>
        <LandingComponent />

        <Box
          display={component.enabledComponent === 'ai' ? undefined : 'none'}
          width="100%"
          height="100%"
          overflowY="scroll"
        >
          <Chat />
        </Box>
        <Box
          display={component.enabledComponent === 'gpsmap' ? undefined : 'none'}
          width="100%"
          height="100%"
        >
          <ReactMap visible={component.enabledComponent === 'gpsmap'} />
        </Box>
      </GridItem>
    </Grid>
  );
}
