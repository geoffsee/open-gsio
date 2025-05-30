const SUPPORTED_MODELS_GROUPS = {
  openai: [
    // "o1-preview",
    // "o1-mini",
    // "gpt-4o",
    // "gpt-3.5-turbo"
  ],
  groq: [
    // "mixtral-8x7b-32768",
    // "deepseek-r1-distill-llama-70b",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "gemma2-9b-it",
    "mistral-saba-24b",
    // "qwen-2.5-32b",
    "llama-3.3-70b-versatile",
    // "llama-3.3-70b-versatile"
    // "llama-3.1-70b-versatile",
    // "llama-3.3-70b-versatile"
  ],
  cerebras: ["llama-3.3-70b"],
  claude: [
    // "claude-3-5-sonnet-20241022",
    // "claude-3-opus-20240229"
  ],
  fireworks: [
    // "llama-v3p1-405b-instruct",
    // "llama-v3p1-70b-instruct",
    // "llama-v3p2-90b-vision-instruct",
    // "mixtral-8x22b-instruct",
    // "mythomax-l2-13b",
    // "yi-large"
  ],
  google: [
    // "gemini-2.0-flash-exp",
    // "gemini-1.5-flash",
    // "gemini-exp-1206",
    // "gemini-1.5-pro"
  ],
  xai: [
    // "grok-beta",
    // "grok-2",
    // "grok-2-1212",
    // "grok-2-latest",
    // "grok-beta"
  ],
  cloudflareAI: [
    "llama-3.2-3b-instruct", // max_tokens
    "llama-3-8b-instruct", // max_tokens
    "llama-3.1-8b-instruct-fast", // max_tokens
    "deepseek-math-7b-instruct",
    "deepseek-coder-6.7b-instruct-awq",
    "hermes-2-pro-mistral-7b",
    "openhermes-2.5-mistral-7b-awq",
    "mistral-7b-instruct-v0.2",
    "neural-chat-7b-v3-1-awq",
    "openchat-3.5-0106",
    // "gemma-7b-it",
  ],
};

export type SupportedModel =
    | keyof typeof SUPPORTED_MODELS_GROUPS
    | (typeof SUPPORTED_MODELS_GROUPS)[keyof typeof SUPPORTED_MODELS_GROUPS][number];

export type ModelFamily = keyof typeof SUPPORTED_MODELS_GROUPS;

function getModelFamily(model: string): ModelFamily | undefined {
  return Object.keys(SUPPORTED_MODELS_GROUPS)
      .filter((family) => {
        return SUPPORTED_MODELS_GROUPS[
            family as keyof typeof SUPPORTED_MODELS_GROUPS
            ].includes(model.trim());
      })
      .at(0) as ModelFamily | undefined;
}

const SUPPORTED_MODELS = [
  // ...SUPPORTED_MODELS_GROUPS.xai,
  // ...SUPPORTED_MODELS_GROUPS.claude,
  // ...SUPPORTED_MODELS_GROUPS.google,
  ...SUPPORTED_MODELS_GROUPS.groq,
  // ...SUPPORTED_MODELS_GROUPS.fireworks,
  // ...SUPPORTED_MODELS_GROUPS.openai,
  // ...SUPPORTED_MODELS_GROUPS.cerebras,
  // ...SUPPORTED_MODELS_GROUPS.cloudflareAI,
];

export { SUPPORTED_MODELS, SUPPORTED_MODELS_GROUPS, getModelFamily };
