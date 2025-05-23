import React, { useCallback } from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { ChevronDown, Copy, RefreshCcw, Settings } from "lucide-react";
import ClientChatStore from "../../stores/ClientChatStore";
import clientChatStore from "../../stores/ClientChatStore";
import FlyoutSubMenu from "./FlyoutSubMenu";
import { useIsMobile } from "../contexts/MobileContext";
import { getModelFamily, SUPPORTED_MODELS } from "./SupportedModels";
import { formatConversationMarkdown } from "./exportConversationAsMarkdown";

// Common styles for MenuButton and IconButton
export const MsM_commonButtonStyles = {
  bg: "transparent",
  color: "text.primary",
  borderRadius: "full",
  padding: 2,
  border: "none",
  _hover: { bg: "rgba(255, 255, 255, 0.2)" },
  _active: { bg: "rgba(255, 255, 255, 0.3)" },
  _focus: { boxShadow: "none" },
};

const InputMenu: React.FC<{ isDisabled?: boolean }> = observer(
  ({ isDisabled }) => {
    const isMobile = useIsMobile();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const textModels = SUPPORTED_MODELS;

    const handleCopyConversation = useCallback(() => {
      navigator.clipboard
        .writeText(formatConversationMarkdown(ClientChatStore.messages))
        .then(() => {
          window.alert(
            "Conversation copied to clipboard. \n\nPaste it somewhere safe!",
          );
          onClose();
        })
        .catch((err) => {
          console.error("Could not copy text to clipboard: ", err);
          window.alert("Failed to copy conversation. Please try again.");
        });
    }, [onClose]);

    async function selectModelFn({ name, value }) {
      if (getModelFamily(value)) {
        ClientChatStore.setModel(value);
      }
    }

    function isSelectedModelFn({ name, value }) {
      return ClientChatStore.model === value;
    }

    return (
      <Menu
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        closeOnSelect={false}
        closeOnBlur={true}
      >
        {isMobile ? (
          <MenuButton
            as={IconButton}
            bg="text.accent"
            icon={<Settings size={20} />}
            isDisabled={isDisabled}
            aria-label="Settings"
            _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
            _focus={{ boxShadow: "none" }}
            {...MsM_commonButtonStyles}
          />
        ) : (
          <MenuButton
            as={Button}
            rightIcon={<ChevronDown size={16} />}
            isDisabled={isDisabled}
            variant="ghost"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            minW="auto"
            {...MsM_commonButtonStyles}
          >
            <Text noOfLines={1} maxW="100px" fontSize="sm">
              {ClientChatStore.model}
            </Text>
          </MenuButton>
        )}
        <MenuList
          bg="background.tertiary"
          border="none"
          borderRadius="md"
          boxShadow="lg"
          minW={"10rem"}
        >
          <Divider color="text.tertiary" />
          <FlyoutSubMenu
            title="Text Models"
            flyoutMenuOptions={textModels.map((m) => ({ name: m, value: m }))}
            onClose={onClose}
            parentIsOpen={isOpen}
            handleSelect={selectModelFn}
            isSelected={isSelectedModelFn}
          />
          <Divider color="text.tertiary" />
          {/*Export conversation button*/}
          <MenuItem
            bg="background.tertiary"
            color="text.primary"
            onClick={handleCopyConversation}
            _hover={{ bg: "rgba(0, 0, 0, 0.05)" }}
            _focus={{ bg: "rgba(0, 0, 0, 0.1)" }}
          >
            <Flex align="center">
              <Copy size="16px" style={{ marginRight: "8px" }} />
              <Box>Export</Box>
            </Flex>
          </MenuItem>
          {/*New conversation button*/}
          <MenuItem
            bg="background.tertiary"
            color="text.primary"
            onClick={() => {
              onClose();
              clientChatStore.reset();
            }}
            _hover={{ bg: "rgba(0, 0, 0, 0.05)" }}
            _focus={{ bg: "rgba(0, 0, 0, 0.1)" }}
          >
            <Flex align="center">
              <RefreshCcw size="16px" style={{ marginRight: "8px" }} />
              <Box>New</Box>
            </Flex>
          </MenuItem>
        </MenuList>
      </Menu>
    );
  },
);

export default InputMenu;
