export class StreamProcessorSdk {
  static preprocessContent(buffer: string): string {
    return buffer
      .replace(/(\n\- .*\n)+/g, "$&\n")
      .replace(/(\n\d+\. .*\n)+/g, "$&\n")
      .replace(/\n{3,}/g, "\n\n");
  }

  static async handleStreamProcessing(
    stream: any,
    controller: ReadableStreamDefaultController,
  ) {
    const encoder = new TextEncoder();
    let buffer = "";

    try {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        buffer += content;

        let processedContent = StreamProcessorSdk.preprocessContent(buffer);
        controller.enqueue(encoder.encode(processedContent));

        buffer = "";
      }

      if (buffer) {
        let processedContent = StreamProcessorSdk.preprocessContent(buffer);
        controller.enqueue(encoder.encode(processedContent));
      }
    } catch (error) {
      controller.error(error);
      throw new Error("Stream processing error");
    } finally {
      controller.close();
    }
  }
}
