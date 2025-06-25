import { Box, Grid, GridItem } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';

import menuState from '../../stores/AppMenuStore';
import chatStore from '../../stores/ClientChatStore';
import WelcomeHome from '../WelcomeHome';

import ChatInput from './input/ChatInput';
import ChatMessages from './messages/ChatMessages';

const Chat = observer(({ height, width }) => {
  const scrollRef = useRef();
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAndroid(/android/i.test(window.navigator.userAgent));
    }
  }, []);

  return (
    <Grid templateRows="1fr auto" templateColumns="1fr" height={height} width={width} gap={0}>
      <GridItem alignSelf="center" hidden={!(chatStore.items.length < 1)}>
        <WelcomeHome visible={chatStore.items.length < 1} />
      </GridItem>

      <GridItem
        overflow="auto"
        width="100%"
        maxH="100%"
        ref={scrollRef}
        // If there are attachments, use "100px". Otherwise, use "128px" on Android, "73px" elsewhere.
        pb={isAndroid ? '128px' : '73px'}
        alignSelf="flex-end"
      >
        <ChatMessages scrollRef={scrollRef} />
      </GridItem>

      <GridItem position="relative" bg="background.primary" zIndex={1000} width="100%">
        <Box w="100%" display="flex" justifyContent="center" mx="auto" hidden={menuState.isOpen}>
          <ChatInput
            input={chatStore.input}
            setInput={value => chatStore.setInput(value)}
            handleSendMessage={chatStore.sendMessage}
            isLoading={chatStore.isLoading}
          />
        </Box>
      </GridItem>
    </Grid>
  );
});

export default Chat;
