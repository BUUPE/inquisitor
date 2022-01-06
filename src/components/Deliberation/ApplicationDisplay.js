import React, { Fragment, memo } from "react";
import styled from "styled-components";

import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";

import QuestionDisplay from "./QuestionDisplay";
import { BackIcon } from "../TextDisplay";

const StyledButton = styled(Button)`
  text-decoration: none;
  color: #ffffff;
  background-color: ${(props) => (props.green ? "#008000" : "#f21131")};
  border: none;
  font-size: 25px;
  font-weight: bold;
  padding: 0.5% 2% 0.5% 2%;
  &:focus,
  &:active,
  &:disabled {
    text-decoration: none;
    color: #ffffff;
    background-color: ${(props) => (props.green ? "#7FBF7F" : "#f88898")};
    border: none;
  }
  &:hover {
    text-decoration: none;
    color: #ffffff;
    background-color: ${(props) => (props.green ? "#004C00" : "#600613")};
    border: none;
  }
`;

const Wrapper = styled.div`
  padding-top: 3%;
  padding-left: 7%;
  padding-right: 7%;
  font-family: Georgia;
`;

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

const Text = styled.div`
  font-family: Georgia;
  width: 100%;
  display: flex;
  flex-direction: column;
  h2 {
    font-weight: bold;
    font-size: 35px;
    border-bottom: 2px solid #f21131;
    margin-bottom: 2%;
    font-style: italic;
  }
  h3 {
    font-weight: bold;
    font-size: 30px;
    padding-bottom: 2%;
    color: #f21131;
    font-style: italic;
  }
  h4 {
    font-weight: bold;
    font-size: 25px;
    padding-bottom: 1.5%;
    font-style: italic;
  }
  h5 {
    font-weight: bold;
    font-size: 20px;
    padding-bottom: 1.5%;
  }
  h5:after {
    content: "";
    display: block;
    width: 4%;
    padding-top: 3px;
    border-bottom: 2px solid #f21131;
  }
  p {
    font-weight: bold;
    font-size: 15px;
    padding-bottom: 1%;
  }
`;

const ApplicationDisplay = memo(
  ({
    id,
    vote,
    interview,
    responses,
    name,
    semester,
    questions,
    levelConfig,
    voteApplicant,
    provisional,
  }) => {
    const { level } = interview;
    const classYear = responses.find((r) => r.id === 5).value;
    const levelQuestions = levelConfig[level];
    let augmentedQuestions = [
      {
        id: "resume",
        name: "Resume",
        order: 0,
      },
      {
        id: "finalNotes",
        name: "Final Notes",
        order: levelQuestions.length + 1,
      },
    ];

    levelQuestions.forEach(({ id, order }) => {
      const question = questions.find((q) => q.id === id);
      augmentedQuestions.push({ ...question, order: order + 1 });
    });

    const interviewers = Object.entries(
      interview.interviewers
    ).map(([uid, name]) => ({ uid, name }));

    augmentedQuestions = augmentedQuestions.map((question) => {
      const [interviewerA, interviewerB] = interviewers;
      return {
        ...question,
        interviewers: {
          [interviewerA.uid]: {
            score: interview.scores[interviewerA.uid][question.id],
            note: interview.notes[interviewerA.uid][question.id],
          },
          [interviewerB.uid]: {
            score: interview.scores[interviewerB.uid][question.id],
            note: interview.notes[interviewerB.uid][question.id],
          },
        },
      };
    });

    const Response = ({ type, name, value }) => {
      let Content = () => <p>{value !== "" ? value : "N/A"}</p>;
      const style = {
        flexGrow: 1,
        paddingLeft: "3%",
      };

      // eslint-disable-next-line default-case
      switch (type) {
        case "file":
          style.width = "100%";
          Content = () => (
            <embed
              src={value}
              width="100%"
              height="500"
              type="application/pdf"
              title={name}
              style={{ marginBottom: "2%" }}
            />
          );
          break;
        case "textarea":
          style.width = "100%";
          break;
        case "yesno":
          Content = () => <p>{value ? "Yes" : "No"}</p>;
          break;
      }

      if (
        provisional &&
        name !== "Full Name" &&
        name !== "Email" &&
        name !== "Major" &&
        name !== "Minor" &&
        name !== "Class Year"
      )
        return null;

      return (
        <div style={style}>
          <h4>{name}</h4>
          <Content />
        </div>
      );
    };

    return (
      <>
        <BackIcon />
        <Title>
          <h1> Applicant Overview </h1>
        </Title>
        <Wrapper>
          <Text>
            <Row>
              <h2>Application Responses</h2>
            </Row>
            <Row>
              {responses.map((response) => (
                <Response key={response.id} {...response} />
              ))}
            </Row>
          </Text>

          <hr
            style={{ width: "100%", margin: "30px 0", background: "black" }}
          />
          {provisional ? (
            <Text>
              <Row
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h2>Provisional Period Status</h2>
              </Row>
              <Row
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingLeft: "3%",
                }}
              >
                <div>
                  <h4>Meeting Requirement</h4>
                  <p>{provisional.meetings ? "Completed" : "Not Completed"}</p>
                </div>
                <div>
                  <h4>Contribution Requirement</h4>
                  <p>
                    {provisional.contribution ? "Completed" : "Not Completed"}
                  </p>
                </div>
              </Row>
            </Text>
          ) : (
            <Text>
              <Row
                style={{
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h2>Interview Details</h2>
                <h2>
                  Level: <span>{interview.level}</span>
                </h2>
              </Row>
              <Row>
                {augmentedQuestions
                  .sort((a, b) => (a.order > b.order ? 1 : -1))
                  .map((question, i) => (
                    <Fragment key={question.id}>
                      <QuestionDisplay
                        level={level}
                        classYear={classYear}
                        {...question}
                      />
                      {i < augmentedQuestions.length - 1 && (
                        <hr style={{ width: "100%", margin: "30px 0" }} />
                      )}
                    </Fragment>
                  ))}
              </Row>
            </Text>
          )}

          <hr
            style={{ width: "100%", margin: "30px 0", background: "black" }}
          />
          <Text>
            <Row
              style={{
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 25,
              }}
            >
              <h2>Deliberation</h2>
              <h3 style={{ color: !!vote ? "#008000" : "#f21131" }}>
                {vote !== undefined
                  ? `You voted to ${vote ? "Accept" : "Deny"}!`
                  : "You haven't voted yet!"}
              </h3>
            </Row>
            <Row
              style={{
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 30,
              }}
            >
              <StyledButton green onClick={() => voteApplicant(true)}>
                Accept
              </StyledButton>
              <StyledButton onClick={() => voteApplicant(false)}>
                Deny
              </StyledButton>
            </Row>
          </Text>
        </Wrapper>
      </>
    );
  }
);

export default ApplicationDisplay;
