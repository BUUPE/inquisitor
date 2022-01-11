import React from "react";

import SettingsContext from "./context";

const withSettings = (Component) => (props) => (
  <SettingsContext.Consumer>
    {(context) => <Component {...props} settings={context} />}
  </SettingsContext.Consumer>
);

export default withSettings;
