import React from "react";
import { renderCustomComponents } from "./renderCustomComponents";
import { renderCustomComponents as renderWelcomeHomeMarkdown } from "./RenderWelcomeHomeCustomComponents";
import { Box } from "@chakra-ui/react";

interface CustomMarkdownRendererProps {
  markdown: string;
}

const CustomMarkdownRenderer: React.FC<CustomMarkdownRendererProps> = ({
  markdown,
}) => {
  return <div>{renderCustomComponents(markdown)}</div>;
};

export const WelcomeHomeMarkdownRenderer: React.FC<
  CustomMarkdownRendererProps
> = ({ markdown }) => {
  return <Box color="text.accent">{renderWelcomeHomeMarkdown(markdown)}</Box>;
};

export default CustomMarkdownRenderer;
