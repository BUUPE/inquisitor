import React from "react";
import PropTypes from "prop-types";

import SettingsContext from "./context";
import Firebase, { withFirebase } from "upe-react-components";

import Loader from "../../../components/Loader";

import { DEFAULT_GENERAL_SETTINGS } from "../../../util/config";

const withSettingsProvider = (Component) => {
  class WithSettingsProviderClass extends React.Component {
    _initFirebase = false;
    _isMounted = false;
    state = {
      generalSettings: null,
      loading: true,
    };
    listener = null;

    safeSetState = (state) => this._isMounted && this.setState(state);

    firebaseInit = () => {
      if (this.props.firebase && !this._initFirebase) {
        this._initFirebase = true;

        this.listener = this.props.firebase.generalSettings().onSnapshot(
          (doc) => {
            if (!doc.exists) {
              this.safeSetState({
                generalSettings: DEFAULT_GENERAL_SETTINGS,
                loading: false,
              });
            } else {
              const generalSettings = doc.data();
              this.safeSetState({ generalSettings, loading: false });
            }
          },
          () => {
            this.safeSetState({
              generalSettings: DEFAULT_GENERAL_SETTINGS,
              loading: false,
            });
          }
        );
      }
    };

    componentDidMount() {
      this._isMounted = true;
      this.firebaseInit();
    }

    componentDidUpdate() {
      this.firebaseInit();
    }

    componentWillUnmount() {
      this._isMounted = false;
      this.listener && this.listener();
    }

    render() {
      const { generalSettings, loading } = this.state;

      return (
        <SettingsContext.Provider value={generalSettings}>
          <Component>
            {" "}
            {!!loading ? <Loader /> : this.props.children}{" "}
          </Component>
        </SettingsContext.Provider>
      );
    }
  }

  WithSettingsProviderClass.displayName = "WithSettingsProviderClass";

  WithSettingsProviderClass.propTypes = {
    children: PropTypes.node.isRequired,
    firebase: PropTypes.instanceOf(Firebase),
  };

  return withFirebase(WithSettingsProviderClass);
};

export default withSettingsProvider;
