import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import { usePageContext } from "../renderer/usePageContext";
import Routes from "../renderer/routes";
import { useIsMobile } from "../components/contexts/MobileContext";

export default function Hero() {
  const pageContext = usePageContext();
  const isMobile = useIsMobile();

  return (
    <Box p={2}>
      <Box>
        <Heading
          textAlign={isMobile ? "left" : "right"}
          minWidth="90px"
          maxWidth={"220px"}
          color="text.accent"
          as="h3"
          letterSpacing={"tight"}
          size="lg"
        >
          {Routes[normalizePath(pageContext.urlPathname)]?.heroLabel}
        </Heading>
      </Box>

      <Text
        isTruncated
        maxWidth="100%"
        whiteSpace="nowrap"
        letterSpacing={"tight"}
        color="text.accent"
        textAlign={isMobile ? "left" : "right"}
        overflow="hidden"
      >
        {new Date().toLocaleDateString()}
      </Text>
    </Box>
  );
}

const normalizePath = (path) => {
  if (!path) return "/";
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path.toLowerCase();
};
