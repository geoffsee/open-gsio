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
  useOutsideClick,
} from '@chakra-ui/react';
import { ChevronDown, Copy, RefreshCcw, Settings } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useIsMobile as useIsMobileUserAgent } from '../../../hooks/_IsMobileHook';
import clientChatStore from '../../../stores/ClientChatStore';
import { useIsMobile } from '../../contexts/MobileContext';
import { formatConversationMarkdown } from '../lib/exportConversationAsMarkdown';

import FlyoutSubMenu from './FlyoutSubMenu';

export const MsM_commonButtonStyles = {
  bg: 'transparent',
  color: 'text.primary',
  borderRadius: 'full',
  padding: 2,
  border: 'none',
  _hover: { bg: 'rgba(255, 255, 255, 0.2)' },
  _active: { bg: 'rgba(255, 255, 255, 0.3)' },
  _focus: { boxShadow: 'none' },
};

const InputMenu: React.FC<{ isDisabled?: boolean }> = observer(({ isDisabled }) => {
  const isMobile = useIsMobile();
  const isMobileUserAgent = useIsMobileUserAgent();
  const { isOpen, onOpen, onClose, onToggle, getDisclosureProps, getButtonProps } = useDisclosure();

  const [controlledOpen, setControlledOpen] = useState<boolean>(false);
  const [supportedModels, setSupportedModels] = useState<any[]>([]);

  useEffect(() => {
    setControlledOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    fetch('/api/models')
      .then(response => response.json())
      .then(models => {
        setSupportedModels(models);
      })
      .catch(err => {
        console.error('Could not fetch models: ', err);
      });
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [isOpen]);

  const handleCopyConversation = useCallback(() => {
    navigator.clipboard
      .writeText(formatConversationMarkdown(clientChatStore.items))
      .then(() => {
        window.alert('Conversation copied to clipboard. \n\nPaste it somewhere safe!');
        onClose();
      })
      .catch(err => {
        console.error('Could not copy text to clipboard: ', err);
        window.alert('Failed to copy conversation. Please try again.');
      });
  }, [onClose]);

  async function selectModelFn({ name, value }) {
    clientChatStore.setModel(value);
  }

  function isSelectedModelFn({ name, value }) {
    return clientChatStore.model === value;
  }

  const menuRef = useRef();
  const [menuState, setMenuState] = useState();

  useOutsideClick({
    enabled: !isMobile && isOpen,
    ref: menuRef,
    handler: () => {
      handleClose();
    },
  });

  return (
    <Menu
      isOpen={controlledOpen}
      onClose={onClose}
      onOpen={onOpen}
      autoSelect={false}
      closeOnSelect={false}
      closeOnBlur={isOpen && !isMobileUserAgent}
      isLazy={true}
      lazyBehavior={'unmount'}
    >
      {isMobile ? (
        <MenuButton
          as={IconButton}
          bg="text.accent"
          icon={<Settings size={20} />}
          isDisabled={isDisabled}
          aria-label="Settings"
          _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
          _focus={{ boxShadow: 'none' }}
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
            {clientChatStore.model}
          </Text>
        </MenuButton>
      )}
      <MenuList
        bg="background.tertiary"
        border="none"
        borderRadius="md"
        boxShadow="lg"
        minW={'10rem'}
        ref={menuRef}
      >
        <FlyoutSubMenu
          title="Text Models"
          flyoutMenuOptions={supportedModels.map(modelData => ({
            name: modelData.id.split('/').pop() || modelData.id,
            value: modelData.id,
          }))}
          onClose={onClose}
          parentIsOpen={isOpen}
          setMenuState={setMenuState}
          handleSelect={selectModelFn}
          isSelected={isSelectedModelFn}
        />
        <Divider color="text.tertiary" />
        {/*Export conversation button*/}
        <MenuItem
          bg="background.tertiary"
          color="text.primary"
          onClick={handleCopyConversation}
          _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
          _focus={{ bg: 'rgba(0, 0, 0, 0.1)' }}
        >
          <Flex align="center">
            <Copy size="16px" style={{ marginRight: '8px' }} />
            <Box>Export</Box>
          </Flex>
        </MenuItem>
        {/*New conversation button*/}
        <MenuItem
          bg="background.tertiary"
          color="text.primary"
          onClick={() => {
            clientChatStore.reset();
            onClose();
          }}
          _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
          _focus={{ bg: 'rgba(0, 0, 0, 0.1)' }}
        >
          <Flex align="center">
            <RefreshCcw size="16px" style={{ marginRight: '8px' }} />
            <Box>New</Box>
          </Flex>
        </MenuItem>
      </MenuList>
    </Menu>
  );
});

export default InputMenu;
