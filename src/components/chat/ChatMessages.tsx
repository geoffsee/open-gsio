import React from "react";
import {Box, Grid, GridItem} from "@chakra-ui/react";
import MessageBubble from "./MessageBubble";
import {observer} from "mobx-react-lite";
import chatStore from "../../stores/ClientChatStore";
import {useIsMobile} from "../contexts/MobileContext";

interface ChatMessagesProps {
  scrollRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = observer(({ scrollRef }) => {
  const isMobile = useIsMobile();

  return (
    <Box
      pt={isMobile ? 24 : undefined}
      overflowY={"scroll"}
      overflowX={"hidden"}
    >
      <Grid
        fontFamily="Arial, sans-serif"
        templateColumns="1fr"
        gap={2}
        bg="transparent"
        borderRadius="md"
        boxShadow="md"
        whiteSpace="pre-wrap"
      >
        {chatStore.messages.map((msg, index) => {
          if (index < chatStore.messages.length - 1) {
            return (
              <GridItem key={index}>
                <MessageBubble x scrollRef={scrollRef} msg={msg} />
              </GridItem>
            );
          } else {
            return (
              <GridItem key={index} mb={isMobile ? 4 : undefined}>
                <MessageBubble scrollRef={scrollRef} msg={msg} />
              </GridItem>
            );
          }
        })}
      </Grid>
    </Box>
  );
});

export default ChatMessages;
