import React, { KeyboardEvent, useState } from "react";
import { Box, Flex, IconButton, Textarea } from "@chakra-ui/react";
import { Check, X } from "lucide-react";
import { observer } from "mobx-react-lite";
import { Instance } from "mobx-state-tree";
import Message from "../../../models/Message";
import clientChatStore from "../../../stores/ClientChatStore";
import UserOptionsStore from "../../../stores/UserOptionsStore";

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

      // Set follow mode and loading state
      UserOptionsStore.setFollowModeEnabled(true);
      clientChatStore.setIsLoading(true);

      try {
        // Add a small delay before adding the assistant message (for better UX)
        await new Promise((r) => setTimeout(r, 500));

        // Add an empty assistant message
        clientChatStore.add(Message.create({ content: "", role: "assistant" }));
        const payload = { messages: clientChatStore.items.slice(), model: clientChatStore.model };

        // Make API call
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.status === 429) {
          clientChatStore.updateLast("Too many requests • please slow down.");
          clientChatStore.setIsLoading(false);
          UserOptionsStore.setFollowModeEnabled(false);
          return;
        }
        if (response.status > 200) {
          clientChatStore.updateLast("Error • something went wrong.");
          clientChatStore.setIsLoading(false);
          UserOptionsStore.setFollowModeEnabled(false);
          return;
        }

        const { streamUrl } = await response.json();
        const eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === "error") {
              clientChatStore.updateLast(parsed.error);
              clientChatStore.setIsLoading(false);
              UserOptionsStore.setFollowModeEnabled(false);
              eventSource.close();
              return;
            }

            if (parsed.type === "chat" && parsed.data.choices[0]?.finish_reason === "stop") {
              clientChatStore.appendLast(parsed.data.choices[0]?.delta?.content ?? "");
              clientChatStore.setIsLoading(false);
              UserOptionsStore.setFollowModeEnabled(false);
              eventSource.close();
              return;
            }

            if (parsed.type === "chat") {
              clientChatStore.appendLast(parsed.data.choices[0]?.delta?.content ?? "");
            }
          } catch (err) {
            console.error("stream parse error", err);
          }
        };

        eventSource.onerror = () => {
          clientChatStore.updateLast("Error • connection lost.");
          clientChatStore.setIsLoading(false);
          UserOptionsStore.setFollowModeEnabled(false);
          eventSource.close();
        };
      } catch (err) {
        console.error("sendMessage", err);
        clientChatStore.updateLast("Sorry • network error.");
        clientChatStore.setIsLoading(false);
        UserOptionsStore.setFollowModeEnabled(false);
      }
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
