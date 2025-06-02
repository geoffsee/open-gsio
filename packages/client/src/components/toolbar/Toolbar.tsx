import React from "react";
import { Flex } from "@chakra-ui/react";
import SupportThisSiteButton from "./SupportThisSiteButton";
import GithubButton from "./GithubButton";
import BuiltWithButton from "../BuiltWithButton";

const toolbarButtonZIndex = 901;

export { toolbarButtonZIndex };

function ToolBar({ isMobile }) {
  return (
    <Flex
      direction={isMobile ? "row" : "column"}
      alignItems={isMobile ? "flex-start" : "flex-end"}
      pb={4}
    >
      <SupportThisSiteButton />
      <GithubButton />
      <BuiltWithButton />
    </Flex>
  );
}

export default ToolBar;
