interface Env {
  // Services
  ANALYTICS: any;
  EMAIL_SERVICE: any;

  // Durable Objects
  SITE_COORDINATOR: import("./durable_objects/SiteCoordinator");

  // Handles serving static assets
  ASSETS: Fetcher;

  // KV Bindings
  KV_STORAGE: KVNamespace;

  // Text/Secrets
  OPENAI_MODEL:
    | string
    | "gpt-4o"
    | "gpt-4o-2024-05-13"
    | "gpt-4o-2024-08-06"
    | "gpt-4o-mini"
    | "gpt-4o-mini-2024-07-18"
    | "gpt-4-turbo"
    | "gpt-4-turbo-2024-04-09"
    | "gpt-4-0125-preview"
    | "gpt-4-turbo-preview"
    | "gpt-4-1106-preview"
    | "gpt-4-vision-preview"
    | "gpt-4"
    | "gpt-4-0314"
    | "gpt-4-0613"
    | "gpt-4-32k"
    | "gpt-4-32k-0314"
    | "gpt-4-32k-0613"
    | "gpt-3.5-turbo"
    | "gpt-3.5-turbo-16k"
    | "gpt-3.5-turbo-0301"
    | "gpt-3.5-turbo-0613"
    | "gpt-3.5-turbo-1106"
    | "gpt-3.5-turbo-0125"
    | "gpt-3.5-turbo-16k-0613";
  PERIGON_API_KEY: string;
  OPENAI_API_ENDPOINT: string;
  OPENAI_API_KEY: string;
  EVENTSOURCE_HOST: string;
  GROQ_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  FIREWORKS_API_KEY: string;
  GEMINI_API_KEY: string;
  XAI_API_KEY: string;
  CEREBRAS_API_KEY: string;
  CLOUDFLARE_API_KEY: string;
  CLOUDFLARE_ACCOUNT_ID: string;
}
