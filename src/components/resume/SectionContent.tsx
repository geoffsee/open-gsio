import React from "react";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";

const fontSize = "md";

const ProfessionalSummary = ({ professionalSummary }) => (
  <Box>
    <Grid
      templateColumns="1fr"
      gap={4}
      maxW={["100%", "100%", "100%"]}
      mx="auto"
      className="about-container"
    >
      <GridItem
        colSpan={1}
        maxW={["100%", "100%", "container.md"]}
        justifySelf="center"
        minH={"100%"}
      >
        <Grid templateColumns="1fr" gap={4} overflowY={"auto"}>
          <GridItem>
            <Text fontSize="md">{professionalSummary}</Text>
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  </Box>
);

const Skills = ({ skills }) => (
  <VStack align={"baseline"} spacing={6} mb={4}>
    <UnorderedList spacing={2} mb={0}>
      <Box>
        {skills?.map((skill, index) => (
          <ListItem p={1} key={index}>
            {skill}
          </ListItem>
        ))}
      </Box>
    </UnorderedList>
  </VStack>
);

const Experience = ({ experience }) => (
  <VStack align="start" spacing={6} mb={4}>
    {experience?.map((job, index) => (
      <Box key={index} width="100%">
        <Heading as="h3" size="md" mb={2}>
          {job.title}
        </Heading>
        <Text fontWeight="bold">{job.company}</Text>
        <Text color="gray.500" mb={2}>
          {job.timeline}
        </Text>
        <Text>{job.description}</Text>
      </Box>
    ))}
  </VStack>
);

const Education = ({ education }) => (
  <UnorderedList spacing={2} mb={4}>
    {education?.map((edu, index) => <ListItem key={index}>{edu}</ListItem>)}
  </UnorderedList>
);

const SectionContent = ({ activeSection, resumeData }) => {
  const components = {
    professionalSummary: ProfessionalSummary,
    skills: Skills,
    experience: Experience,
    education: Education,
  };

  const ActiveComponent = components[activeSection];

  return (
    <Box p={4} minHeight="300px" width="100%">
      {ActiveComponent ? (
        <ActiveComponent {...resumeData} />
      ) : (
        <Text>Select a section to view details.</Text>
      )}
    </Box>
  );
};

export default SectionContent;
