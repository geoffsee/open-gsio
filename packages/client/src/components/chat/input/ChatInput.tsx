import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Grid,
  GridItem,
  useBreakpointValue,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import chatStore from "../../../stores/ClientChatStore";
import InputMenu from "../input-menu/InputMenu";
import InputTextarea from "./ChatInputTextArea";
import SendButton from "./ChatInputSendButton";
import { useMaxWidth } from "../../../hooks/useMaxWidth";
import userOptionsStore from "../../../stores/UserOptionsStore";

const ChatInput = observer(() => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxWidth = useMaxWidth();
  const [inputValue, setInputValue] = useState<string>("");

  const [containerHeight, setContainerHeight] = useState(56);
  const [containerBorderRadius, setContainerBorderRadius] = useState(9999);

  const [shouldFollow, setShouldFollow] = useState<boolean>(
    userOptionsStore.followModeEnabled,
  );
  const [couldFollow, setCouldFollow] = useState<boolean>(chatStore.isLoading);

  const [inputWidth, setInputWidth] = useState<string>("50%");

  useEffect(() => {
    setShouldFollow(chatStore.isLoading && userOptionsStore.followModeEnabled);
    setCouldFollow(chatStore.isLoading);
  }, [chatStore.isLoading, userOptionsStore.followModeEnabled]);

  useEffect(() => {
    inputRef.current?.focus();
    setInputValue(chatStore.input);
  }, [chatStore.input]);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const newHeight = entry.target.clientHeight;
          setContainerHeight(newHeight);

          const newBorderRadius = Math.max(28 - (newHeight - 56) * 0.2, 16);
          setContainerBorderRadius(newBorderRadius);
        }
      });

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    chatStore.sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatStore.sendMessage();
    }
  };

  const inputMaxWidth = useBreakpointValue(
    { base: "50rem", lg: "50rem", md: "80%", sm: "100vw" },
    { ssr: true },
  );
  const inputMinWidth = useBreakpointValue({ lg: "40rem" }, { ssr: true });

  useEffect(() => {
    setInputWidth("100%");
  }, [inputMaxWidth, inputMinWidth]);

  return (
    <Box
      width={inputWidth}
      maxW={inputMaxWidth}
      minWidth={inputMinWidth}
      mx="auto"
      p={2}
      pl={2}
      pb={`calc(env(safe-area-inset-bottom) + 16px)`}
      bottom={0}
      position="fixed"
      zIndex={1000}
    >
      {couldFollow && (
        <Box
          position="absolute"
          top={-8}
          right={0}
          zIndex={1001}
          display="flex"
          justifyContent="flex-end"
        >
          <Button
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={(_) => {
              userOptionsStore.toggleFollowMode();
            }}
            isDisabled={!chatStore.isLoading}
          >
            {shouldFollow ? "Disable Follow Mode" : "Enable Follow Mode"}
          </Button>
        </Box>
      )}
      <Grid
        ref={containerRef}
        p={2}
        bg="background.secondary"
        borderRadius={`${containerBorderRadius}px`}
        templateColumns="auto 1fr auto"
        gap={2}
        alignItems="center"
        style={{
          transition: "border-radius 0.2s ease",
        }}
      >
        <GridItem>
          <InputMenu
            selectedModel={chatStore.model}
            onSelectModel={chatStore.setModel}
            isDisabled={chatStore.isLoading}
          />
        </GridItem>
        <GridItem>
          <InputTextarea
            inputRef={inputRef}
            value={chatStore.input}
            onChange={chatStore.setInput}
            onKeyDown={handleKeyDown}
            isLoading={chatStore.isLoading}
          />
        </GridItem>
        <GridItem>
          <SendButton
            isLoading={chatStore.isLoading}
            isDisabled={chatStore.isLoading || !chatStore.input.trim()}
            onClick={handleSubmit}
          />
        </GridItem>
      </Grid>
    </Box>
  );
});

export default ChatInput;
