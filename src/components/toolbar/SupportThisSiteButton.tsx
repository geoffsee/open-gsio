import React from "react";
import { IconButton, useDisclosure } from "@chakra-ui/react";
import { LucideHeart } from "lucide-react";
import { toolbarButtonZIndex } from "./Toolbar";
import SupportThisSiteModal from "./SupportThisSiteModal";

export default function SupportThisSiteButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <IconButton
        as="a"
        aria-label="Support"
        icon={<LucideHeart />}
        cursor="pointer"
        onClick={onOpen}
        size="md"
        stroke="text.accent"
        bg="transparent"
        _hover={{
          bg: "transparent",
          svg: {
            stroke: "accent.danger",
            transition: "stroke 0.3s ease-in-out",
          },
        }}
        title="Support"
        variant="ghost"
        zIndex={toolbarButtonZIndex}
        sx={{
          svg: {
            stroke: "text.accent",
            strokeWidth: "2px",
            transition: "stroke 0.2s ease-in-out",
          },
        }}
      />
      <SupportThisSiteModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
