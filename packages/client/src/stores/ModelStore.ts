
// ---------------------------
// stores/ModelStore.ts
// ---------------------------
import { type Instance, types } from "mobx-state-tree";

export const ModelStore = types
    .model("ModelStore", {
        model: types.optional(
            types.string,
            "meta-llama/llama-4-scout-17b-16e-instruct",
        ),
        imageModel: types.optional(types.string, "black-forest-labs/flux-1.1-pro"),
        supportedModels: types.optional(types.array(types.string), []),
    })
    .actions((self) => ({
        setModel(value: string) {
            self.model = value;
            try {
                localStorage.setItem("recentModel", value);
            } catch (_) {}
        },
        setImageModel(value: string) {
            self.imageModel = value;
        },
        setSupportedModels(list: string[]) {
            self.supportedModels = list;
            if (!list.includes(self.model)) {
                // fall back to last entry (arbitrary but predictable)
                self.model = list[list.length - 1] ?? self.model;
            }
        },
    }));

export interface IModelStore extends Instance<typeof ModelStore> {}
