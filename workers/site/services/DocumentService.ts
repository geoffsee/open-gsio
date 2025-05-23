import { flow, types } from "mobx-state-tree";

async function getExtractedText(file: any) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("https://any2text.seemueller.io/extract", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to extract text: ${response.statusText}`);
  }

  const { text: extractedText } = await response.json<{ text: string }>();
  return extractedText;
}

export default types
  .model("DocumentService", {})
  .volatile(() => ({
    env: {} as Env,
    ctx: {} as ExecutionContext,
  }))
  .actions((self) => ({
    setEnv(env: Env) {
      self.env = env;
    },
    setCtx(ctx: ExecutionContext) {
      self.ctx = ctx;
    },
    handlePutDocument: flow(function* (request: Request) {
      try {
        if (!request.body) {
          return new Response("No content in the request", { status: 400 });
        }

        const formData = yield request.formData();
        const file = formData.get("file");
        const name = file instanceof File ? file.name : "unnamed";

        if (!(file instanceof File)) {
          return new Response("No valid file found in form data", {
            status: 400,
          });
        }

        const key = `document_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const content = yield file.arrayBuffer();

        const contentType = file.type || "application/octet-stream";
        const contentLength = content.byteLength;

        const metadata = {
          name,
          contentType,
          contentLength,
          uploadedAt: new Date().toISOString(),
        };

        yield self.env.KV_STORAGE.put(key, content, {
          expirationTtl: 60 * 60 * 24 * 7,
        });

        yield self.env.KV_STORAGE.put(`${key}_meta`, JSON.stringify(metadata), {
          expirationTtl: 60 * 60 * 24 * 7,
        });

        const url = new URL(request.url);
        url.pathname = `/api/documents/${key}`;

        console.log(content.length);
        const extracted = yield getExtractedText(file);

        console.log({ extracted });

        return new Response(
          JSON.stringify({
            url: url.toString(),
            name,
            extractedText: extracted,
          }),
          { status: 200 },
        );
      } catch (error) {
        console.error("Error uploading document:", error);
        return new Response("Failed to upload document", { status: 500 });
      }
    }),
    handleGetDocument: flow(function* (request: Request) {
      try {
        const url = new URL(request.url);
        const key = url.pathname.split("/").pop();

        if (!key) {
          return new Response("Document key is missing", { status: 400 });
        }

        const content = yield self.env.KV_STORAGE.get(key, "arrayBuffer");

        if (!content) {
          return new Response("Document not found", { status: 404 });
        }

        return new Response(content, {
          status: 200,
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${key}"`,
          },
        });
      } catch (error) {
        console.error("Error retrieving document:", error);
        return new Response("Failed to retrieve document", { status: 500 });
      }
    }),
    handleGetDocumentMeta: flow(function* (request: Request) {
      try {
        const url = new URL(request.url);
        const key = url.pathname.split("/").pop();

        if (!key) {
          return new Response("Document key is missing", { status: 400 });
        }

        const content = yield self.env.KV_STORAGE.get(`${key}_meta`);

        if (!content) {
          return new Response("Document meta not found", { status: 404 });
        }

        return new Response(JSON.stringify({ metadata: content }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Error retrieving document:", error);
        return new Response("Failed to retrieve document", { status: 500 });
      }
    }),
  }));
