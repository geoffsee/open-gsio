import React from "react";
import { IconButton } from "@chakra-ui/react";
import { Globe2Icon } from "lucide-react";
import clientChatStore from "../../stores/ClientChatStore";
import { observer } from "mobx-react-lite";

export const EnableSearchButton: React.FC<{ disabled: boolean }> = observer(
  ({ disabled }) => {
    const onClick = () => {
      if (clientChatStore.tools.includes("web-search")) {
        clientChatStore.setTools([]);
      } else {
        clientChatStore.setTools(["web-search"]);
      }
    };

    const isActive = clientChatStore.tools.includes("web-search");

    return (
      <IconButton
        aria-label={isActive ? "Disable Search" : "Enable Search"}
        title={isActive ? "Disable Search" : "Enable Search"}
        bg="transparent"
        color="text.tertiary"
        icon={<Globe2Icon size={"1.3337rem"} />}
        onClick={onClick}
        isActive={isActive}
        _active={{
          bg: "transparent",
          svg: {
            stroke: "brand.100",
            transition: "stroke 0.3s ease-in-out",
          },
        }}
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
  },
);
