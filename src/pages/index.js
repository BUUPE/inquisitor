import React from "react";
import styled from "styled-components";

import {
  AuthUserContext,
  withFirebase,
} from "upe-react-components";

import SEO from "../components/SEO";
import Loader from "../components/Loader";
import WelcomeDisplay from "../components/Landing/WelcomeDisplay";
import ApplicantActionsDisplay from "../components/Landing/ApplicantActionsDisplay";
import InterviewerActionsDisplay from "../components/Landing/InterviewerActionsDisplay";

const Landing = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  p {
    max-width: 500px;
    text-align: center;
  }
`;


class IndexPage extends Component {
  _initFirebase = false;
  state = {
		loading: true,
		denyListed: false,
    generalSettings: null
  };
  static contextType = AuthUserContext;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadData();
    if (typeof window !== "undefined") {
      import("bs-custom-file-input").then((bsCustomFileInput) => {
        bsCustomFileInput.init();
      });
    }
  }
  
  loadData = async () => {
    this._initFirebase = true;
    const loadGeneralSettings = this.props.firebase
      .generalSettings()
      .get()
      .then((snapshot) => snapshot.data())
      .catch(() =>
        this.setState({
          loading: false,
        })
      );
			
    Promise.all([
      loadGeneralSettings
    ]).then((values) =>
      this.setState({
        loading: false,
        generalSettings: values[0]
      })
    );
  };
  
  render() {
		const {
      loading,
			denyListed,
      errorMsg,
      generalSettings
    } = this.state;
		
		// Data Loading
    if (loading) return <Loader />;
		
		// Not Logged In
		if (!!!this.context)
			return (
				<WelcomeDisplay 
						name={"to Inquisitor"} 
						text={"It seems that you are not logged in, if you'd like to continue into Inquisitor, please Login below with your BU account."} 
					/>
			);
			
		// Declare Display Text Variable 
		let text = "Your application is currently underway, please check below for all the available actions you can take at this time.";
		
		// UPE Member
		if (!!this.context.roles.upemember) {
			if (!!this.context.roles.recruitmentteam)
				text = "RECRUITMENT TEAM";
			else
				text = "REGULAR MEMBER";
			
			return (
				<>
					<WelcomeDisplay 
						name={this.context.name.split(" ")[0]} 
						text={text} 
					/>
					<InterviewerActionsDisplay />
				</>
			);
		}
		// Denylisted
    else if (!!this.context.roles.denyListed)
			text = "Unfortunately you are not eligible to apply to Upsilon PI Epsilon. If you think this is a mistake, or want further information on the situation, please contact our EBoard at upe@bu.edu."
		// Not Applicant
		else if (!!!this.context.roles.applicant) {
			// && Apps Closed
			if (!generalSettings.applicationsOpen)
				text = "Applications are currently closed, if you'd like to be notified once they are open please sign up for our Newsletter below."
			// && Apps Open
			else
				text = "It seems like you have yet to apply, before continuing you should do so below."
		}
	
		return (
			<>
				<WelcomeDisplay 
					name={this.context.name.split(" ")[0]} 
					text={text} 
				/>
				<ApplicantActionsDisplay />
			</>
		);
  }
}

export default withFirebase(IndexPage);
