import { Badge, Box, Flex, Heading, Image, Text } from '@chakra-ui/react';
import React from 'react';

function DemoCard({ icon, title, description, imageUrl, badge, onClick }) {
  return (
    <Box
      bg="background.secondary"
      borderRadius="md"
      overflowY="hidden"
      boxShadow="md"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
      color="text.primary"
      onClick={onClick}
      display="flex"
      flexDirection="column"
      minW={'12rem'}
      maxW={'18rem'}
      minH={'35rem'}
      maxH={'20rem'}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={title}
          objectFit="cover"
          minH="16rem"
          maxH="20rem"
          width="100%"
        />
      )}
      <Flex direction="column" flex="1" p={4}>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Heading as="h4" size="md" ml={2}>
            {title}
          </Heading>
        </Box>
        <Text fontSize="sm" flex="1">
          {description}
        </Text>
      </Flex>
      {badge && (
        <Box p={2}>
          <Badge colorScheme={'teal'}>{badge}</Badge>
        </Box>
      )}
    </Box>
  );
}

export default DemoCard;
