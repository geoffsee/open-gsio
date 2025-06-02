import React from "react";
import { Button } from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";

function SectionButton(props: {
  onClick: () => void;
  activeSection: string;
  section: string;
  mobile: boolean;
  callbackfn: (word) => string;
}) {
  return (
    <Button
      mt={1}
      onClick={props.onClick}
      variant={props.activeSection === props.section ? "solid" : "outline"}
      colorScheme="brand"
      rightIcon={<ChevronRight size={16} />}
      size="md"
      width={props.mobile ? "100%" : "auto"}
    >
      {props.section
        .replace(/([A-Z])/g, " $1")
        .trim()
        .split(" ")
        .map(props.callbackfn)
        .join(" ")}
    </Button>
  );
}

export default SectionButton;
