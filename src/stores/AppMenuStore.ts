import { types } from "mobx-state-tree";

const AppMenuStateModel = types
  .model("AppMenuState", {
    isOpen: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    openMenu() {
      self.isOpen = true;
    },
    closeMenu() {
      self.isOpen = false;
    },
    toggleMenu() {
      self.isOpen = !self.isOpen;
    },
  }));

const menuState = AppMenuStateModel.create();

export default menuState;
