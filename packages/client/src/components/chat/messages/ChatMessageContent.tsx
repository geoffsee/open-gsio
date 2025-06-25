import React from 'react';

import MessageMarkdownRenderer from './MessageMarkdownRenderer';

const ChatMessageContent = ({ content }) => {
  return <MessageMarkdownRenderer markdown={content} />;
};

export default React.memo(ChatMessageContent);
