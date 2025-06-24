import React from "react";
import { Box, Textarea } from "@chakra-ui/react";

export const MarkdownEditor = (props: {
  placeholder: string;
  markdown: string;
  onChange: (p: any) => any;
}) => {
  return (
    <Box>
      <Textarea
        value={props.markdown}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        width="100%"
        minHeight="150px"
        height="100%"
        resize="none"
        borderColor="text.accent"
      />
    </Box>
  );
};
