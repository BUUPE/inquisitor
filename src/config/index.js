import Questions from './Questions';

const Overview = `Hello and welcome to the UPE interview! 

This interview will consist of math and programming questions. You have access to all the questions through this interview site. You are free to move around as you wish and the interviewer will try to gauge your progress on questions and nudge you along when needed. 

This test is meant to be very difficult and we do not expect you to solve every question correctly in only 30 minutes. Your thought process and problem solving skills are far more important than simply getting the correct answer, so be sure to clearly explain your work while solving these questions. Even if you get stuck, talk through your thought process so your interviewer knows where you are and can nudge you in the right direction.

Do not hesitate to ask for clarification of questions. You can also move on and back to questions as you please.

Please solve all questions on paper or whiteboard (pseudo-code is acceptable for programming questions).

Here is the expected time breakdown for the interview (but feel free to spend more/less time per section as you please):
- Intro: 2 minutes
- Resume Review: 5 minutes
- Math/Reasoning Questions: 8 minutes
- Coding Questions: 15 minutes`;

const InterviewerNotes = `
Read this.
`;

const Beginner = [
  Questions.timedRope,
  Questions.birthdays,
  Questions.palindrome,
  {...Questions.deathByHat, isBonus: true}
];

const Intermediate = [
  Questions.timedRope,
  Questions.birthdays,
  Questions.longestPrefix,
  Questions.stackQueue,
  {...Questions.trailingZeroes, isBonus: true}
];

const Advanced = [
  Questions.timedRope,
  Questions.clubDice,
  Questions.sumLeftLeaves,
  Questions.aiGame
];

const Grad = [
  Questions.timedRope,
  Questions.clubDice,
  Questions.numberGame,
  Questions.sumLeftLeaves,
  Questions.aiGame
];

const CONFIG = {
  Beginner,
  Intermediate,
  Advanced,
  Grad
};

export {
  Overview,
  InterviewerNotes,
  CONFIG
} ;