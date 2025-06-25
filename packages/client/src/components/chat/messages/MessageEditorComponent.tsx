import { Box, Flex, IconButton, Textarea } from '@chakra-ui/react';
import { Check, X } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { type Instance } from 'mobx-state-tree';
import React, { type KeyboardEvent, useEffect } from 'react';

import Message from '../../../models/Message';
import messageEditorStore from '../../../stores/MessageEditorStore';

interface MessageEditorProps {
  message: Instance<typeof Message>;
  onCancel: () => void;
}

const MessageEditor = observer(({ message, onCancel }: MessageEditorProps) => {
  useEffect(() => {
    messageEditorStore.setMessage(message);

    return () => {
      messageEditorStore.onCancel();
    };
  }, [message]);

  const handleCancel = () => {
    messageEditorStore.onCancel();
    onCancel();
  };

  const handleSave = async () => {
    await messageEditorStore.handleSave();
    onCancel();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <Box width="100%">
      <Textarea
        value={messageEditorStore.editedContent}
        onChange={e => messageEditorStore.setEditedContent(e.target.value)}
        onKeyDown={handleKeyDown}
        minHeight="100px"
        bg="transparent"
        border="1px solid"
        borderColor="whiteAlpha.300"
        _hover={{ borderColor: 'whiteAlpha.400' }}
        _focus={{ borderColor: 'brand.100', boxShadow: 'none' }}
        resize="vertical"
        color="text.primary"
      />
      <Flex justify="flex-end" mt={2} gap={2}>
        <IconButton
          aria-label="Cancel edit"
          icon={<X />}
          onClick={handleCancel}
          size="sm"
          variant="ghost"
          color={'accent.danger'}
        />
        <IconButton
          aria-label="Save edit"
          icon={<Check />}
          onClick={handleSave}
          size="sm"
          variant="ghost"
          color={'accent.confirm'}
        />
      </Flex>
    </Box>
  );
});

export default MessageEditor;
