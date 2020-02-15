import Questions from './Questions';

const Overview = `Hello and welcome to the UPE interview! 

This interview will consist of math and programming questions. You have access to all the questions through this interview site. You are free to move around as you wish and the interviewer will try to gauge your progress on questions and nudge you along when needed. 

This test is meant to be very difficult and we do not expect you to solve every question correctly in only 45 minutes. Your thought process and problem solving skills are far more important than simply getting the correct answer, so be sure to clearly explain your work while solving these questions. Even if you get stuck, talk through your thought process so your interviewer knows where you are and can nudge you in the right direction.

Do not hesitate to ask for clarification of questions. You can also move on and back to questions as you please.

Please solve all questions on paper or whiteboard (pseudo-code is acceptable for programming questions).

Here is the expected time breakdown for the interview (but feel free to spend more/less time per section as you please):
Intro: 2 minutes
Resume Review: 5 minutes
Math/Reasoning Questions: 15 to 25 minutes
Coding Questions: 15 to 25 minutes

Lastly, please remember that these questions are confidential during the interview period. You may only share them with others next week.`;

const InterviewerNotes = `Note for Interviewers: 
Read the above section (treat it like a script).

One person should handle administering the questions, while the other pays attention to timekeeping. However, both should pay attention to the interviewee so you can both provide feedback at the end.

GENERAL GUIDELINES:
Avoid Hints unless they are really stuck, it is a big penalty since they have plenty of time
Let them solve with simple solutions for coding questions and then ask them how to do it more efficiently, ONLY MAKE THEM CODE IT ONCE
If they jump to the efficient solution (the answer), note that
At the end ask if they have any questions for you`;

const ResumeNotes = `Basics:
- Does anything stand out or catch your interest?
- Tell me about the most interesting project you worked on
- Ask about experiences on their resume
- Look for interesting skills or frameworks and ask about how they learned it and how they used it

More Advanced people:
- What are steps that you would take to extend/deploy one of your projects
- Make up a problem that might have happened in a project. Walk through how you would debug it?

If there isn’t anything technical to talk about:
- Tell me about a time you worked on a team
- Tell me about a time you overcame an unexpected challenge
- Tell me about a time when you had to prioritize your time (what did you do)

Wrap Up:
- Is there anything that isn’t on your resume that might be relevant for us? 
`;

const Beginner = [
  Questions.speedRacer,
  Questions.howOldIsShe,
  Questions.blindAsABat,
  Questions.proPunch,
  Questions.higherPowers,
  Questions.lastButLeast,
];

const Intermediate = [
  Questions.speedRacer,
  Questions.howOldIsShe,
  Questions.blindAsABat,
  Questions.aStressedDessert,
  Questions.peakedInterest,
  Questions.getAwayFromMe,
];

const Advanced = [
  Questions.speedRacer,
  Questions.howOldIsShe,
  Questions.blindAsABat,
  Questions.getAwayFromMe,
  Questions.youGotTheStones,
  Questions.calmDown,
];

const CONFIG = {
  Beginner,
  Intermediate,
  Advanced
};

export {
  Overview,
  InterviewerNotes,
  ResumeNotes,
  CONFIG
} ;