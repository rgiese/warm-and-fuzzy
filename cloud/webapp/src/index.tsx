import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";

import "./index.css";

import History from "./services/History";

import App from "./App";

ReactDOM.render(
  <Router history={History}>
    <App />
  </Router>,
  document.getElementById("root")
);
