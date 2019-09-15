import { Component } from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { withFirebase } from './Firebase';

import * as ROUTES from '../constants/routes';

class SignoutBase extends Component {
  componentDidMount() {
    this.props.firebase.doSignOut()
    .then(() => {
      this.props.history.push(ROUTES.LANDING);
    });
  }

  render() {
    return null;
  }
}

const Signout = compose(
  withRouter,
  withFirebase,
)(SignoutBase);

export default Signout;