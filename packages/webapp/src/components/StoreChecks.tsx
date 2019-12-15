import React from "react";
import { Message } from "semantic-ui-react";

import StoreBase from "../stores/StoreBase";

export function areStoresReady(stores: StoreBase[]) {
  const anyStoresNotReady = stores.some(store => store.state !== "ready");
  return !anyStoresNotReady;
}

export function renderStoreLoadingOrErrorComponent(stores: StoreBase[]) {
  const anyStoresFetching = stores.some(store => store.state === "fetching");

  if (anyStoresFetching) {
    return <Message content="Fetching..." />;
  }

  return (
    <>
      {stores
        .filter(store => store.state === "error")
        .map(store => (
          <Message negative content={store.error} />
        ))}
    </>
  );
}
