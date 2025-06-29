import {
  Box,
  Divider,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronRight } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React, { useRef } from 'react';

const FlyoutSubMenu: React.FC<{
  title: string;
  flyoutMenuOptions: { name: string; value: string }[];
  onClose: () => void;
  handleSelect: (item) => Promise<void>;
  isSelected?: (item) => boolean;
  parentIsOpen: boolean;
  setMenuState?: (state) => void;
}> = observer(
  ({ title, flyoutMenuOptions, onClose, handleSelect, isSelected, parentIsOpen, setMenuState }) => {
    const { isOpen, onOpen, onClose: onSubMenuClose } = useDisclosure();

    const menuRef = new useRef();

    return (
      <Menu
        placement="right-start"
        isOpen={isOpen && parentIsOpen}
        closeOnBlur={true}
        lazyBehavior={'keepMounted'}
        isLazy={true}
        onClose={e => {
          onSubMenuClose();
        }}
        closeOnSelect={false}
      >
        <MenuButton
          as={MenuItem}
          onClick={onOpen}
          ref={menuRef}
          bg="background.tertiary"
          color="text.primary"
          _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
          _focus={{ bg: 'rgba(0, 0, 0, 0.1)' }}
        >
          <HStack width={'100%'} justifyContent={'space-between'}>
            <Text>{title}</Text>
            <ChevronRight size={'1rem'} />
          </HStack>
        </MenuButton>
        <Portal>
          <MenuList
            key={title}
            maxHeight={56}
            overflowY="scroll"
            visibility={'visible'}
            minWidth="180px"
            bg="background.tertiary"
            boxShadow="lg"
            transform="translateY(-50%)"
            zIndex={9999}
            position="absolute"
            left="100%"
            bottom={-10}
            sx={{
              '::-webkit-scrollbar': {
                width: '8px',
              },
              '::-webkit-scrollbar-thumb': {
                background: 'background.primary',
                borderRadius: '4px',
              },
              '::-webkit-scrollbar-track': {
                background: 'background.tertiary',
              },
            }}
          >
            {flyoutMenuOptions.map((item, index) => (
              <Box key={'itemflybox' + index}>
                <MenuItem
                  key={'itemfly' + index}
                  onClick={() => {
                    onSubMenuClose();
                    onClose();
                    handleSelect(item);
                  }}
                  bg={isSelected(item) ? 'background.secondary' : 'background.tertiary'}
                  _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
                  _focus={{ bg: 'rgba(0, 0, 0, 0.1)' }}
                >
                  {item.name}
                </MenuItem>
                {index < flyoutMenuOptions.length - 1 && (
                  <Divider key={item.name + '-divider'} color="text.tertiary" w={'100%'} />
                )}
              </Box>
            ))}
          </MenuList>
        </Portal>
      </Menu>
    );
  },
);

export default FlyoutSubMenu;
