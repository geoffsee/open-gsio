// ---------------------------
// stores/ClientChatStore.ts (root)
// ---------------------------
import { types, type Instance } from 'mobx-state-tree';

import { MessagesStore } from './MessagesStore';
import { ModelStore } from './ModelStore';
import { StreamStore } from './StreamStore';
import { UIStore } from './UIStore';

export const ClientChatStore = types
  .compose(MessagesStore, UIStore, ModelStore, StreamStore)
  .named('ClientChatStore');

const clientChatStore = ClientChatStore.create();

export type IClientChatStore = Instance<typeof ClientChatStore>;

export default clientChatStore;
