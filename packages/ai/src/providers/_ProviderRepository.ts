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
    // eslint-disable-next-line prettier/prettier
    console.log(`[DEBUG_LOG] ProviderRepository.getModelFamily: Looking up model "${model}"`);

    const allModels = await env.KV_STORAGE.get('supportedModels');
    const models = JSON.parse(allModels);

    // eslint-disable-next-line prettier/prettier
    console.log(`[DEBUG_LOG] ProviderRepository.getModelFamily: Found ${models.length} total models in KV storage`);
    // eslint-disable-next-line prettier/prettier
    console.log('[DEBUG_LOG] ProviderRepository.getModelFamily: Available model IDs:', models.map((m: ModelMeta) => m.id));

    // First try exact match
    let modelData = models.filter((m: ModelMeta) => m.id === model);
    // eslint-disable-next-line prettier/prettier
    console.log(`[DEBUG_LOG] ProviderRepository.getModelFamily: Exact match attempt for "${model}" found ${modelData.length} results`);

    // If no exact match, try to find by partial match (handle provider prefixes)
    if (modelData.length === 0) {
      // eslint-disable-next-line prettier/prettier
      console.log(`[DEBUG_LOG] ProviderRepository.getModelFamily: Trying partial match for "${model}"`);
      modelData = models.filter((m: ModelMeta) => {
        // Check if the model ID ends with the requested model name
        // This handles cases like "accounts/fireworks/models/mixtral-8x22b-instruct" matching "mixtral-8x22b-instruct"
        const endsWithMatch = m.id.endsWith(model);
        const modelEndsWithStoredBase = model.endsWith(m.id.split('/').pop() || '');
        // eslint-disable-next-line prettier/prettier
        console.log(`[DEBUG_LOG] ProviderRepository.getModelFamily: Checking "${m.id}" - endsWith: ${endsWithMatch}, modelEndsWithBase: ${modelEndsWithStoredBase}`);
        return endsWithMatch || modelEndsWithStoredBase;
      });
      // eslint-disable-next-line prettier/prettier
      console.log(`[DEBUG_LOG] ProviderRepository.getModelFamily: Partial match found ${modelData.length} results`);
    }

    // If still no match, try to find by the base model name (last part after /)
    if (modelData.length === 0) {
      const baseModelName = model.split('/').pop();
      // eslint-disable-next-line prettier/prettier
      console.log(`[DEBUG_LOG] ProviderRepository.getModelFamily: Trying base name match for "${baseModelName}"`);
      modelData = models.filter((m: ModelMeta) => {
        const baseStoredName = m.id.split('/').pop();
        const matches = baseStoredName === baseModelName;
        // eslint-disable-next-line prettier/prettier
        console.log(`[DEBUG_LOG] ProviderRepository.getModelFamily: Comparing base names "${baseStoredName}" === "${baseModelName}": ${matches}`);
        return matches;
      });
      // eslint-disable-next-line prettier/prettier
      console.log(`[DEBUG_LOG] ProviderRepository.getModelFamily: Base name match found ${modelData.length} results`);
    }

    const selectedProvider = modelData[0]?.provider;
    // eslint-disable-next-line prettier/prettier
    console.log(`[DEBUG_LOG] ProviderRepository.getModelFamily: Final result for "${model}" -> provider: "${selectedProvider}"`);

    if (modelData.length > 0) {
      // eslint-disable-next-line prettier/prettier
      console.log('[DEBUG_LOG] ProviderRepository.getModelFamily: Selected model data:', modelData[0]);
    } else {
      // eslint-disable-next-line prettier/prettier
      console.log(`[DEBUG_LOG] ProviderRepository.getModelFamily: No matching model found for "${model}"`);
    }

    return selectedProvider;
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
    // eslint-disable-next-line prettier/prettier
    console.log('[DEBUG_LOG] ProviderRepository.setProviders: Starting provider detection');

    const indicies = {
      providerName: 0,
      providerValue: 1,
    };
    const valueDelimiter = '_';
    const envKeys = Object.keys(env);

    // eslint-disable-next-line prettier/prettier
    console.log('[DEBUG_LOG] ProviderRepository.setProviders: Environment keys ending with KEY:', envKeys.filter(key => key.endsWith('KEY')));

    for (let i = 0; i < envKeys.length; i++) {
      if (envKeys.at(i)?.endsWith('KEY')) {
        const detectedProvider = envKeys
          .at(i)
          ?.split(valueDelimiter)
          .at(indicies.providerName)
          ?.toLowerCase();
        const detectedProviderValue = env[envKeys.at(i) as string];

        // eslint-disable-next-line prettier/prettier
        console.log(`[DEBUG_LOG] ProviderRepository.setProviders: Processing ${envKeys[i]} -> detected provider: "${detectedProvider}", has value: ${!!detectedProviderValue}`);

        if (detectedProviderValue) {
          switch (detectedProvider) {
            case 'anthropic':
              // eslint-disable-next-line prettier/prettier
              console.log('[DEBUG_LOG] ProviderRepository.setProviders: Adding Claude provider (anthropic)');
              this.#providers.push({
                name: 'claude',
                key: env.ANTHROPIC_API_KEY,
                endpoint: ProviderRepository.OPENAI_COMPAT_ENDPOINTS['claude'],
              });
              break;
            case 'gemini':
              // eslint-disable-next-line prettier/prettier
              console.log('[DEBUG_LOG] ProviderRepository.setProviders: Adding Google provider (gemini)');
              this.#providers.push({
                name: 'google',
                key: env.GEMINI_API_KEY,
                endpoint: ProviderRepository.OPENAI_COMPAT_ENDPOINTS['google'],
              });
              break;
            case 'cloudflare':
              // eslint-disable-next-line prettier/prettier
              console.log('[DEBUG_LOG] ProviderRepository.setProviders: Adding Cloudflare provider');
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
              // eslint-disable-next-line prettier/prettier
              console.log(`[DEBUG_LOG] ProviderRepository.setProviders: Adding default provider "${detectedProvider}"`);
              this.#providers.push({
                name: detectedProvider as SupportedProvider,
                key: env[envKeys[i] as string],
                endpoint:
                  ProviderRepository.OPENAI_COMPAT_ENDPOINTS[detectedProvider as SupportedProvider],
              });
          }
        } else {
          // eslint-disable-next-line prettier/prettier
          console.log(`[DEBUG_LOG] ProviderRepository.setProviders: Skipping ${envKeys[i]} - no value provided`);
        }
      }
    }

    // eslint-disable-next-line prettier/prettier
    console.log(`[DEBUG_LOG] ProviderRepository.setProviders: Final configured providers (${this.#providers.length}):`, this.#providers.map(p => ({ name: p.name, endpoint: p.endpoint, hasKey: !!p.key })));
  }
}
