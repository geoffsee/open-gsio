import type {IMessagesStore} from "./MessagesStore.ts";
import type {IUIStore} from "./UIStore.ts";
import type {IModelStore} from "./ModelStore.ts";

export type RootDeps = IMessagesStore & IUIStore & IModelStore;