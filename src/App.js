import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import * as ROUTES from "./constants/routes";
import { withFirebase } from "./components/Firebase";
import { withAuthentication } from "./components/Session";
import { compose } from "recompose";

import StartScreen from "./components/StartScreen";
import SignInForm from "./components/Signin";
import Signout from "./components/Signout";
import Landing from "./components/Landing";
import JoinRoom from "./components/JoinRoom";
import Interview from "./components/Interview";
import NotFound from "./components/404";

const AppBase = () => (
  <Router className="App">
    <Switch>
      <Route exact path={ROUTES.LANDING} component={Landing} />
      <Route path={ROUTES.SIGNIN} component={SignInForm} />
      <Route path={ROUTES.SIGNOUT} component={Signout} />
      <Route path={ROUTES.CREATE} component={StartScreen} />
      <Route exact path={ROUTES.JOIN} component={JoinRoom} />
      <Route path={ROUTES.INTERVIEW} component={Interview} />
      <Route component={NotFound} />
    </Switch>
  </Router>
);

const App = compose(withAuthentication, withFirebase)(AppBase);

export default App;
