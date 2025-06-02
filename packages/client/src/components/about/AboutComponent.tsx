import React from "react";
import { Grid, GridItem, Image, Text } from "@chakra-ui/react";

const fontSize = "md";

function AboutComponent() {
  return (
    <Grid
      templateColumns="1fr"
      gap={4}
      maxW={["100%", "100%", "100%"]}
      mx="auto"
      className="about-container"
    >
      <GridItem colSpan={1} justifySelf="center" mb={[6, 6, 8]}>
        <Image
          src="/me.png"
          alt="Geoff Seemueller"
          borderRadius="full"
          boxSize={["120px", "150px"]}
          objectFit="cover"
        />
      </GridItem>
      <GridItem
        colSpan={1}
        maxW={["100%", "100%", "container.md"]}
        justifySelf="center"
        minH={"100%"}
      >
        <Grid templateColumns="1fr" gap={4} overflowY={"auto"}>
          <GridItem>
            <Text fontSize={fontSize}>
              If you're interested in collaborating on innovative projects that
              push technological boundaries and create real value, I'd be keen
              to connect and explore potential opportunities.
            </Text>
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  );
}

export default AboutComponent;
