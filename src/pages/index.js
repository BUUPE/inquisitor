import React, { useContext } from "react";
import { compose } from "recompose";

import { withSettings } from "../components/API/SettingsContext";
import { AuthUserContext, withFirebase } from "upe-react-components";

import SEO from "../components/SEO";
import TextDisplay from "../components/TextDisplay";
import ApplicantActionsDisplay from "../components/Landing/ApplicantActionsDisplay";
import InterviewerActionsDisplay from "../components/Landing/InterviewerActionsDisplay";

const IndexPage = (props) => {
  const authUser = useContext(AuthUserContext);

  // Not Logged In
  if (!!!authUser)
    return (
      <>
        <SEO title="Landing" route="/" />
        <TextDisplay
          name={"Welcome to Inquisitor!"}
          text={
            "It seems that you are not logged in, if you'd like to continue into Inquisitor, please Login below with your BU account."
          }
        />
        <ApplicantActionsDisplay />
      </>
    );

  // Declare Display Text Variable
  let text =
    "Your application is currently underway, please check below for all the available actions you can take at this time.";

  // UPE Member
  if (!!authUser.roles.upemember) {
    if (!!authUser.roles.recruitmentteam)
      text =
        "Thank you for helping us run this Semester's Recruitment Season! Below you can find all the available actions you can take at this time.";
    else
      text =
        "Thank you, as always, for helping us make the final deliberations on the New Members this Semester! Below you can find all the available actions you can take at this time.";

    return (
      <>
        <SEO title="Landing" route="/" />
        <TextDisplay
          name={`Welcome ${authUser.name.split(" ")[0]}!`}
          text={text}
        />
        <InterviewerActionsDisplay />
      </>
    );
  }

  // Denylisted
  if (!!authUser.roles.denyListed)
    text =
      "Unfortunately you are not eligible to apply to Upsilon PI Epsilon. If you think this is a mistake, or want further information on the situation, please contact our EBoard at upe@bu.edu.";
  // Not Applicant
  else if (!!!authUser.roles.applicant) {
    // && Apps Closed
    if (!props.settings.applicationsOpen)
      text =
        "Applications are currently closed, if you'd like to be notified once they are open please sign up for our Newsletter below.";
    // && Apps Open
    else
      text =
        "It seems like you have yet to apply, before continuing you should do so below.";
  }

  return (
    <>
      <SEO title="Landing" route="/" />
      <TextDisplay
        name={`Welcome ${authUser.name.split(" ")[0]}!`}
        text={text}
      />
      <ApplicantActionsDisplay />
    </>
  );
};

export default compose(withSettings, withFirebase)(IndexPage);
