
export class ProviderRepository {
    #providers: {name: string, key: string, endpoint: string}[] = [];
    constructor(env: Record<string, any>) {
        this.setProviders(env);
    }

    static OPENAI_COMPAT_ENDPOINTS = {
        xai: 'https://api.x.ai/v1',
        groq: 'https://api.groq.com/openai/v1',
        google: 'https://generativelanguage.googleapis.com/v1beta/openai',
        fireworks: 'https://api.fireworks.ai/inference/v1',
        cohere: 'https://api.cohere.ai/compatibility/v1',
        cloudflare: 'https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/ai/v1',
        anthropic: 'https://api.anthropic.com/v1/',
        openai: 'https://api.openai.com/v1/',
        cerebras: 'https://api.cerebras.com/v1/',
        ollama: "http://localhost:11434",
        mlx: "http://localhost:10240/v1",
    }

    static async getModelFamily(model, env: Env) {
        const allModels = await env.KV_STORAGE.get("supportedModels");
        const models = JSON.parse(allModels);
        const modelData = models.filter(m => m.id === model)
        console.log({modelData})
        return modelData[0].provider;
    }

    static async getModelMeta(meta, env) {
        const allModels = await env.KV_STORAGE.get("supportedModels");
        const models = JSON.parse(allModels);
        return models.filter(m => m.id === meta.model).pop()
    }

    getProviders():  {name: string, key: string, endpoint: string}[] {
        return this.#providers;
    }

    setProviders(env: Record<string, any>) {
        let envKeys = Object.keys(env);
        for (let i = 0; i < envKeys.length; i++) {
            if (envKeys[i].endsWith('KEY')) {
                const detectedProvider = envKeys[i].split('_')[0].toLowerCase();
                const detectedProviderValue = env[envKeys[i]];
                if(detectedProviderValue) {
                    console.log({detectedProviderValue});
                    switch (detectedProvider) {
                        case 'anthropic':
                            console.log({detectedProvider});
                            this.#providers.push({
                                name: 'anthropic',
                                key: env.ANTHROPIC_API_KEY,
                                endpoint: ProviderRepository.OPENAI_COMPAT_ENDPOINTS['anthropic']
                            });
                            break;
                        case 'gemini':
                            console.log({detectedProvider});
                            this.#providers.push({
                                name: 'google',
                                key: env.GEMINI_API_KEY,
                                endpoint: ProviderRepository.OPENAI_COMPAT_ENDPOINTS['google']
                            });
                            break;
                        case 'cloudflare':
                            console.log({detectedProvider});
                            this.#providers.push({
                                name: 'cloudflare',
                                key: env.CLOUDFLARE_API_KEY,
                                endpoint: ProviderRepository.OPENAI_COMPAT_ENDPOINTS[detectedProvider].replace("{CLOUDFLARE_ACCOUNT_ID}", env.CLOUDFLARE_ACCOUNT_ID)
                            })
                        default:
                            console.log({detectedProvider});
                            this.#providers.push({
                                name: detectedProvider,
                                key: env[envKeys[i]],
                                endpoint: ProviderRepository.OPENAI_COMPAT_ENDPOINTS[detectedProvider]
                            });
                    }
                }
            }
        }
    }
}