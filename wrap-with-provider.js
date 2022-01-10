import React, { Fragment } from "react";
import { navigate } from "gatsby";
import { useLocation } from "@reach/router";

import {
  setLayoutBase,
  setFirebaseClass,
  setWithAuthorizationWrapper,
  WithAuthorizationClass,
} from "upe-react-components";

import Firebase from "./src/components/Firebase";
import Header from "./src/components/Header";
import Footer from "./src/components/Footer";
import Logo from "./src/components/Logo";
import TextDisplay from "./src/components/TextDisplay";
import GlobalStyle from "./src/styles/global";

import { pathPrefix } from "./gatsby-config";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";

export default ({ element }) => {
  setFirebaseClass(Firebase);

  const WithAuthorizationWrapper = (props) => {
    const location = useLocation();
    const savePathname = () =>
      window.localStorage.setItem(
        "pathname",
        location.pathname.replace(pathPrefix, "")
      );

    return (
      <WithAuthorizationClass
        firebaseAuthNext={(authUser) => {
          if (!authUser) {
            savePathname();
            navigate("/login");
          }
        }}
        firebaseAuthFallback={() => {
          savePathname();
          navigate("/login");
        }}
        authorizationFailed=
				{<div style={{width: "100%"}}>
					<TextDisplay
						name={"No Permissions"}
						text={"If you believe you should have access, please contact an admin."}
						displayBack={true} />
				</div>}
        {...props}
      />
    );
  };
  // would've preferred to call this in gatsby-browser onClientEntry, but can't do Queries in there
  setWithAuthorizationWrapper(WithAuthorizationWrapper);

  const LayoutBase = ({ children }) => (
    <Fragment>
      <GlobalStyle />
      <Header />
      {children}
      <Footer />
    </Fragment>
  );
  LayoutBase.displayName = "LayoutBase";
  setLayoutBase(LayoutBase);

  return element;
};
