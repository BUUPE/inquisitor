const Intermediate = {
  overview: 'Hello and welcome to the UPE interview! \n\nThis interview will consist of math and programming questions. You have access to all the questions through this interview site. You are free to move around as you wish and the interviewer will try to gauge your progress on questions and nudge you along when needed. \n\nThis test is meant to be very difficult and we do not expect you to solve every question correctly in only 30 minutes. Be sure to clearly explain your work while solving these questions. \n\nDo not hesitate to ask for clarification of questions. You can also move on and back to questions as you please.\n\nPlease solve all questions on paper (pseudo-code for program questions)\n\nHere is the expected time given per question\n\nIntro: 2 min\nMath/Reasoning Questions: 12 min: 3x4\nCoding Questions: 16 mins 2x8\n',
  questions: [{
    title: 'Ropes',
    description: 'You have two ropes lying on the floor and each rope burns in 60 minutes. How would you measure 45 min without touching or manipulating the rope other than burning them?',
    answer: 'Burn one from two ends (Gives 30 mins), while that is happening, burn another one normally. Then after 30, light other side. 30+15=45'
  }, {
    title: 'Birthday',
    description: 'If you\'re in a room of 400 people, what is the likelihood that two people share the same birthday?',
    answer: '1, Pigeon Hole'
  }, {
    title: 'Cows',
    description: 'On a farm there are 101 cows. Each cow has some number of spots at least one but can be unboundedly high. Is it always possible to find a sub group of the cows that has a total number of spots divisible by 11.',
    answer: 'Yes. Mod 11 and pigeon hole principle'
  }, {
    title: 'Casino',
    description: 'You are at a casino with the following simple game:\nA dice is rolled and you get $x where x is the number that comes up.\n',
    answer: '-Why is key for each question?\nAre you willing to play for $3\nAre you willing to play for $3.4\nAre you willing to play for 100x the stakes (jump around)\nAre you willing to play right now for your own money\nWhat is the highest you are willing to play for\nWhat are some reasons not to go to higher stakes\n\nEV is 3.5\nThings that should be considered:\n-Bankroll management\n-Opportunity cost/cost of variance\n'
  }, {
    title: 'Palindrome',
    description: 'Write a function that checks if an input string is a palindrome',
    answer: 'SImplest solution is to use two pointers'
  }]
};
export default Intermediate;