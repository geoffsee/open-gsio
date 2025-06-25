import type { GenericEnv, ModelMeta, Providers, SupportedProvider } from '../types';

export class ProviderRepository {
  #providers: Providers = [];
  #env: GenericEnv;

  constructor(env: GenericEnv) {
    this.#env = env;
    this.setProviders(env);
  }

  static OPENAI_COMPAT_ENDPOINTS = {
    xai: 'https://api.x.ai/v1',
    groq: 'https://api.groq.com/openai/v1',
    google: 'https://generativelanguage.googleapis.com/v1beta/openai',
    fireworks: 'https://api.fireworks.ai/inference/v1',
    cohere: 'https://api.cohere.ai/compatibility/v1',
    cloudflare: 'https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/ai/v1',
    claude: 'https://api.anthropic.com/v1',
    openai: 'https://api.openai.com/v1',
    cerebras: 'https://api.cerebras.com/v1',
    ollama: 'http://localhost:11434/v1',
    mlx: 'http://localhost:10240/v1',
  };

  static async getModelFamily(model: any, env: GenericEnv) {
    const allModels = await env.KV_STORAGE.get('supportedModels');
    const models = JSON.parse(allModels);
    const modelData = models.filter((m: ModelMeta) => m.id === model);
    return modelData[0].provider;
  }

  static async getModelMeta(meta: any, env: GenericEnv) {
    const allModels = await env.KV_STORAGE.get('supportedModels');
    const models = JSON.parse(allModels);
    return models.filter((m: ModelMeta) => m.id === meta.model).pop();
  }

  getProviders(): { name: string; key: string; endpoint: string }[] {
    return this.#providers;
  }

  setProviders(env: GenericEnv) {
    const indicies = {
      providerName: 0,
      providerValue: 1,
    };
    const valueDelimiter = '_';
    const envKeys = Object.keys(env);
    for (let i = 0; i < envKeys.length; i++) {
      if (envKeys.at(i)?.endsWith('KEY')) {
        const detectedProvider = envKeys
          .at(i)
          ?.split(valueDelimiter)
          .at(indicies.providerName)
          ?.toLowerCase();
        const detectedProviderValue = env[envKeys.at(i) as string];
        if (detectedProviderValue) {
          switch (detectedProvider) {
            case 'anthropic':
              this.#providers.push({
                name: 'claude',
                key: env.ANTHROPIC_API_KEY,
                endpoint: ProviderRepository.OPENAI_COMPAT_ENDPOINTS['claude'],
              });
              break;
            case 'gemini':
              this.#providers.push({
                name: 'google',
                key: env.GEMINI_API_KEY,
                endpoint: ProviderRepository.OPENAI_COMPAT_ENDPOINTS['google'],
              });
              break;
            case 'cloudflare':
              this.#providers.push({
                name: 'cloudflare',
                key: env.CLOUDFLARE_API_KEY,
                endpoint: ProviderRepository.OPENAI_COMPAT_ENDPOINTS[detectedProvider].replace(
                  '{CLOUDFLARE_ACCOUNT_ID}',
                  env.CLOUDFLARE_ACCOUNT_ID,
                ),
              });
              break;
            default:
              this.#providers.push({
                name: detectedProvider as SupportedProvider,
                key: env[envKeys[i] as string],
                endpoint:
                  ProviderRepository.OPENAI_COMPAT_ENDPOINTS[detectedProvider as SupportedProvider],
              });
          }
        }
      }
    }
  }
}
