import React from "react";
import { Message } from "semantic-ui-react";

import StoreBase from "../stores/StoreBase";

export function areStoresReady(stores: StoreBase[]) {
  const anyStoresWorking = stores.some(store => store.isWorking);
  return !anyStoresWorking;
}

export function renderStoreLoadingOrErrorComponent(stores: StoreBase[]) {
  const anyStoresWorking = stores.some(store => store.isWorking);

  if (anyStoresWorking) {
    return <Message content="Working..." />;
  }

  return (
    <>
      {stores
        .filter(store => store.hasErrors)
        .map(store => (
          <Message negative content={store.error} />
        ))}
    </>
  );
}
