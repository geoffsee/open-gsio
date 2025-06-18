import React, { useState, useEffect, useCallback } from "react";
import { buildCodeHighlighter } from "./CodeHighlighter";

interface CodeBlockProps {
  language: string;
  code: string;
  onRenderComplete: () => void;
}

const highlighter = buildCodeHighlighter();

const CodeBlock: React.FC<CodeBlockProps> = ({
  language,
  code,
  onRenderComplete,
}) => {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const highlightCode = useCallback(async () => {
    try {
      const highlighted = (await highlighter).codeToHtml(code, {
        lang: language,
        theme: "github-dark",
      });
      setHtml(highlighted);
    } catch (error) {
      console.error("Error highlighting code:", error);
      setHtml(`<pre>${code}</pre>`);
    } finally {
      setLoading(false);
      onRenderComplete();
    }
  }, [language, code, onRenderComplete]);

  useEffect(() => {
    highlightCode();
  }, [highlightCode]);

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#24292e",
          padding: "10px",
          borderRadius: "1.5em",
        }}
      >
        Loading code...
      </div>
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        transition: "none",
        padding: 20,
        backgroundColor: "#24292e",
        overflowX: "auto",
        borderRadius: ".37em",
        fontSize: ".75rem",
      }}
    />
  );
};

export default React.memo(CodeBlock);
