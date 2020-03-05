import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';

import AuthUserContext from './context';
import * as ROUTES from '../../constants/routes';

const withAuthorization = condition => Component => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      axios.get('/api/getAuthUser')
      .then(res => { if (!condition(res.data)) window.location.replace(ROUTES.LOGIN); })
      .catch(err => console.error(err));
    }

    render() {
      return (
        <AuthUserContext.Consumer>
          {authUser =>
            condition(authUser) ? <Component {...this.props} /> : null
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withRouter(WithAuthorization);
};

export default withAuthorization;
