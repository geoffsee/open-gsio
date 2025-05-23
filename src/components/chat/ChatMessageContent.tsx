import React from "react";

import CustomMarkdownRenderer from "./CustomMarkdownRenderer";

const ChatMessageContent = ({ content }) => {
  return <CustomMarkdownRenderer markdown={content} />;
};

export default React.memo(ChatMessageContent);
