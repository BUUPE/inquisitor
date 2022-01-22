import React, { Fragment, memo } from "react";

import Row from "react-bootstrap/Row";

import QuestionDisplay from "./QuestionDisplay";
import { BackIcon } from "../TextDisplay";
import { Wrapper, Title, StyledButton, Text } from "../../styles/global";

const ApplicationDisplay = memo(
  ({
    uid,
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
    const classYear = responses.find((r) => r.uid === "year").value;
    const levelQuestions = levelConfig[level];
    let augmentedQuestions = [
      {
        uid: "resume",
        name: "Resume",
        order: 0,
      },
      {
        uid: "finalNotes",
        name: "Final Notes",
        order: levelQuestions.length + 1,
      },
    ];

    levelQuestions.forEach(({ uid, order }) => {
      const question = questions.find((q) => q.uid === uid);
      augmentedQuestions.push({ ...question, order: order + 1 });
    });

    const interviewers = Object.entries(interview.interviewers).map(
      ([uid, name]) => ({ uid, name })
    );

    augmentedQuestions = augmentedQuestions.map((question) => {
      const [interviewerA, interviewerB] = interviewers;
      return {
        ...question,
        interviewers: {
          [interviewerA.uid]: {
            score: interview.scores[interviewerA.uid][question.uid],
            note: interview.notes[interviewerA.uid][question.uid],
          },
          [interviewerB.uid]: {
            score: interview.scores[interviewerB.uid][question.uid],
            note: interview.notes[interviewerB.uid][question.uid],
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
          <Text
            paddingTop={"0px"}
            paddingBottom={"0px"}
            position={"left"}
            pFontSize={"15px"}
            pMaxWidth={"100%"}
            pTextAlign={"left"}
          >
            <Row>
              <h2>Application Responses</h2>
            </Row>
            <Row>
              {responses.map((response) => (
                <Response key={response.uid} {...response} />
              ))}
            </Row>
          </Text>

          <hr
            style={{ width: "100%", margin: "30px 0", background: "black" }}
          />
          {provisional ? (
            <Text
              paddingTop={"0px"}
              paddingBottom={"0px"}
              position={"left"}
              pFontSize={"15px"}
              pMaxWidth={"100%"}
              pTextAlign={"left"}
            >
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
            <Text
              paddingTop={"0px"}
              paddingBottom={"0px"}
              position={"left"}
              pFontSize={"15px"}
              pMaxWidth={"100%"}
              pTextAlign={"left"}
            >
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
                    <Fragment key={question.uid}>
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
          <Text
            paddingTop={"0px"}
            paddingBottom={"0px"}
            position={"left"}
            pFontSize={"15px"}
            pMaxWidth={"100%"}
            pTextAlign={"left"}
          >
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
              <StyledButton
                paddingTop={"0.5%"}
                paddingRight={"2%"}
                paddingBottom={"0.5%"}
                paddingLeft={"2%"}
                green
                onClick={() => voteApplicant(true)}
              >
                Accept
              </StyledButton>
              <StyledButton
                paddingTop={"0.5%"}
                paddingRight={"2%"}
                paddingBottom={"0.5%"}
                paddingLeft={"2%"}
                onClick={() => voteApplicant(false)}
              >
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
