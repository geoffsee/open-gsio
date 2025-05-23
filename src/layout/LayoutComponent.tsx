import React from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import Navigation from "./Navigation";
import Routes from "../renderer/routes";
import Hero from "./Hero";
import Content from "./Content";
import { useIsMobile } from "../components/contexts/MobileContext";

export default function LayoutComponent({ children }) {
  const isMobile = useIsMobile();

  return (
    <Grid
      templateAreas={
        isMobile
          ? `"nav"
                               "main"`
          : `"nav main"`
      }
      gridTemplateRows={isMobile ? "auto 1fr" : "1fr"}
      gridTemplateColumns={isMobile ? "1fr" : "auto 1fr"}
      minHeight="100vh"
      gap="1"
    >
      <GridItem area={"nav"} hidden={false}>
        <Navigation routeRegistry={Routes}>
          <Hero />
        </Navigation>
      </GridItem>
      <GridItem area={"main"}>
        <Content>{children}</Content>
      </GridItem>
    </Grid>
  );
}
