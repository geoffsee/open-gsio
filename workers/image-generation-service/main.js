import { OpenAI } from "openai";
import { WorkerEntrypoint } from "cloudflare:workers";
import Replicate from "replicate";

export default class extends WorkerEntrypoint {
  strategy;

  constructor(ctx, env) {
    super(ctx, env);
    switch (env.TEXT2IMAGE_PROVIDER) {
      case "replicate":
        this.strategy = new ReplicateStrategy(env);
        break;
      case "openai":
        this.strategy = new OpenAiStrategy(env);
        break;
      default:
        throw "Invalid or missing image provider";
    }
  }

  async fetch(request) {
    const { pathname, searchParams } = new URL(request.url);

    if (pathname === "/generate") {
      const prompt =
        searchParams.get("prompt") || "A futuristic city with flying cars";
      const size = searchParams.get("size") || "1024x1024";

      try {
        const imageData = await this.strategy.generateImage(prompt, size);
        if (isURL(imageData)) {
          return handleUrlResponse(imageData);
        } else {
          // Directly return image data as in ReplicateStrategy
          return handleImageDataResponse(imageData);
        }
      } catch (error) {
        console.error(error);
        return new Response("Image generation failed.", { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
}

class OpenAiStrategy {
  constructor(env) {
    this.env = env;
  }

  async generateImage(prompt, size) {
    this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const response = await this.openai.images.generate({
      model: this.env.IMAGE_MODEL,
      prompt,
      n: 1,
      response_format: "url",
    });
    return response.data[0].url;
  }
}

class ReplicateStrategy {
  constructor(env) {
    this.env = env;
  }

  async generateImage(prompt, size) {
    const replicate = new Replicate({ auth: this.env.REPLICATE_TOKEN });
    const output = await replicate.run(this.env.IMAGE_MODEL, {
      input: {
        prompt,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 100,
        safety_tolerance: 2,
        height: parseInt(size.split("x").at(0).replace("x", "")),
        width: parseInt(size.split("x").at(1).replace("x", "")),
        prompt_upsampling: true,
      },
    });
    return output;
  }
}

function isURL(imageUrl) {
  const urlPattern =
    /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/;
  return urlPattern.test(imageUrl);
}

async function handleUrlResponse(iUrl) {
  const imageResponse = await fetch(iUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
  }
  const headers = new Headers(imageResponse.headers);
  headers.set("Content-Disposition", `inline; filename="generated_image.png"`);

  return new Response(imageResponse.body, {
    headers,
    status: imageResponse.status,
  });
}

async function handleImageDataResponse(imageData) {
  const headers = new Headers();
  headers.set("Content-Type", "image/png");
  headers.set("Content-Disposition", `inline; filename="generated_image.png"`);

  return new Response(imageData, { headers, status: 200 });
}
