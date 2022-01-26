import React, { useState, useEffect, useRef } from "react";

import SettingsContext from "./context";
import { withFirebase } from "upe-react-components";

import Loader from "../../../components/Loader";
import { DEFAULT_GENERAL_SETTINGS } from "../../../util/config";

const withSettingsProvider =
  (Component) =>
  ({ firebase, children }) => {
    const [generalSettings, setGeneralSettings] = useState(
      DEFAULT_GENERAL_SETTINGS
    );
    const [loading, setLoading] = useState(true);

    // Use refs for the following values so that they don't cause a re-render when updated
    const _isListenerInitialized = useRef(false);
    const _isMounted = useRef(false);

    // Keep track of whether the component is mounted
    useEffect(() => {
      _isMounted.current = true;
      return () => {
        _isMounted.current = false;
      };
    }, []);

    useEffect(() => {
      // Only continue if firebase is present, listener isn't initialized, and we're still mounted
      if (firebase && !_isListenerInitialized.current && _isMounted.current) {
        const cleanupListener = firebase.generalSettings().onSnapshot(
          (doc) => {
            if (doc.exists) {
              setGeneralSettings(doc.data());
            }
            setLoading(false);
          },
          () => setLoading(false)
        );

        _isListenerInitialized.current = true;

        // Return a function that calls the cleanup function
        return () => {
          cleanupListener();
        };
      }
    }, [firebase]);

    return (
      <SettingsContext.Provider value={generalSettings}>
        <Component> {loading ? <Loader /> : children} </Component>
      </SettingsContext.Provider>
    );
  };

export default withFirebase(withSettingsProvider);
