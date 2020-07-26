import React from "react";
import { navigate } from "gatsby";

import AuthUserContext from "./context";
import { withFirebase } from "../Firebase";
import Logo from "../Logo";
import { Centered } from "../../styles/global";

const withAuthorization = (condition) => (Component) => {
  class WithAuthorization extends React.Component {
    _initFirebase = false;

    firebaseInit = () => {
      if (this.props.firebase && !this._initFirebase) {
        this._initFirebase = true;

        this.listener = this.props.firebase.onAuthUserListener(
          (authUser) => {
            if (!authUser) {
              navigate("/login");
            }
          },
          () => navigate("/login")
        );
      }
    };

    componentDidMount() {
      this.firebaseInit();
    }

    componentDidUpdate() {
      this.firebaseInit();
    }

    componentWillUnmount() {
      this.listener && this.listener();
    }

    render() {
      const AuthorizationFailed = () => (
        <Centered>
          <Logo size="medium" />
          <h3>You don't have permission to view this page!</h3>
          <p>If you believe you should have access, please contact an admin.</p>
        </Centered>
      );

      return (
        <AuthUserContext.Consumer>
          {(authUser) =>
            condition(authUser) ? (
              <Component {...this.props} />
            ) : (
              <AuthorizationFailed />
            )
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withFirebase(WithAuthorization);
};

export default withAuthorization;
