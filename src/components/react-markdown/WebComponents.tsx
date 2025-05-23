import React from "react";
import {
  Box,
  Divider,
  Heading,
  Link,
  List,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import ImageWithFallback from "../chat/ImageWithFallback";
import { MdCheckCircle } from "react-icons/md";

export const webComponents = {
  p: ({ children }) => (
    <Text fontSize="sm" lineHeight="short">
      {children}
    </Text>
  ),
  strong: ({ children }) => <strong>{children}</strong>,
  h1: ({ children }) => (
    <Heading as="h1" size="xl" mt={4} mb={2}>
      {children}
    </Heading>
  ),
  h2: ({ children }) => (
    <Heading as="h2" size="lg" mt={3} mb={2}>
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading as="h3" size="md" mt={2} mb={1}>
      {children}
    </Heading>
  ),
  h4: ({ children }) => (
    <Heading as="h4" size="sm" mt={2} mb={1}>
      {children}
    </Heading>
  ),
  ul: ({ children }) => (
    <UnorderedList
      // pl={3}
      // mb={2}
      fontSize="sm"
      // stylePosition="inside" // Keep bullets inside the text flow
    >
      {children}
    </UnorderedList>
  ),

  ol: ({ children }) => (
    <OrderedList fontSize="sm" spacing={2}>
      {children}
    </OrderedList>
  ),
  li: ({ children, ...rest }) => {
    const filteredChildren = React.Children.toArray(children)
      .filter((child) => !(typeof child === "string" && child.trim() === "\n"))
      .map((child, index, array) => {
        // if (typeof child === 'string' && index === array.length - 1 && /\n/.test(child)) {
        //     return '\n';
        // }
        return child;
      });

    return <ListItem {...rest}>{filteredChildren}</ListItem>;
  },
  pre: ({ children }) => (
    <Box
      as="pre"
      whiteSpace="pre-wrap"
      bg="background.secondary"
      borderRadius="md"
      fontSize="sm"
    >
      {children}
    </Box>
  ),

  blockquote: ({ children }) => (
    <Box
      as="blockquote"
      borderLeft="4px solid"
      borderColor="gray.200"
      fontStyle="italic"
      color="gray.600"
      pl={4}
    >
      {children}
    </Box>
  ),
  hr: () => <Divider my={4} />,
  a: ({ href, children }) => (
    <Link
      color="teal.500"
      href={href}
      isExternal
      maxWidth="100%"
      wordBreak="break-word"
    >
      {children}
    </Link>
  ),
  img: ({ alt, src }) => <ImageWithFallback alt={alt} src={src} />,
  icon_list: ({ children }) => (
    <List spacing={3}>
      {React.Children.map(children, (child) => (
        <ListItem>
          <Box
            as={MdCheckCircle}
            color="green.500"
            mr={2}
            display="inline-block"
          />
          {child}
        </ListItem>
      ))}
    </List>
  ),
};
