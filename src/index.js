import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import dotenv from "dotenv";
import Firebase, { FirebaseContext } from "./components/Firebase";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/main.css";

dotenv.config();

ReactDOM.render(
  <FirebaseContext.Provider value={new Firebase()}>
    <App />
  </FirebaseContext.Provider>,
  document.getElementById("root")
);
