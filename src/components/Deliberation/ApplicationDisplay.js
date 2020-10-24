import React, { Fragment, memo } from "react";

import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";

import QuestionDisplay from "./QuestionDisplay";
import { Container } from "../../styles/global";

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
      <Container flexdirection="column">
        <Row>
          <h1>Application Responses</h1>
        </Row>
        <Row>
          {responses.map((response) => (
            <Response key={response.id} {...response} />
          ))}
        </Row>

        <hr style={{ width: "100%", margin: "30px 0", background: "black" }} />
        {provisional ? (
          <>
            <Row
              style={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <h1>Provisional Period Status</h1>
            </Row>
            <Row
              style={{ alignItems: "center", justifyContent: "space-between" }}
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
          </>
        ) : (
          <>
            <Row
              style={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <h1>Interview Details</h1>
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
          </>
        )}

        <hr style={{ width: "100%", margin: "30px 0", background: "black" }} />

        <Row
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 25,
          }}
        >
          <h1>Deliberation</h1>
          <h2>
            {vote !== undefined
              ? `You voted to ${vote ? "Accept" : "Deny"}!`
              : "You haven't voted yet!"}
          </h2>
        </Row>
        <Row
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 30,
          }}
        >
          <Button variant="success" onClick={() => voteApplicant(true)}>
            Accept
          </Button>
          <Button variant="danger" onClick={() => voteApplicant(false)}>
            Deny
          </Button>
        </Row>
      </Container>
    );
  }
);

export default ApplicationDisplay;
