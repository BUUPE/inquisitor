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

const InterviewerNotes = `Note for Interviewers: 
Read the above section (treat it like a script).

One person should handle administering the questions, while the other pays attention to timekeeping. However, both should pay attention to the interviewee so you can both provide feedback at the end.

For the resume review section, ask about their most recent work experience or project they are most proud of (choose based on what you see on the resume). Point out anything you find interesting/stands out.

For bonus questions, even if they don't get to it/don't have time, write down that they didn't reach it and put a score of 1 (just to keep it standardized among interviews).`;

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
  Questions.slidingWindow,
  Questions.aiGame,
  {...Questions.cows, isBonus: true}
];

const Grad = [
  Questions.timedRope,
  Questions.clubDice,
  Questions.numberGame,
  Questions.zigZag,
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