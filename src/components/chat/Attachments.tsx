import React from "react";
import { IconButton, Tag, TagCloseButton, TagLabel } from "@chakra-ui/react";
import { PaperclipIcon } from "lucide-react";

// Add a new component for UploadedItem
export const UploadedItem: React.FC<{
  url: string;
  onRemove: () => void;
  name: string;
}> = ({ url, onRemove, name }) => (
  <Tag size="md" borderRadius="full" variant="solid" colorScheme="teal">
    <TagLabel>{name || url.split("/").pop()}</TagLabel>
    <TagCloseButton onClick={onRemove} />
  </Tag>
);

export const AttachmentButton: React.FC<{
  onClick: () => void;
  disabled: boolean;
}> = ({ onClick, disabled }) => (
  <IconButton
    aria-label="Attach"
    title="Attach"
    bg="transparent"
    color="text.tertiary"
    icon={<PaperclipIcon size={"1.3337rem"} />}
    onClick={onClick}
    _hover={{
      bg: "transparent",
      svg: {
        stroke: "accent.secondary",
        transition: "stroke 0.3s ease-in-out",
      },
    }}
    variant="ghost"
    size="sm"
    isDisabled={disabled}
    _focus={{ boxShadow: "none" }}
  />
);
