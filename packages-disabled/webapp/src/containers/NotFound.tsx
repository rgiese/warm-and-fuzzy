import React from "react";
import { ReactComponent as SadTurnip } from "../assets/sad-turnip.svg";

function NotFound(): React.ReactElement {
  return (
    <div>
      <SadTurnip className="h4 pt4" />
      <h3>Sorry, page not found!</h3>
    </div>
  );
}

export default NotFound;
