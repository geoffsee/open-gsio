import React, { useCallback, useMemo } from "react";
import { Box, Flex, useMediaQuery } from "@chakra-ui/react";
import { resumeData } from "../../static-data/resume_data";
import SectionContent from "./SectionContent";
import SectionButton from "./SectionButton";

const sections = ["professionalSummary", "skills", "experience", "education"];

export default function ResumeComponent() {
  const [activeSection, setActiveSection] = React.useState(
    "professionalSummary",
  );
  const [isMobile] = useMediaQuery("(max-width: 1243px)");

  const handleSectionClick = useCallback((section) => {
    setActiveSection(section);
  }, []);

  const capitalizeFirstLetter = useCallback((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }, []);

  const sectionButtons = useMemo(
    () =>
      sections.map((section) => (
        <SectionButton
          key={section}
          onClick={() => handleSectionClick(section)}
          activeSection={activeSection}
          section={section}
          mobile={isMobile}
          callbackfn={capitalizeFirstLetter}
        />
      )),
    [activeSection, isMobile, handleSectionClick, capitalizeFirstLetter],
  );

  return (
    <Box p={"unset"}>
      <Flex
        direction={isMobile ? "column" : "row"}
        mb={8}
        wrap="nowrap"
        gap={isMobile ? 2 : 4}
        minWidth="0"
      >
        {sectionButtons}
      </Flex>
      <Box
        bg="background.secondary"
        color="text.primary"
        borderRadius="md"
        boxShadow="md"
        borderWidth={1}
        borderColor="brand.300"
        minHeight="300px"
      >
        <SectionContent activeSection={activeSection} resumeData={resumeData} />
      </Box>
    </Box>
  );
}
