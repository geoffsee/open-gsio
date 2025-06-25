import { IconButton } from '@chakra-ui/react';
import { Edit2Icon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

const UserMessageTools = observer(({ disabled = false, message, onEdit }) => (
  <IconButton
    bg="transparent"
    color="text.primary"
    aria-label="Edit message"
    title="Edit message"
    icon={<Edit2Icon size={'1em'} />}
    onClick={() => onEdit(message)}
    _active={{
      bg: 'transparent',
      svg: {
        stroke: 'brand.100',
        transition: 'stroke 0.3s ease-in-out',
      },
    }}
    _hover={{
      bg: 'transparent',
      svg: {
        stroke: 'accent.secondary',
        transition: 'stroke 0.3s ease-in-out',
      },
    }}
    variant="ghost"
    size="sm"
    isDisabled={disabled}
    _focus={{ boxShadow: 'none' }}
  />
));

export default UserMessageTools;
