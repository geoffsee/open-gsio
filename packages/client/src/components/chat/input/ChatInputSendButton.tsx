import React from "react";
import { Button } from "@chakra-ui/react";
import clientChatStore from "../../../stores/ClientChatStore";
import { CirclePause, Send } from "lucide-react";

import { motion } from "framer-motion";

interface SendButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  onClick: (e: React.FormEvent) => void;
  onStop?: () => void;
}

const SendButton: React.FC<SendButtonProps> = ({ onClick }) => {
  const isDisabled =
    clientChatStore.input.trim().length === 0 && !clientChatStore.isLoading;
  return (
    <Button
      onClick={(e) =>
        clientChatStore.isLoading
          ? clientChatStore.stopIncomingMessage()
          : onClick(e)
      }
      bg="transparent"
      color={
        clientChatStore.input.trim().length <= 1 ? "brand.700" : "text.primary"
      }
      borderRadius="full"
      p={2}
      isDisabled={isDisabled}
      _hover={{ bg: !isDisabled ? "rgba(255, 255, 255, 0.2)" : "inherit" }}
      _active={{ bg: !isDisabled ? "rgba(255, 255, 255, 0.3)" : "inherit" }}
      _focus={{ boxShadow: "none" }}
    >
      {clientChatStore.isLoading ? <MySpinner /> : <Send size={20} />}
    </Button>
  );
};

const MySpinner = ({ onClick }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{
      duration: 0.4,
      ease: "easeInOut",
    }}
  >
    <CirclePause color={"#F0F0F0"} size={24} onClick={onClick} />
  </motion.div>
);

export default SendButton;
