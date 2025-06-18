import { types } from "mobx-state-tree";
import ClientChatStore from "./ClientChatStore";
import { runInAction } from "mobx";
import Cookies from "js-cookie";

export const UserOptionsStoreModel = types
  .model("UserOptionsStore", {
    followModeEnabled: types.optional(types.boolean, false),
    theme: types.optional(types.string, "darknight"),
    text_model: types.optional(types.string, "llama-3.3-70b-versatile"),
  })
  .actions((self) => ({
    getFollowModeEnabled() {
      return self.followModeEnabled;
    },
    resetStore() {
      self.followModeEnabled = false;
      self.theme = "darknight";
      self.text_model = "llama-3.3-70b-versatile";
    },
    storeUserOptions() {
      const userOptionsCookie = document.cookie
        .split(";")
        .find((row) => row.startsWith("user_preferences"));

      // console.log(document.cookie.split(";"));

      const newUserOptions = JSON.stringify({
        theme: self.theme,
        text_model: self.text_model,
      });

      const encodedUserPreferences = btoa(newUserOptions);

      const oldUserOptions = userOptionsCookie
        ? atob(userOptionsCookie.split("=")[1])
        : null;

      runInAction(() => {
        Cookies.set("user_preferences", encodedUserPreferences);
      });
    },
    initialize() {
      const userPreferencesCoookie = document.cookie
        .split(";")
        .find((row) => row.startsWith("user_preferences"));

      if (!userPreferencesCoookie) {
        // console.log("No user preferences cookie found, creating one");
        self.storeUserOptions();
      }

      if (userPreferencesCoookie) {
        const userPreferences = JSON.parse(
          atob(userPreferencesCoookie.split("=")[1]),
        );
        self.theme = userPreferences.theme;
        self.text_model = userPreferences.text_model;
      }

      window.addEventListener("scroll", () => {
        if (ClientChatStore.isLoading && self.followModeEnabled) {
          // console.log("scrolling");
          self.setFollowModeEnabled(false);
        }
      });

      window.addEventListener("wheel", () => {
        if (ClientChatStore.isLoading && self.followModeEnabled) {
          // console.log("wheel");
          self.setFollowModeEnabled(false);
        }
      });

      window.addEventListener("touchmove", () => {
        // console.log("touchmove");
        if (ClientChatStore.isLoading && self.followModeEnabled) {
          self.setFollowModeEnabled(false);
        }
      });

      window.addEventListener("mousedown", () => {
        if (ClientChatStore.isLoading && self.followModeEnabled) {
          self.setFollowModeEnabled(false);
        }
      });
    },
    deleteCookie() {
      document.cookie = "user_preferences=; max-age=; path=/;";
    },
    setFollowModeEnabled(followMode: boolean) {
      self.followModeEnabled = followMode;
    },
    toggleFollowMode() {
      self.followModeEnabled = !self.followModeEnabled;
    },
    selectTheme(theme: string) {
      self.theme = theme;
      self.storeUserOptions();
    },
    setTheme(theme: string) {
      self.theme = theme;
    },
    setTextModel(model: string) {
      self.text_model = model;
    },
  }));

const userOptionsStore = UserOptionsStoreModel.create();

export default userOptionsStore;
