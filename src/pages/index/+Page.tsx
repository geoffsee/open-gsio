import React, { useEffect } from "react";
import { Stack } from "@chakra-ui/react";
import Chat from "../../components/chat/Chat";
import clientChatStore from "../../stores/ClientChatStore";
import { getModelFamily } from "../../components/chat/SupportedModels";

// renders for path: "/"
export default function IndexPage() {
  useEffect(() => {
    try {
      let model = localStorage.getItem("recentModel");

      if (getModelFamily(model as string)) {
        clientChatStore.setModel(model as string);
      }
    } catch (_) {
      console.log("using default model");
    }
  }, []);

  return (
    <Stack direction="column" height="100%" width="100%" spacing={0}>
      <Chat height="100%" width="100%" />
    </Stack>
  );
}
