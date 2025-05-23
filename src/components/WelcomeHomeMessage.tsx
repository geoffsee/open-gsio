import { motion } from "framer-motion";
import { Box, Center, VStack } from "@chakra-ui/react";
import {
  welcome_home_text,
  welcome_home_tip,
} from "../static-data/welcome_home_text";
import CustomMarkdownRenderer, {
  WelcomeHomeMarkdownRenderer,
} from "./chat/CustomMarkdownRenderer";

function WelcomeHomeMessage({ visible }) {
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
    hidden: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const textVariants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.165, 0.84, 0.44, 1],
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.3,
        ease: [0.165, 0.84, 0.44, 1],
      },
    },
  };

  return (
    <Center>
      <VStack spacing={8} align="center" maxW="400px">
        {/* Welcome Message */}
        <Box
          fontSize="sm"
          fontStyle="italic"
          textAlign="center"
          color="text.secondary"
          mt={4}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={visible ? "visible" : "hidden"}
          >
            <Box userSelect={"none"}>
              <motion.div variants={textVariants}>
                <WelcomeHomeMarkdownRenderer markdown={welcome_home_text} />
              </motion.div>
            </Box>
          </motion.div>
        </Box>
        <motion.div variants={textVariants}>
          <Box
            fontSize="sm"
            fontStyle="italic"
            textAlign="center"
            color="text.secondary"
            mt={1}
          >
            <CustomMarkdownRenderer markdown={welcome_home_tip} />
          </Box>
        </motion.div>
      </VStack>
    </Center>
  );
}

export default WelcomeHomeMessage;
