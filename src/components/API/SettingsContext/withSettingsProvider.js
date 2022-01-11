import React from "react";
import PropTypes from "prop-types";

import SettingsContext from "./context";
import Firebase, { withFirebase } from "upe-react-components";

import Loader from "../../../components/Loader";

const DEFAULT_GENERAL_SETTINGS = {
  deliberationsOpen: false,
  useTwoRoundDeliberations: false,
  applicationsOpen: false,
  timeslotsOpen: false,
  timeslotsOpenForApplicants: false,
  remoteInterview: false,
  timeslotLength: 45,
  timeslotDays: [],
  timeslotStart: 8,
  timeslotEnd: 22,
  zoomlink: "https://bostonu.zoom.us/s/96821681891",
};

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

      if (loading) {
        return (
          <SettingsContext.Provider value={generalSettings}>
            <Component>
              {" "}
              <Loader />{" "}
            </Component>
          </SettingsContext.Provider>
        );
      }

      return (
        <SettingsContext.Provider value={generalSettings}>
          <Component> {this.props.children} </Component>
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
