interface Env {
  // Services
  ANALYTICS: any;
  EMAIL_SERVICE: any;

  // Durable Objects
  SERVER_COORDINATOR: import("packages/server/durable-objects/ServerCoordinator.ts");

  // Handles serving static assets
  ASSETS: Fetcher;

  // KV Bindings
  KV_STORAGE: KVNamespace;


  // Text/Secrets
  METRICS_HOST: string;
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
  MLX_API_KEY: string;
  OLLAMA_API_KEY: string;
}
