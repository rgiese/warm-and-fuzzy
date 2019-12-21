import React from "react";

import { RootStore } from "./RootStore";

export type RootStoreContext = {
  rootStore: RootStore;
};

// TypeScript gymnastics so we don't need to make rootStore above "rootStore?"
export default React.createContext<RootStoreContext>({
  rootStore: (undefined as unknown) as RootStore,
});
