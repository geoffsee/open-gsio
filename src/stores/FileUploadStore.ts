import { types, flow } from "mobx-state-tree";
import clientChatStore from "./ClientChatStore";
import Attachment from "../models/Attachment";

const FileUploadStore = types
  .model("FileUploadStore", {
    isUploading: types.optional(types.boolean, false),
    uploadError: types.maybeNull(types.string),
    uploadedFiles: types.array(types.string),
    uploadResults: types.array(types.frozen()),
  })
  .actions((self) => ({
    uploadFile: flow(function* (file: File, endpoint: string) {
      if (!endpoint) {
        self.uploadError = "Endpoint URL is required.";
        return;
      }

      self.isUploading = true;
      self.uploadError = null;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = yield fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        const result = yield response.json();
        self.uploadResults.push(result);

        if (result.url) {
          self.uploadedFiles.push(result.url);
          clientChatStore.addAttachment(
            Attachment.create({
              content: `${file.name}\n~~~${result?.extractedText}\n`,
              url: result.url,
            }),
          );
        } else {
          throw new Error("No URL returned from the server.");
        }
      } catch (error: any) {
        self.uploadError = error.message;
      } finally {
        self.isUploading = false;
      }
    }),
    removeUploadedFile(url: string) {
      clientChatStore.removeAttachment(url);
      const index = self.uploadedFiles.findIndex(
        (uploadedUrl) => uploadedUrl === url,
      );
      if (index !== -1) {
        self.uploadedFiles.splice(index, 1);
        self.uploadResults.splice(index, 1);
      }
    },
  }));

export default FileUploadStore.create();
