import { Box } from '@chakra-ui/react';
import React from 'react';

function NavItem({ path, children, color, onClick, as, cursor }) {
  return (
    <Box
      as={as ?? 'a'}
      href={path}
      mb={2}
      cursor={cursor}
      // ml={5}
      mr={2}
      color={color ?? 'text.accent'}
      letterSpacing="normal"
      display="block"
      position="relative"
      textAlign="right"
      onClick={onClick}
      _after={{
        content: '""',
        position: 'absolute',
        width: '100%',
        height: '2px',
        bottom: '0',
        left: '0',
        bg: 'accent.secondary',
        transform: 'scaleX(0)',
        transformOrigin: 'right',
        transition: 'transform 0.3s ease-in-out',
      }}
      _hover={{
        color: 'tertiary.tertiary',
        _after: {
          transform: 'scaleX(1)',
        },
      }}
    >
      {children}
    </Box>
  );
}

export default NavItem;
