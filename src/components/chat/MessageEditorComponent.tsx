import React, { KeyboardEvent, useState } from "react";
import { Box, Flex, IconButton, Textarea } from "@chakra-ui/react";
import { Check, X } from "lucide-react";
import { observer } from "mobx-react-lite";
import store, { type IMessage } from "../../stores/ClientChatStore";

interface MessageEditorProps {
  message: IMessage;
  onCancel: () => void;
}

const MessageEditor = observer(({ message, onCancel }: MessageEditorProps) => {
  const [editedContent, setEditedContent] = useState(message.content);

  const handleSave = () => {
    const messageIndex = store.messages.indexOf(message);
    if (messageIndex !== -1) {
      store.editMessage(messageIndex, editedContent);
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
