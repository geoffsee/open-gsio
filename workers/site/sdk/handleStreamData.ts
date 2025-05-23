interface StreamChoice {
  index?: number;
  delta: {
    content: string;
  };
  logprobs: null;
  finish_reason: string | null;
}

interface StreamResponse {
  type: string;
  data: {
    choices?: StreamChoice[];
    delta?: {
      text?: string;
    };
    type?: string;
    content_block?: {
      type: string;
      text: string;
    };
  };
}

const handleStreamData = (
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
) => {
  return (
    data: StreamResponse,
    transformFn?: (data: StreamResponse) => StreamResponse,
  ) => {
    if (!data?.type || data.type !== "chat") {
      return;
    }

    let transformedData: StreamResponse;

    if (transformFn) {
      transformedData = transformFn(data);
    } else {
      if (
        data.data.type === "content_block_start" &&
        data.data.content_block?.type === "text"
      ) {
        transformedData = {
          type: "chat",
          data: {
            choices: [
              {
                delta: {
                  content: data.data.content_block.text || "",
                },
                logprobs: null,
                finish_reason: null,
              },
            ],
          },
        };
      } else if (data.data.delta?.text) {
        transformedData = {
          type: "chat",
          data: {
            choices: [
              {
                delta: {
                  content: data.data.delta.text,
                },
                logprobs: null,
                finish_reason: null,
              },
            ],
          },
        };
      } else if (data.data.choices?.[0]?.delta?.content) {
        transformedData = {
          type: "chat",
          data: {
            choices: [
              {
                index: data.data.choices[0].index,
                delta: {
                  content: data.data.choices[0].delta.content,
                },
                logprobs: null,
                finish_reason: data.data.choices[0].finish_reason,
              },
            ],
          },
        };
      } else if (data.data.choices) {
        transformedData = data;
      } else {
        return;
      }
    }

    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify(transformedData)}\n\n`),
    );
  };
};

export default handleStreamData;
