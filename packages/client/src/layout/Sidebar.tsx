import { Box, Flex, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';

import { useIsMobile } from '../components/contexts/MobileContext';
import FeedbackModal from '../components/feedback/FeedbackModal';
import { ThemeSelectionOptions } from '../components/ThemeSelection';
import ToolBar from '../components/toolbar/Toolbar';

import NavItem from './NavItem';

function LowerSidebarContainer({ children, isMobile, ...props }) {
  const bottom = isMobile ? undefined : '6rem';
  const position = isMobile ? 'relative' : 'absolute';
  return (
    <Box width="100%" m={0.99} position={position} bottom={bottom} {...props}>
      {children}
    </Box>
  );
}

function Sidebar({ children: navLinks }) {
  const isMobile = useIsMobile();

  return (
    <SidebarContainer isMobile={isMobile}>
      <VStack
        spacing={6}
        alignItems={isMobile ? 'flex-start' : 'flex-end'}
        letterSpacing="tighter"
        width="100%"
        height="100%"
      >
        {navLinks}

        <Box
          alignItems={isMobile ? 'flex-start' : 'flex-end'}
          bg="background.primary"
          zIndex={1000}
          width="100%"
          fontSize={'x-small'}
        >
          <LowerSidebarContainer isMobile={isMobile}>
            <ToolBar isMobile={isMobile} />
            <RegulatoryItems isMobile={isMobile} />
            <ThemeSelectionOptions />
          </LowerSidebarContainer>
        </Box>
      </VStack>

      {!isMobile && <BreathingVerticalDivider />}
    </SidebarContainer>
  );
}

function RegulatoryItems({ isMobile }) {
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const openFeedbackModal = () => setFeedbackModalOpen(true);
  const closeFeedbackModal = () => setFeedbackModalOpen(false);

  return (
    <>
      <VStack alignItems={isMobile ? 'flex-start' : 'flex-end'} spacing={1}>
        <NavItem
          color="text.tertiary"
          as={'span'}
          path=""
          cursor={'pointer'}
          onClick={openFeedbackModal}
        >
          Feedback
        </NavItem>
        <NavItem color="text.tertiary" path="/privacy-policy">
          Privacy Policy
        </NavItem>
        <NavItem color="text.tertiary" path="/terms-of-service">
          Terms of Service
        </NavItem>
      </VStack>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={closeFeedbackModal} />
    </>
  );
}

function SidebarContainer({ children, isMobile }) {
  return (
    <Flex mt={isMobile ? 28 : undefined} position="relative" height="100vh" width="100%">
      {children}
    </Flex>
  );
}

function BreathingVerticalDivider() {
  return (
    <Box
      position="absolute"
      h="150%"
      right={0}
      bottom={0}
      width="2px"
      background="text.secondary"
      animation="breathing 3s ease-in-out infinite"
    >
      <style>
        {`
                    @keyframes breathing {
                        0%, 100% {
                            opacity: 0.7;
                            transform: scaleY(1);
                        }
                        50% {
                            opacity: 1;
                            transform: scaleY(1.2);
                        }
                    }
                `}
      </style>
    </Box>
  );
}

export default Sidebar;
