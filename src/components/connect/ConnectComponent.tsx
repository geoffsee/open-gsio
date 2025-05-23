import React from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  HStack,
  Input,
  Link,
  List,
  ListItem,
} from "@chakra-ui/react";
import { MarkdownEditor } from "./MarkdownEditor";
import { Fragment, useState } from "react";

function ConnectComponent() {
  const [formData, setFormData] = useState({
    markdown: "",
    email: "",
    firstname: "",
    lastname: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isError, setIsError] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSubmitted(false);
    setValidationError("");
  };

  const handleSubmitButton = async () => {
    setValidationError("");

    if (!formData.email || !formData.firstname || !formData.markdown) {
      setValidationError("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setIsError(false);
        setFormData({
          markdown: "",
          email: "",
          firstname: "",
          lastname: "",
        });
      } else {
        setIsError(true);
      }
    } catch (error) {
      setIsError(true);
    }
  };

  return (
    <Fragment>
      <List color="text.primary" mb={4}>
        <ListItem>
          Email:{" "}
          <Link href="mailto:geoff@seemueller.io" color="teal.500">
            geoff@seemueller.io
          </Link>
        </ListItem>
      </List>
      <Box w="100%">
        <HStack spacing={4} mb={4}>
          <Input
            placeholder="First name *"
            value={formData.firstname}
            onChange={(e) => handleChange("firstname")(e.target.value)}
            color="text.primary"
            borderColor="text.primary"
          />
          <Input
            placeholder="Last name *"
            value={formData.lastname}
            onChange={(e) => handleChange("lastname")(e.target.value)}
            color="text.primary"
            borderColor="text.primary"
            // bg="text.primary"
          />
        </HStack>
        <Input
          placeholder="Email *"
          value={formData.email}
          onChange={(e) => handleChange("email")(e.target.value)}
          mb={4}
          borderColor="text.primary"
          color="text.primary"
        />
        <MarkdownEditor
          onChange={handleChange("markdown")}
          markdown={formData.markdown}
          placeholder="Your Message..."
        />
      </Box>
      <Button
        variant="outline"
        // colorScheme="blackAlpha"
        onClick={handleSubmitButton}
        alignSelf="flex-end"
        size="md"
        mt={4}
        mb={4}
        float="right"
        _hover={{
          bg: "",
          transform: "scale(1.05)",
        }}
        _active={{
          bg: "gray.800",
          transform: "scale(1)",
        }}
      >
        SEND
      </Button>
      <Box mt={12}>
        {isSubmitted && (
          <Alert
            status="success"
            borderRadius="md"
            color="text.primary"
            bg="green.500"
          >
            <AlertIcon />
            Message sent successfully!
          </Alert>
        )}

        {isError && (
          <Alert
            status="error"
            borderRadius="md"
            color="text.primary"
            bg="red.500"
          >
            <AlertIcon />
            There was an error sending your message. Please try again.
          </Alert>
        )}
        {validationError && (
          <Alert
            status="warning"
            borderRadius="md"
            color="background.primary"
            bg="yellow.500"
          >
            <AlertIcon />
            {validationError}
          </Alert>
        )}
      </Box>
    </Fragment>
  );
}

export default ConnectComponent;
