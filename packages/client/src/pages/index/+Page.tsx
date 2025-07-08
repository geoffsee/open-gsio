import { Grid, GridItem, Stack } from '@chakra-ui/react';
import React, { useEffect } from 'react';

import Chat from '../../components/chat/Chat.tsx';
import { LandingComponent } from '../../components/landing-component/LandingComponent.tsx';
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
  return (
    <Grid templateColumns="repeat(2, 1fr)" height="100%" width="100%" gap={0}>
      <GridItem>
        <LandingComponent />
      </GridItem>
      <GridItem p={2}>
        <Chat />
      </GridItem>
    </Grid>
  );
}
