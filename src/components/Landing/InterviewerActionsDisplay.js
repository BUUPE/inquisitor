import React, { Component } from "react";
import styled from "styled-components";
import { navigate } from "gatsby"

import Row from "react-bootstrap/Row";

import ActionCard from "../Landing/ActionCard";

import {
  AuthUserContext,
  withFirebase,
} from "upe-react-components";

const Title = styled.div`
	padding-left: 5%;
	h1 {
		font-family: Georgia;
		font-size: 50px;
		font-style: italic;
	}
	h1:after {
		content: "";
		display: block;
		width: 4%;
		padding-top: 3px;
		border-bottom: 2px solid #f21131;
  }
`;

const Cards = styled.div`
  padding-top: 80px;
  padding-bottom: 100px;
	padding-left: 15%;
	padding-right: 15%;
`;

class InterviewerActionsDisplay extends Component {
	_initFirebase = false;
  state = {
		loading: true,
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
	
	navigateTo = (page) => {
		navigate(page);
	}
	
	render() {
		return (
			<>
				<Title> 
					<h1> Actions </h1> 
				</Title>
				<Cards>
					<Row lg={2} md={2} sm={1} xl={2} xs={1} style={{alignItems: "center", justifyContent: "center"}}>
						<ActionCard title={"Admin Panel"} text={"Click the link below to access the Admin Panel"} onclick={() => this.navigateTo("/admin/")}/>
						<ActionCard title={"Select Timeslots"} text={"Click the link below to select your Interview Timeslots"} onclick={() => this.navigateTo("/timeslots/")}/>
						<ActionCard title={"Access Deliberations"} text={"Click the link below to vote on New Member Deliberations"} onclick={() => this.navigateTo("/deliberation/")}/>
					</Row>
				</Cards>
			</>
		);
	}
}
export default withFirebase(InterviewerActionsDisplay);