import React from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

const ServicesOverview = ({ servicesOverview }) => (
  <Text fontSize="md">{servicesOverview}</Text>
);

const Offerings = ({ offerings }) => (
  <VStack align="start" spacing={6} mb={4}>
    {offerings.map((service, index) => (
      <Box key={index}>
        <Heading as="h3" size="md" mb={2}>
          {service.title}
        </Heading>
        <Text mb={4}>{service.description}</Text>
      </Box>
    ))}
  </VStack>
);

const ServicesSectionContent = ({ activeSection, data }) => {
  const components = {
    servicesOverview: ServicesOverview,
    offerings: Offerings,
  };

  const ActiveComponent = components[activeSection];

  return (
    <Box p={4} minHeight="300px" width="100%">
      {ActiveComponent ? (
        <ActiveComponent {...data} />
      ) : (
        <Text>Select a section to view details.</Text>
      )}
    </Box>
  );
};

export default ServicesSectionContent;
