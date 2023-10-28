import React, { useContext } from "react";

import { RootStore } from "./RootStore";

export interface RootStoreContextType {
  rootStore: RootStore;
}

// TypeScript gymnastics so we don't need to make rootStore above "rootStore?"
export const RootStoreContext = React.createContext<RootStoreContextType>({
  rootStore: (undefined as unknown) as RootStore,
});

export function useRootStore(): RootStore {
  return useContext(RootStoreContext).rootStore;
}
