import { Box, chakra, InputGroup, useBreakpointValue } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import AutoResize from 'react-textarea-autosize';

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
    const [heightConstraint, setHeightConstraint] = useState<number | undefined>(10);

    useEffect(() => {
      if (value.length > 10) {
        setHeightConstraint(parseInt(value));
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
        {/* Input Area */}
        <InputGroup position="relative">
          <AutoResizeTextArea
            fontFamily="Arial, sans-serif"
            ref={inputRef}
            value={value}
            height={heightConstraint}
            maxH={heightConstraint}
            autoFocus
            onChange={e => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            p={2}
            pr="8px"
            pl="17px"
            bg="rgba(255, 255, 255, 0.15)"
            color="text.primary"
            borderRadius="20px"
            border="none"
            placeholder="Free my mind..."
            _placeholder={{
              color: 'gray.400',
              textWrap: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              width: '90%',
            }}
            _focus={{
              outline: 'none',
            }}
            disabled={isLoading}
            minRows={1}
            maxRows={12}
            style={{
              touchAction: 'none',
              resize: 'none',
              overflowY: 'auto',
              width: '100%',
              transition: 'height 0.2s ease-in-out',
            }}
          />
        </InputGroup>
      </Box>
    );
  },
);

export default InputTextArea;
