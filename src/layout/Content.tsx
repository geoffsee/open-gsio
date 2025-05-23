import { Flex } from "@chakra-ui/react";
import React from "react";
import { useIsMobile } from "../components/contexts/MobileContext";
function Content({ children }) {
  const isMobile = useIsMobile();
  return (
    <Flex flexDirection="column" w="100%" h="100vh" p={!isMobile ? 4 : 1}>
      {children}
    </Flex>
  );
}

export default Content;
