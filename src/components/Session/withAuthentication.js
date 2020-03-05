import React from 'react';
import axios from 'axios';
import AuthUserContext from './context';

const withAuthentication = Component => class WithAuthentication extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: null,
    };
  }

  componentDidMount() {
    axios.get('/api/getAuthUser')
      .then(res => this.setState({ authUser: res.data }))
      .catch(err => console.error(err));
  }

  render() {
    return (
      <AuthUserContext.Provider value={this.state.authUser}>
        <Component {...this.props} />
      </AuthUserContext.Provider>
    );
  }
};

export default withAuthentication;
