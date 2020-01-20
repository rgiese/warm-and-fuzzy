import { Message } from "semantic-ui-react";
import React from "react";
import { StoreBase } from "@grumpycorp/warm-and-fuzzy-shared-client";
import { observer } from "mobx-react";

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
    return <Message content="Working..." />;
  }

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {requiredStores
        .filter(store => store.hasErrors)
        .map(store => (
          <Message content={store.error} key={store.name} negative />
        ))}
    </>
  );
};

export default observer(StoreChecks);
