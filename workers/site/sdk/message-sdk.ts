interface BaseMessage {
  role: "user" | "assistant" | "system";
}

interface TextMessage extends BaseMessage {
  content: string;
}

interface O1Message extends BaseMessage {
  content: Array<{
    type: string;
    text: string;
  }>;
}

interface LlamaMessage extends BaseMessage {
  content: Array<{
    type: "text" | "image";
    data: string;
  }>;
}

interface MessageConverter<T extends BaseMessage, U extends BaseMessage> {
  convert(message: T): U;
  convertBatch(messages: T[]): U[];
}

class TextToO1Converter implements MessageConverter<TextMessage, O1Message> {
  convert(message: TextMessage): O1Message {
    return {
      role: message.role,
      content: [
        {
          type: "text",
          text: message.content,
        },
      ],
    };
  }

  convertBatch(messages: TextMessage[]): O1Message[] {
    return messages.map((msg) => this.convert(msg));
  }
}

class O1ToTextConverter implements MessageConverter<O1Message, TextMessage> {
  convert(message: O1Message): TextMessage {
    return {
      role: message.role,
      content: message.content.map((item) => item.text).join("\n"),
    };
  }

  convertBatch(messages: O1Message[]): TextMessage[] {
    return messages.map((msg) => this.convert(msg));
  }
}

class TextToLlamaConverter
  implements MessageConverter<TextMessage, LlamaMessage>
{
  convert(message: TextMessage): LlamaMessage {
    return {
      role: message.role,
      content: [
        {
          type: "text",
          data: message.content,
        },
      ],
    };
  }

  convertBatch(messages: TextMessage[]): LlamaMessage[] {
    return messages.map((msg) => this.convert(msg));
  }
}

class LlamaToTextConverter
  implements MessageConverter<LlamaMessage, TextMessage>
{
  convert(message: LlamaMessage): TextMessage {
    return {
      role: message.role,
      content: message.content
        .filter((item) => item.type === "text")
        .map((item) => item.data)
        .join("\n"),
    };
  }

  convertBatch(messages: LlamaMessage[]): TextMessage[] {
    return messages.map((msg) => this.convert(msg));
  }
}

class MessageConverterFactory {
  static createConverter(
    fromFormat: string,
    toFormat: string,
  ): MessageConverter<any, any> {
    const key = `${fromFormat}->${toFormat}`;
    const converters = {
      "text->o1": new TextToO1Converter(),
      "o1->text": new O1ToTextConverter(),
      "text->llama": new TextToLlamaConverter(),
      "llama->text": new LlamaToTextConverter(),
    };

    const converter = converters[key];
    if (!converter) {
      throw new Error(`Unsupported conversion: ${key}`);
    }

    return converter;
  }
}

function detectMessageFormat(message: any): string {
  if (typeof message.content === "string") {
    return "text";
  }
  if (Array.isArray(message.content)) {
    if (message.content[0]?.type === "text" && "text" in message.content[0]) {
      return "o1";
    }
    if (message.content[0]?.type && "data" in message.content[0]) {
      return "llama";
    }
  }
  throw new Error("Unknown message format");
}

function convertMessage(message: any, targetFormat: string): any {
  const sourceFormat = detectMessageFormat(message);
  if (sourceFormat === targetFormat) {
    return message;
  }

  const converter = MessageConverterFactory.createConverter(
    sourceFormat,
    targetFormat,
  );
  return converter.convert(message);
}

export {
  MessageConverterFactory,
  convertMessage,
  detectMessageFormat,
  type BaseMessage,
  type TextMessage,
  type O1Message,
  type LlamaMessage,
  type MessageConverter,
};
