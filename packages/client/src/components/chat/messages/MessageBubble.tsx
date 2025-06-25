import { Box, Flex, Text } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';

import clientChatStore from '../../../stores/ClientChatStore';
import UserOptionsStore from '../../../stores/UserOptionsStore';

import MessageRenderer from './ChatMessageContent';
import MessageEditor from './MessageEditorComponent';
import MotionBox from './MotionBox';
import UserMessageTools from './UserMessageTools';

const LoadingDots = () => {
  return (
    <Flex>
      {[0, 1, 2].map(i => (
        <MotionBox
          key={i}
          width="8px"
          height="8px"
          borderRadius="50%"
          backgroundColor="text.primary"
          margin="0 4px"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </Flex>
  );
};

function renderMessage(msg: any) {
  if (msg.role === 'user') {
    return (
      <Text as="p" fontSize="sm" lineHeight="short" color="text.primary">
        {msg.content}
      </Text>
    );
  }
  return <MessageRenderer content={msg.content} />;
}

const MessageBubble = observer(({ msg, scrollRef }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isUser = msg.role === 'user';
  const senderName = isUser ? 'You' : "Geoff's AI";
  const isLoading = !msg.content || !(msg.content.trim().length > 0);
  const messageRef = useRef();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    if (
      clientChatStore.items.length > 0 &&
      clientChatStore.isLoading &&
      UserOptionsStore.followModeEnabled
    ) {
      // Refine condition
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'auto',
      });
    }
  });

  return (
    <Flex
      flexDirection="column"
      alignItems={isUser ? 'flex-end' : 'flex-start'}
      role="listitem"
      flex={0}
      aria-label={`Message from ${senderName}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Text
        fontSize="xs"
        color="text.tertiary"
        textAlign={isUser ? 'right' : 'left'}
        alignSelf={isUser ? 'flex-end' : 'flex-start'}
        mb={1}
      >
        {senderName}
      </Text>

      <MotionBox
        minW={{ base: '99%', sm: '99%', lg: isUser ? '55%' : '60%' }}
        maxW={{ base: '99%', sm: '99%', lg: isUser ? '65%' : '65%' }}
        p={3}
        borderRadius="1.5em"
        bg={isUser ? '#0A84FF' : '#3A3A3C'}
        color="text.primary"
        textAlign="left"
        boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        overflow="hidden"
        wordBreak="break-word"
        whiteSpace="pre-wrap"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Box
            flex="1"
            overflowWrap="break-word"
            whiteSpace="pre-wrap"
            ref={messageRef}
            sx={{
              'pre, code': {
                maxWidth: '100%',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
              },
            }}
          >
            {isEditing ? (
              <MessageEditor message={msg} onCancel={handleCancelEdit} />
            ) : isLoading ? (
              <LoadingDots />
            ) : (
              renderMessage(msg)
            )}
          </Box>
          {isUser && (
            <Box
              ml={2}
              width="32px"
              height="32px"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              {isHovered && !isEditing && <UserMessageTools message={msg} onEdit={handleEdit} />}
            </Box>
          )}
        </Flex>
      </MotionBox>
    </Flex>
  );
});

export default MessageBubble;
