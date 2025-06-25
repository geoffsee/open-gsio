import React from 'react';

import { renderMessageMarkdown } from './MessageMarkdown';

interface CustomMarkdownRendererProps {
  markdown: string;
}

const MessageMarkdownRenderer: React.FC<CustomMarkdownRendererProps> = ({ markdown }) => {
  return <div>{renderMessageMarkdown(markdown)}</div>;
};

export default MessageMarkdownRenderer;
