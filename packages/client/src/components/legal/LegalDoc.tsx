import React from "react";
import { Box, VStack } from "@chakra-ui/react";
import {renderMarkdown} from "../markdown/MarkdownComponent";

function LegalDoc({ text }) {
  return (
    <Box maxWidth="800px" margin="0 auto">
      <VStack spacing={6} align="stretch">
        <Box
          color="text.primary"
          wordBreak="break-word"
          whiteSpace="pre-wrap"
          spacing={4}
        >
            {renderMarkdown(text)}
        </Box>
      </VStack>
    </Box>
  );
}

export default LegalDoc;
