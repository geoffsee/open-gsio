import { applySnapshot, flow, Instance, types } from "mobx-state-tree";
import Message from "../models/Message";
import UserOptionsStore from "./UserOptionsStore";

const ClientChatStore = types
  .model("ClientChatStore", {
    messages: types.optional(types.array(Message), []),
    input: types.optional(types.string, ""),
    isLoading: types.optional(types.boolean, false),
    model: types.optional(types.string, "meta-llama/llama-4-scout-17b-16e-instruct"),
    imageModel: types.optional(types.string, "black-forest-labs/flux-1.1-pro"),
  })
  .actions((self) => ({
    cleanup() {
      if (self.eventSource) {
        self.eventSource.close();
        self.eventSource = null;
      }
    },
    sendMessage: flow(function* () {
      if (!self.input.trim() || self.isLoading) return;

      self.cleanup();

      yield self.setFollowModeEnabled(true);
      self.setIsLoading(true);

      const userMessage = Message.create({
        content: self.input,
        role: "user" as const,
      });
      self.addMessage(userMessage);
      self.setInput("");

      try {
        const payload = {
          messages: self.messages.slice(),
          model: self.model,
        };

        yield new Promise((resolve) => setTimeout(resolve, 500));
        self.addMessage(Message.create({ content: "", role: "assistant" }));

        const response = yield fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        if (response.status === 429) {
          self.updateLastMessage(
            `Too many requests in the given time. Please wait a few moments and try again.`,
          );
          self.cleanup();
          return;
        }
        if (response.status > 200) {
          self.updateLastMessage(`Error! Something went wrong, try again.`);
          self.cleanup();
          return;
        }

        const { streamUrl } = yield response.json();
        self.eventSource = new EventSource(streamUrl);

        self.eventSource.onmessage = async (event) => {
          try {
            const dataString = event.data;
            const parsedData = JSON.parse(dataString);

            if (parsedData.type === "error") {
              self.updateLastMessage(`${parsedData.error}`);
              self.cleanup();
              self.setIsLoading(false);
              return;
            }

            if (
              parsedData.type === "chat" &&
              parsedData.data.choices[0]?.finish_reason === "stop"
            ) {
              self.appendToLastMessage(
                parsedData.data.choices[0]?.delta?.content || "",
              );
              self.cleanup();
              self.setIsLoading(false);
              return;
            }

            if (parsedData.type === "chat") {
              self.appendToLastMessage(
                parsedData.data.choices[0]?.delta?.content || "",
              );
            }
          } catch (error) {
            console.error("Error processing stream:", error);
          }
        };

        self.eventSource.onerror = (e) => {
          self.cleanup();
        };
      } catch (error) {
        console.error("Error in sendMessage:", error);
        if (
          !self.messages.length ||
          self.messages[self.messages.length - 1].role !== "assistant"
        ) {
          self.addMessage({
            content: "Sorry, there was an error.",
            role: "assistant",
          });
        } else {
          self.updateLastMessage("Sorry, there was an error.");
        }
        self.cleanup();
        self.setIsLoading(false);
      } finally {
      }
    }),
    setFollowModeEnabled: flow(function* (isEnabled: boolean) {
      yield UserOptionsStore.setFollowModeEnabled(isEnabled);
    }),
    setInput(value: string) {
      self.input = value;
    },
    setModel(value: string) {
      self.model = value;
      try {
        localStorage.setItem("recentModel", value);
      } catch (error) {}
    },
    setImageModel(value: string) {
      self.imageModel = value;
    },
    addMessage(message: Instance<typeof Message>) {
      self.messages.push(message);
    },
    editMessage: flow(function* (index: number, content: string) {
      yield self.setFollowModeEnabled(true);
      if (index >= 0 && index < self.messages.length) {
        self.messages[index].setContent(content);

        self.messages.splice(index + 1);

        self.setIsLoading(true);

        yield new Promise((resolve) => setTimeout(resolve, 500));

        self.addMessage(Message.create({ content: "", role: "assistant" }));

        try {
          const payload = {
            messages: self.messages.slice(),
            model: self.model,
          };

          const response = yield fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          if (response.status === 429) {
            self.updateLastMessage(
              `Too many requests in the given time. Please wait a few moments and try again.`,
            );
            self.cleanup();
            return;
          }
          if (response.status > 200) {
            self.updateLastMessage(`Error! Something went wrong, try again.`);
            self.cleanup();
            return;
          }

          const { streamUrl } = yield response.json();
          self.eventSource = new EventSource(streamUrl);

          self.eventSource.onmessage = (event) => {
            try {
              const dataString = event.data;
              const parsedData = JSON.parse(dataString);

              if (parsedData.type === "error") {
                self.updateLastMessage(`${parsedData.error}`);
                self.cleanup();
                self.setIsLoading(false);
                return;
              }

              if (
                parsedData.type === "chat" &&
                parsedData.data.choices[0]?.finish_reason === "stop"
              ) {
                self.cleanup();
                self.setIsLoading(false);
                return;
              }

              if (parsedData.type === "chat") {
                self.appendToLastMessage(
                  parsedData.data.choices[0]?.delta?.content || "",
                );
              }
            } catch (error) {
              console.error("Error processing stream:", error);
            } finally {
            }
          };

          self.eventSource.onerror = (e) => {
            console.log("EventSource encountered an error", JSON.stringify(e));
          };
        } catch (error) {
          console.error("Error in editMessage:", error);
          self.addMessage({
            content: "Sorry, there was an error.",
            role: "assistant",
          });
          self.cleanup();
        } finally {
        }
      }
    }),
    getIsLoading() {
      return self.isLoading;
    },
    reset() {
      applySnapshot(self, {});
    },
    removeMessagesAfter(index: number) {
      if (index >= 0 && index < self.messages.length) {
        self.messages.splice(index + 1);
      }
    },
    updateLastMessage(content: string) {
      if (self.messages.length > 0) {
        self.messages[self.messages.length - 1].content = content;
      }
    },
    appendToLastMessage(content: string) {
      if (self.messages.length > 0) {
        self.messages[self.messages.length - 1].content += content;
      }
    },
    setIsLoading(value: boolean) {
      self.isLoading = value;
    },
    stopIncomingMessage() {
      if (self.eventSource) {
        self.eventSource.close();
        self.eventSource = null;
      }
      self.setIsLoading(false);
    },
  }));

export type IMessage = Instance<typeof Message>;

export type IClientChatStore = Instance<typeof this>;

export default ClientChatStore.create();
