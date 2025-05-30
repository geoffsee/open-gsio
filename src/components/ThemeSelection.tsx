import { getColorThemes } from "../layout/theme/color-themes";
import { Center, IconButton, VStack } from "@chakra-ui/react";
import userOptionsStore from "../stores/UserOptionsStore";
import { Circle } from "lucide-react";
import { toolbarButtonZIndex } from "./toolbar/Toolbar";
import React from "react";
import { useIsMobile } from "./contexts/MobileContext";

export function ThemeSelectionOptions() {
  const children = [];

  const isMobile = useIsMobile();

  for (const theme of getColorThemes()) {
    children.push(
      <IconButton
        as="div"
        role="button"
        key={theme.name}
        onClick={() => userOptionsStore.selectTheme(theme.name)}
        size="xs"
        icon={
          <Circle
            size={!isMobile ? 16 : 20}
            stroke="transparent"
            style={{
              background: `conic-gradient(${theme.colors.background.primary.startsWith("#") ? theme.colors.background.primary : theme.colors.background.secondary} 0 50%, ${theme.colors.text.secondary} 50% 100%)`,
              borderRadius: "50%",
              boxShadow: "0 0 0.5px 0.25px #fff",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          />
        }
        bg="transparent"
        borderRadius="50%" // Ensures the button has a circular shape
        stroke="transparent"
        color="transparent"
        _hover={{
          svg: {
            transition: "stroke 0.3s ease-in-out", // Smooth transition effect
          },
        }}
        zIndex={toolbarButtonZIndex}
      />,
    );
  }

  return (
    <VStack align={!isMobile ? "end" : "start"} p={1.2}>
      <Center>{children}</Center>
    </VStack>
  );
}
