import React from "react";
import { ActivityIndicator, Text, Title } from "react-native-paper";

import { StoreBase } from "@grumpycorp/warm-and-fuzzy-shared-client";

const StoreChecks: React.FunctionComponent<{ requiredStores: StoreBase[] }> = ({
  requiredStores,
  children,
}): React.ReactElement => {
  const allStoresAvailable = requiredStores.every(store => store.isReady || store.isUpdating);

  if (allStoresAvailable) {
    return <>{children}</>;
  }

  const anyStoresWorking = requiredStores.some(store => store.isWorking);

  if (anyStoresWorking) {
    return <ActivityIndicator animating={true} />;
  }

  return (
    <>
      <Title>Error</Title>
      {requiredStores
        .filter(store => store.hasErrors)
        .map(store => (
          <Text key={store.name}>{store.error}</Text>
        ))}
    </>
  );
};

export default StoreChecks;
