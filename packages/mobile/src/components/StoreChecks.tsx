import React from "react";
import { ActivityIndicator, Text, Title } from "react-native-paper";

import { StoreBase } from "@grumpycorp/warm-and-fuzzy-shared-client";

export function areStoresAvailable(stores: StoreBase[]) {
  return stores.every(store => store.isReady || store.isUpdating);
}

export function renderStoreWorkingOrErrorComponent(stores: StoreBase[]) {
  const anyStoresWorking = stores.some(store => store.isWorking);

  if (anyStoresWorking) {
    return <ActivityIndicator animating={true} />;
  }

  return (
    <>
      <Title>Error</Title>
      {stores
        .filter(store => store.hasErrors)
        .map(store => (
          <Text key={store.name}>{store.error}</Text>
        ))}
    </>
  );
}
