import openSocket from "socket.io-client";
const socket = openSocket();

const isIdAvailable = (firebase, interviewId) => {
  return firebase
    .interview(interviewId)
    .get()
    .then((doc) => {
      let available = false;
      const interview = doc.data();
      if (interview === undefined || interview === null) {
        available = true;
      }
      return available;
    });
};

const initializeInterview = (firebase, interviewId, interviewData) => {
  return firebase.interview(interviewId).set(interviewData);
};

const isInterviewOpen = (firebase, interviewId) => {
  return isIdAvailable(firebase, interviewId).then((available) => {
    if (available) {
      return false;
    } else {
      return firebase
        .interview(interviewId)
        .get()
        .then((doc) => {
          const interview = doc.data();
          return interview.open;
        });
    }
  });
};

const getInterviewData = (firebase, interviewId) =>
  firebase
    .interview(interviewId)
    .get()
    .then((doc) => doc.data());

const getInterviewNotes = (firebase, interviewId) =>
  firebase
    .interviewNotes(interviewId)
    .get()
    .then((doc) => doc.data());

const saveQuestionNotes = (
  firebase,
  { interviewId, problemNum, notes, score }
) => {
  const data = {};
  data[`problem-${problemNum}`] = { notes, score };
  return firebase.interviewNotes(interviewId).set(data, { merge: true });
};

const saveComments = (firebase, { interviewId, dataKey, notes }) => {
  const data = {};
  data[dataKey] = { notes };
  return firebase.interviewNotes(interviewId).set(data, { merge: true });
};

const saveFinalComments = (
  firebase,
  { interviewId, dataKey, notes, interviewer1Score, interviewer2Score }
) => {
  const data = {};
  data[dataKey] = { notes, interviewer1Score, interviewer2Score };
  return firebase.interviewNotes(interviewId).set(data, { merge: true });
};

const closeInterview = (firebase, interviewId) => {
  return firebase
    .interview(interviewId)
    .set({ open: false }, { merge: true })
    .then(() => {
      socket.emit("interviewClosed", interviewId);
      return true;
    });
};

const joinInterview = (
  interviewId,
  confirmationCB,
  notificationCB,
  closedCB
) => {
  socket.emit("joinInterview", interviewId);
  socket.on("joinConfirmation", () => confirmationCB());
  socket.on("joinNotification", () => notificationCB());
  socket.on("interviewClosed", () => closedCB());
};

const emitProblemChange = (interviewId, problemKey) =>
  socket.emit("problemChange", { interviewId, problemKey });

const subscribeToProblemChange = (callback) =>
  socket.on("problemChange", (problemKey) => callback(problemKey));

export {
  isIdAvailable,
  initializeInterview,
  isInterviewOpen,
  joinInterview,
  getInterviewData,
  getInterviewNotes,
  emitProblemChange,
  subscribeToProblemChange,
  saveQuestionNotes,
  saveComments,
  saveFinalComments,
  closeInterview,
};
