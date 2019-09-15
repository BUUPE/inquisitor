import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import * as ROUTES from './constants/routes';
import { withFirebase } from './components/Firebase';
import { withAuthentication  } from './components/Session';
import { compose } from 'recompose';

import StartScreen from './components/StartScreen';
import SignInForm from './components/Signin';
import Signout from './components/Signout';
import Landing from './components/Landing';

const AppBase = () => (
  <Router className="App">
    <Route exact path={ROUTES.LANDING} component={Landing} />
    <Route path={ROUTES.SIGNIN} component={SignInForm} />
    <Route path={ROUTES.SIGNOUT} component={Signout} />
    <Route path={ROUTES.CREATE} component={StartScreen} />
    <Route path={ROUTES.INTERVIEW} component={StartScreen} />
  </Router>
);

const App = compose(
  withAuthentication,
  withFirebase,
)(AppBase);

export default App;
