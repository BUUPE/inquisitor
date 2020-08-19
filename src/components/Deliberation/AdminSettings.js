import React, { Component, Fragment } from "react";
import { compose } from "recompose";
import styled from "styled-components";

import Loader from "../Loader";
import FeedbackForm from "./FeedbackForm";
import QuestionDisplay from "./QuestionDisplay";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import {
  AuthUserContext,
  withFirebase,
  withAuthorization,
} from "upe-react-components";
import { isRecruitmentTeam } from "../../util/conditions";
import { asyncForEach } from "../../util/helper";

class AdminSettings extends Component {
  constructor(props) {
    super(props);
  }
  _initFirebase = false;
  state = {
    settings: null,
    applicationList: null,
    applicationList2: null,
    loading: true,
    error: null,
  };
  static contextType = AuthUserContext;
  unsub = null;

  componentDidMount() {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.firebase && !this._initFirebase) this.loadData();
  }

  componentWillUnmount() {
    if (typeof this.unsub === "function") this.unsub();
  }

  loadData = async () => {
    this._initFirebase = true;

    const doc = await this.props.firebase.generalSettings().get();

    if (!doc.exists) this.setState({ error: "Failed to load timeslots!" });
    else {
      const settings = doc.data();
      this.setState({ settings }, () => {
        console.log("Settings loaded");
      });
    }

    this.props.firebase
      .interviewedApplicants()
      .get()
      .then((querySnapshot) => {
        const applicationList = querySnapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        this.setState({ applicationList }, () => {
          console.log("Applicantions Loaded");
        });
      });

    this.props.firebase
      .deliberatedApplicants()
      .get()
      .then((querySnapshot) => {
        const applicationList2 = querySnapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        this.setState({ applicationList2, loading: false }, () => {
          console.log("Deliberated Applications Loaded");
        });
      });
  };

  finishDeliberation = async () => {
    this.setState({ loading: true });
    console.log("test");

    const { settings, applicationList, applicationList2 } = this.state;
    const authUser = this.context;

    const dataOne = {
      votingComplete: true,
    };

    this.props.firebase.generalSettings().set(dataOne, { merge: true });

    await asyncForEach(applicationList, async (application, index) => {
      console.log("test 2");
      const dataTwo = {
        deliberation: {
          applicantAccepted: false,
          acceptedUPE:
            application.deliberation.count.accept /
              (application.deliberation.count.accept +
                application.deliberation.count.deny) >=
            0.75,
          complete:
            application.deliberation.count.accept /
              (application.deliberation.count.accept +
                application.deliberation.count.deny) >=
            0.75,
          voted: true,
          feedback: "",
          submittedForm: false,
        },
      };

      this.props.firebase
        .application(application.id)
        .set(dataTwo, { merge: true });
    });

    console.log("test 3");
    this.loadData();
  };

  render() {
    const {
      loading,
      error,
      settings,
      applicationList,
      applicationList2,
    } = this.state;

    if (loading) return <Loader />;
    if (error)
      return (
        <Container flexdirection="column">
          <h1>{error}</h1>
        </Container>
      );

    const authUser = this.context;

    const ApplicantStatus = ({ data }) => {
      return (
        <Container>
          <br />
          <hr />
          <Row>
            <Col>
              <h3> {data.applicant.name} </h3>
            </Col>
          </Row>
          <br />
          <Row>
            <Col>
              <h4> Positive Votes </h4>
              <p> {data.deliberation.count.accept} </p>
            </Col>
            <Col>
              <h4> Negative Votes </h4>
              <p> {data.deliberation.count.deny} </p>
            </Col>
          </Row>
          <Row>
            <Col>
              <h4> Status </h4>
              <p>
                {data.deliberation.count.accept /
                  (data.deliberation.count.accept +
                    data.deliberation.count.deny) >=
                0.75
                  ? "Accepted"
                  : "Not Accepted"}
              </p>
            </Col>
          </Row>
        </Container>
      );
    };

    const applications = (
      <Container>
        <Row>
          <Col>
            {applicationList.map((application) => (
              <ApplicantStatus key={application.id} data={application} />
            ))}
            <Container>
              <Row>
                <Col>
                  <hr />
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
      </Container>
    );

    const applicationStatus = (
      <>
        <Container>
          <Row>
            <Col>
              <h2> Current Status </h2>
            </Col>
          </Row>
          <Row>{applications}</Row>
        </Container>
        <br />
        <Container>
          <Row>
            <Col>
              <Button onClick={this.finishDeliberation}>
                Finish Deliberation
              </Button>
            </Col>
          </Row>
        </Container>
      </>
    );

    const FeedbackFormBase = ({ data }) => {
      console.log(data.id);
      return <FeedbackForm data={data.id} />;
    };

    const feedbackFormList = (
      <Container>
        <Row>
          <Col>
            {applicationList2.map((application) => (
              <Fragment key={application.id}>
                {application.deliberation.acceptedUPE ? (
                  <> </>
                ) : (
                  <FeedbackFormBase data={application} />
                )}
              </Fragment>
            ))}
          </Col>
        </Row>
      </Container>
    );

    const feedbackForms = (
      <>
        <Container>
          <Row>
            <Col>
              <h2> Feedback Forms </h2>
            </Col>
          </Row>
          <Row>{!!applicationList2 ? feedbackFormList : <> </>}</Row>
        </Container>
      </>
    );

    return <>{settings.votingComplete ? feedbackForms : applicationStatus}</>;
  }
}

export default compose(withFirebase)(AdminSettings);
