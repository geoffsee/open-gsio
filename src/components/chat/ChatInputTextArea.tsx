import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Alert,
  AlertIcon,
  Box,
  chakra,
  HStack,
  InputGroup,
} from "@chakra-ui/react";
import fileUploadStore from "../../stores/FileUploadStore";
import { UploadedItem } from "./Attachments";
import AutoResize from "react-textarea-autosize";

const AutoResizeTextArea = chakra(AutoResize);

interface InputTextAreaProps {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

const InputTextArea: React.FC<InputTextAreaProps> = observer(
  ({ inputRef, value, onChange, onKeyDown, isLoading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAttachmentClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        fileUploadStore.uploadFile(file, "/api/documents");
      }
    };

    const handleRemoveUploadedItem = (url: string) => {
      fileUploadStore.removeUploadedFile(url);
    };

    const [heightConstraint, setHeightConstraint] = useState<
      number | undefined
    >(10);

    useEffect(() => {
      if (value.length > 10) {
        setHeightConstraint();
      }
    }, [value]);

    return (
      <Box
        position="relative"
        width="100%"
        height={heightConstraint}
        display="flex"
        flexDirection="column"
      >
        {/* Attachments Section */}
        {fileUploadStore.uploadResults.length > 0 && (
          <HStack
            spacing={2}
            mb={2}
            overflowX="auto"
            css={{ "&::-webkit-scrollbar": { display: "none" } }}
            // Ensure attachments wrap if needed
            flexWrap="wrap"
          >
            {fileUploadStore.uploadResults.map((result) => (
              <UploadedItem
                key={result.url}
                url={result.url}
                name={result.name}
                onRemove={() => handleRemoveUploadedItem(result.url)}
              />
            ))}
          </HStack>
        )}

        {/* Input Area */}
        <InputGroup position="relative">
          <AutoResizeTextArea
            fontFamily="Arial, sans-serif"
            ref={inputRef}
            value={value}
            height={heightConstraint}
            autoFocus
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            p={2}
            pr="8px"
            pl="17px"
            bg="rgba(255, 255, 255, 0.15)"
            color="text.primary"
            borderRadius="20px" // Set a consistent border radius
            border="none"
            placeholder="Free my mind..."
            _placeholder={{ color: "gray.400" }}
            _focus={{
              outline: "none",
            }}
            disabled={isLoading}
            minRows={1}
            maxRows={12}
            style={{
              touchAction: "none",
              resize: "none",
              overflowY: "auto",
              width: "100%",
              transition: "height 0.2s ease-in-out",
            }}
          />
          {/*<InputRightElement*/}
          {/*    position="absolute"*/}
          {/*    right={0}*/}
          {/*    top={0}*/}
          {/*    bottom={0}*/}
          {/*    width="40px"*/}
          {/*    height="100%"*/}
          {/*    display="flex"*/}
          {/*    alignItems="center"*/}
          {/*    justifyContent="center"*/}
          {/*>*/}
          {/*<EnableSearchButton />*/}
          {/*</InputRightElement>*/}
        </InputGroup>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {fileUploadStore.uploadError && (
          <Alert status="error" mt={2}>
            <AlertIcon />
            {fileUploadStore.uploadError}
          </Alert>
        )}
      </Box>
    );
  },
);

export default InputTextArea;
