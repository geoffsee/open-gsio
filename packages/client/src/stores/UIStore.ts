
// ---------------------------
// stores/UIStore.ts
// ---------------------------
import { type Instance, types } from "mobx-state-tree";

export const UIStore = types
    .model("UIStore", {
        input: types.optional(types.string, ""),
        isLoading: types.optional(types.boolean, false),
    })
    .actions((self) => ({
        setInput(value: string) {
            self.input = value;
        },
        setIsLoading(value: boolean) {
            self.isLoading = value;
        },
    }));

export interface IUIStore extends Instance<typeof UIStore> {}
