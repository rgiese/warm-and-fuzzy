import { ActivityIndicator, Text, Title } from "react-native-paper";

import React from "react";
import { StoreBase } from "@grumpycorp/warm-and-fuzzy-shared-client";

const StoreChecks: React.FunctionComponent<{ requiredStores: StoreBase[] }> = ({
  requiredStores,
  children,
}): React.ReactElement => {
  const allStoresAvailable = requiredStores.every(store => store.isReady || store.isUpdating);

  if (allStoresAvailable) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }

  const anyStoresWorking = requiredStores.some(store => store.isWorking);

  if (anyStoresWorking) {
    return <ActivityIndicator animating />;
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
