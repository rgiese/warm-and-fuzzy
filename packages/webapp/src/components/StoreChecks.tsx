import React from "react";
import { Message } from "semantic-ui-react";

import { StoreBase } from "@grumpycorp/warm-and-fuzzy-shared-client";

export function areStoresAvailable(stores: StoreBase[]) {
  return stores.every(store => store.isReady || store.isUpdating);
}

export function renderStoreWorkingOrErrorComponent(stores: StoreBase[]) {
  const anyStoresWorking = stores.some(store => store.isWorking);

  if (anyStoresWorking) {
    return <Message content="Working..." />;
  }

  return (
    <>
      {stores
        .filter(store => store.hasErrors)
        .map((store, storeIndex) => (
          <Message negative content={store.error} key={storeIndex} />
        ))}
    </>
  );
}
