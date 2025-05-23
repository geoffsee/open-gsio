import { flow, types } from "mobx-state-tree";
import ClientChatStore from "./ClientChatStore";
import { runInAction } from "mobx";
import Cookies from "js-cookie";

const UserOptionsStore = types
  .model("UserOptionsStore", {
    followModeEnabled: types.optional(types.boolean, false),
    theme: types.optional(types.string, "darknight"),
    text_model: types.optional(types.string, "llama-3.3-70b-versatile"),
  })
  .actions((self) => ({
    getFollowModeEnabled: flow(function* () {
      return self.followModeEnabled;
    }),
    storeUserOptions() {
      const userOptionsCookie = document.cookie
        .split(";")
        .find((row) => row.startsWith("user_preferences"));

      console.log(document.cookie.split(";"));

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
    initialize: flow(function* () {
      const userPreferencesCoookie = document.cookie
        .split(";")
        .find((row) => row.startsWith("user_preferences"));

      if (!userPreferencesCoookie) {
        console.log("No user preferences cookie found, creating one");
        self.storeUserOptions();
      }

      if (userPreferencesCoookie) {
        const userPreferences = JSON.parse(
          atob(userPreferencesCoookie.split("=")[1]),
        );
        self.theme = userPreferences.theme;
        self.text_model = userPreferences.text_model;
      }

      window.addEventListener("scroll", async () => {
        if (ClientChatStore.isLoading && self.followModeEnabled) {
          console.log("scrolling");
          await self.setFollowModeEnabled(false);
        }
      });

      window.addEventListener("wheel", async () => {
        if (ClientChatStore.isLoading && self.followModeEnabled) {
          console.log("wheel");
          await self.setFollowModeEnabled(false);
        }
      });

      window.addEventListener("touchmove", async () => {
        console.log("touchmove");
        if (ClientChatStore.isLoading && self.followModeEnabled) {
          await self.setFollowModeEnabled(false);
        }
      });

      window.addEventListener("mousedown", async () => {
        if (ClientChatStore.isLoading && self.followModeEnabled) {
          await self.setFollowModeEnabled(false);
        }
      });
    }),
    deleteCookie() {
      document.cookie = "user_preferences=; max-age=; path=/;";
    },
    setFollowModeEnabled: flow(function* (followMode: boolean) {
      self.followModeEnabled = followMode;
    }),
    toggleFollowMode: flow(function* () {
      self.followModeEnabled = !self.followModeEnabled;
    }),
    selectTheme: flow(function* (theme: string) {
      self.theme = theme;
      self.storeUserOptions();
    }),
  }));

const userOptionsStore = UserOptionsStore.create();

export default userOptionsStore;
