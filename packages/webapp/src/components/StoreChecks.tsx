import React from "react";
import { Message } from "semantic-ui-react";
import { observer } from "mobx-react";

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
    return <Message content="Working..." />;
  }

  return (
    <>
      {requiredStores
        .filter(store => store.hasErrors)
        .map(store => (
          <Message negative content={store.error} key={store.name} />
        ))}
    </>
  );
};

export default observer(StoreChecks);
