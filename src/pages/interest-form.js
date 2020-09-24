import React, { useEffect } from "react";
import styled from "styled-components";
import { compose } from "recompose";

import { withFirebase, withAuthorization } from "upe-react-components";

import { isLoggedIn } from "../util/conditions";
import Logo from "../components/Logo";
import SEO from "../components/SEO";
import { Container } from "../styles/global";

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
  margin-bottom: 25px;
  margin-top: 25px;

  /* Mailchimp overrides */
  #mc_embed_signup {
    width: 100%;
  }
`;

const InterestForm = () => {
  useEffect(() => {
    const mailchimpCSS = document.createElement("link");
    mailchimpCSS.href = "//cdn-images.mailchimp.com/embedcode/classic-10_7.css";
    mailchimpCSS.rel = "stylesheet";
    mailchimpCSS.type = "text/css";
    document.head.appendChild(mailchimpCSS);

    const mailchimpJS = document.createElement("script");
    mailchimpJS.type = "text/javascript";
    mailchimpJS.src =
      "//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js";
    document.head.appendChild(mailchimpJS);
    mailchimpJS.onload = () => {
      (function ($) {
        /* eslint-disable no-array-constructor, no-undef, no-unused-vars */
        window.fnames = new Array();
        window.ftypes = new Array();
        fnames[1] = "FNAME";
        ftypes[1] = "text";
        fnames[2] = "LNAME";
        ftypes[2] = "text";
        fnames[0] = "EMAIL";
        ftypes[0] = "email";
        fnames[3] = "MMERGE3";
        ftypes[3] = "text";
        fnames[4] = "MMERGE4";
        ftypes[4] = "text";
      })(jQuery);
      var $mcj = jQuery.noConflict(true);
      /* eslint-enable no-array-constructor, no-undef, no-unused-vars */
    };
  }, []);

  return (
    <>
      <SEO title="Interest Form" route="/interest-form" />
      <StyledContainer flexdirection="column">
        <Logo size="medium" />
        <h1>BU UPE Interest Form</h1>

        <div id="mc_embed_signup">
          <form
            action="https://upe.us19.list-manage.com/subscribe/post?u=e926ed9c6e5e27338c6e5452c&amp;id=ffa7b765f8"
            method="post"
            id="mc-embedded-subscribe-form"
            name="mc-embedded-subscribe-form"
            className="validate"
            target="_blank"
            noValidate
          >
            <div id="mc_embed_signup_scroll">
              <div className="indicates-required">
                <span className="asterisk">*</span> indicates required
              </div>
              <div className="mc-field-group">
                <label htmlFor="mce-FNAME">First Name </label>
                <input type="text" name="FNAME" id="mce-FNAME" />
              </div>
              <div className="mc-field-group">
                <label htmlFor="mce-LNAME">Last Name </label>
                <input type="text" name="LNAME" id="mce-LNAME" />
              </div>
              <div className="mc-field-group">
                <label htmlFor="mce-EMAIL">
                  Email Address <span className="asterisk">*</span>
                </label>
                <input
                  type="email"
                  name="EMAIL"
                  className="required email"
                  id="mce-EMAIL"
                />
              </div>
              <div className="mc-field-group">
                <label htmlFor="mce-MMERGE3">Year of Graduation </label>
                <input type="text" name="MMERGE3" id="mce-MMERGE3" />
              </div>
              <div className="mc-field-group">
                <label htmlFor="mce-MMERGE4">Major </label>
                <input type="text" name="MMERGE4" id="mce-MMERGE4" />
              </div>
              <div id="mce-responses" className="clear">
                <div
                  className="response"
                  id="mce-error-response"
                  style={{ display: "none" }}
                ></div>
                <div
                  className="response"
                  id="mce-success-response"
                  style={{ display: "none" }}
                ></div>
              </div>
              <div
                style={{ position: "absolute", left: "-5000px" }}
                aria-hidden="true"
              >
                <input
                  type="text"
                  name="b_e926ed9c6e5e27338c6e5452c_ffa7b765f8"
                  tabIndex="-1"
                />
              </div>
              <div className="clear">
                <input
                  type="submit"
                  value="Subscribe"
                  name="subscribe"
                  id="mc-embedded-subscribe"
                  className="button"
                />
              </div>
            </div>
          </form>
        </div>
      </StyledContainer>
    </>
  );
};

export default compose(
  withAuthorization(isLoggedIn),
  withFirebase
)(InterestForm);
