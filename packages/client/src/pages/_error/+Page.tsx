// client error catcher
import { Center, Text } from '@chakra-ui/react';

import { usePageContext } from '../../renderer/usePageContext';

export { Page };

function Page() {
  const pageContext = usePageContext();

  let msg: string;
  const { abortReason, abortStatusCode } = pageContext;
  if (abortReason?.notAdmin) {
    msg = "You cannot access this page because you aren't an administrator.";
  } else if (typeof abortReason === 'string') {
    msg = abortReason;
  } else if (abortStatusCode === 403) {
    msg = "You cannot access this page because you don't have enough privileges.";
  } else if (abortStatusCode === 401) {
    msg = "You cannot access this page because you aren't logged in. Please log in.";
  } else {
    msg = pageContext.is404
      ? "This page doesn't exist."
      : 'Something went wrong. Try again (later).';
  }

  return (
    <Center height="100vh">
      <Text>{msg}</Text>
    </Center>
  );
}

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Vike {
    interface PageContext {
      abortReason?: string | { notAdmin: true };
    }
  }
}
