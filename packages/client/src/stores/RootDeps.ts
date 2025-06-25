import type { IMessagesStore } from './MessagesStore.ts';
import type { IModelStore } from './ModelStore.ts';
import type { IUIStore } from './UIStore.ts';

export type RootDeps = IMessagesStore & IUIStore & IModelStore;
