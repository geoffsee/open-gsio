import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import feedbackState from '../../stores/ClientFeedbackStore';

const FeedbackModal = observer(({ isOpen, onClose, zIndex }) => {
  const toast = useToast();

  const handleSubmitFeedback = async () => {
    const success = await feedbackState.submitFeedback();

    if (success) {
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      feedbackState.reset();
      onClose();
    } else if (feedbackState.error) {
      if (!feedbackState.input.trim() || feedbackState.input.length > 500) {
        return;
      }

      toast({
        title: 'Submission Failed',
        description: feedbackState.error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    feedbackState.reset();
    onClose();
  };

  const charactersRemaining = 500 - (feedbackState.input?.length || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      motionPreset="slideInBottom"
      zIndex={zIndex}
    >
      <ModalOverlay />
      <ModalContent bg="gray.800" color="text.primary">
        <ModalHeader textAlign="center">Feedback</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="md" textAlign="center">
              Your thoughts help me improve. Let me know what you think!
            </Text>

            <Box position="relative">
              <Textarea
                placeholder="Type your feedback here..."
                value={feedbackState.input}
                onChange={e => feedbackState.setInput(e.target.value)}
                bg="gray.700"
                color="white"
                minHeight="120px"
                resize="vertical"
              />
              <Text
                position="absolute"
                bottom="2"
                right="2"
                fontSize="xs"
                color={charactersRemaining < 50 ? 'orange.300' : 'gray.400'}
              >
                {charactersRemaining} characters remaining
              </Text>
            </Box>

            {feedbackState.error && (
              <Text color="red.500" fontSize="sm">
                {feedbackState.error}
              </Text>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={handleSubmitFeedback}
            isLoading={feedbackState.isLoading}
            colorScheme="teal"
            mr={3}
            disabled={feedbackState.isLoading || !feedbackState.input.trim()}
          >
            Submit
          </Button>
          <Button variant="outline" onClick={handleClose} colorScheme="gray">
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default FeedbackModal;
