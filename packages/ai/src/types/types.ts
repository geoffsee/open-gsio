import { ProviderRepository } from '../providers/_ProviderRepository.ts';

export type GenericEnv = Record<string, any>;

export type GenericStreamData = any;

export type ModelMeta = {
  id: any;
} & Record<string, any>;

export type SupportedProvider = keyof typeof ProviderRepository.OPENAI_COMPAT_ENDPOINTS & string;

export type Provider = { name: SupportedProvider; key: string; endpoint: string };

export type Providers = Provider[];

export type ChatRequestBody = {
  messages: any[];
  model: string;
  conversationId: string;
};

export interface BuildAssistantPromptParams {
  maxTokens: any;
}

export interface PreprocessParams {
  messages: any[];
}
