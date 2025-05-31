import React, { KeyboardEvent, useState } from "react";
import { Box, Flex, IconButton, Textarea } from "@chakra-ui/react";
import { Check, X } from "lucide-react";
import { observer } from "mobx-react-lite";
import { Instance } from "mobx-state-tree";
import Message from "../../../models/Message";
import clientChatStore from "../../../stores/ClientChatStore";

interface MessageEditorProps {
  message: Instance<typeof Message>;
  onCancel: () => void;
}

const MessageEditor = observer(({ message, onCancel }: MessageEditorProps) => {
  const [editedContent, setEditedContent] = useState(message.content);

  const handleSave = async () => {
    message.setContent(editedContent);

    // Find the index of the edited message
    const messageIndex = clientChatStore.items.indexOf(message);
    if (messageIndex !== -1) {
      // Remove all messages after the edited message
      clientChatStore.removeAfter(messageIndex);

      // Send the message
      clientChatStore.sendMessage();
    }

    onCancel();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }

    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <Box width="100%">
      <Textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        onKeyDown={handleKeyDown}
        minHeight="100px"
        bg="transparent"
        border="1px solid"
        borderColor="whiteAlpha.300"
        _hover={{ borderColor: "whiteAlpha.400" }}
        _focus={{ borderColor: "brand.100", boxShadow: "none" }}
        resize="vertical"
        color="text.primary"
      />
      <Flex justify="flex-end" mt={2} gap={2}>
        <IconButton
          aria-label="Cancel edit"
          icon={<X />}
          onClick={onCancel}
          size="sm"
          variant="ghost"
          color={"accent.danger"}
        />
        <IconButton
          aria-label="Save edit"
          icon={<Check />}
          onClick={handleSave}
          size="sm"
          variant="ghost"
          color={"accent.confirm"}
        />
      </Flex>
    </Box>
  );
});

export default MessageEditor;
