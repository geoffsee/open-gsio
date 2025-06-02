import React, { useState, useEffect } from "react";
import { Image, Box, Spinner, Text, Flex } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const shimmer = keyframes`
    0% { background-position: -100% 0; }
    100% { background-position: 100% 0; }
`;

const ImageWithFallback = ({
  alt,
  src,
  fallbackSrc = "/fallback.png",
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const isSlowLoadingSource = src.includes("text2image.seemueller.io");

  const handleImageLoad = () => setIsLoading(false);
  const handleImageError = () => {
    setIsLoading(false);
    props.onError?.();
  };

  useEffect(() => {
    setIsLoading(true);
  }, [src]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setScrollPosition(scrolled);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const parallaxOffset = scrollPosition * 0.2;

  return (
    <Box
      position="relative"
      w="full"
      maxW="full"
      borderRadius="md"
      my={2}
      overflow="hidden"
    >
      {isLoading && isSlowLoadingSource && (
        <Flex
          align="center"
          justify="center"
          direction="column"
          w="full"
          h="300px"
          borderRadius="md"
          bg="background.secondary"
          backgroundImage="linear-gradient(90deg, rgba(51,51,51,0.2) 25%, rgba(34,34,34,0.4) 50%, rgba(51,51,51,0.2) 75%)"
          backgroundSize="200% 100%"
          animation={`${shimmer} 1.5s infinite`}
        >
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text fontSize="lg" color="gray.600">
            Generating...
          </Text>
        </Flex>
      )}
      <Image
        src={src}
        alt={alt}
        fallbackSrc={fallbackSrc}
        onLoad={handleImageLoad}
        onError={handleImageError}
        display={isLoading ? "none" : "block"}
        transform={`translateY(${parallaxOffset}px)`}
        transition="transform 0.1s ease-out"
        {...props}
      />
    </Box>
  );
};

export default ImageWithFallback;
