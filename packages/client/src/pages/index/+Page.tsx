import { Stack } from '@chakra-ui/react';
import React, { useEffect } from 'react';

import Chat from '../../components/chat/Chat';
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
    <Stack direction="column" height="100%" width="100%" spacing={0}>
      <Chat height="100%" width="100%" />
    </Stack>
  );
}
