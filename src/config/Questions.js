import leftLeavesImg from './img/leftLeaves.png';

const Questions = {
  timedRope: {
    title: 'Timing with Rope',
    description: 'You have two ropes lying on the floor and each rope burns in 60 minutes. How would you measure 45 minutes without touching or manipulating the ropes other than burning them?',
    answer: 'Burn one from two ends (gives 30 mins), while that is happening, burn another one normally. Then after 30 minutes, light other side of remaining rope. 30+15=45'
  },
  birthdays: {
    title: 'Shared Birthdays',
    description: 'If you\'re in a room of 400 people, what is the likelihood that two people share the same birthday?',
    answer: `Notes/hints:
- Only Month/Day matters
- A success would be if two people were born on 3/20

Answer: 100%. Pigeon Hole principle (365 days, 400 people).
`
  },
  deathByHat: {
    title: 'High Stakes Hats',
    description: 'You are playing a game with two other people, each person has a black or white hat put on them at random from a collection of 3 white and 2 black hats. Nobody knows the color of their hat and can see the color of the hat of the other two players. The goal of the game is to figure out the color of your own hat, if you are wrong you are executed. You know that each of your opponents will behave logically and will not guess unless they are certain. You see that each opponent has a white hat. After 5 minutes nobody has said anything. What color is your hat?',
    answer: 'White. Logic it out'
  },
  trailingZeroes: {
    title: 'This needs a good name',
    description: 'What is the number of trailing zeros in 100! (factorial)?',
    answer: 'this needs an answer'
  },
  clubDice: {
    title: 'Club UPE',
    description: 'You are trying to get into a club. The way the club charges the entrance fee is as follows: first select either the sequence 5, 5 or 5, 6. Then repeatedly role a single dice until you get the selected sequence. You are charged $1 per roll. Which sequence should you pick?',
    answer: '5 6 is better as you have more chances'
  },
  numberGame: {
    title: 'needs a title',
    description: 'A random number from 0 to 1 is written on a piece of paper. You and I are playing a game. We will each write down a number from 0 to 1. You win if your number is greater than mine but less than the number on the paper, otherwise I win. I will pick a number at random. What number should you choose to maximize your probability of winning?',
    answer: 'needs an answer'
  },
  palindrome: {
    title: 'Palindrome Checker',
    description: 'Write a function that checks if an input string is a palindrome.',
    answer: 'Simplest solution is to use two pointers. Can also be done recursively, etc.'
  },
  longestPrefix: {
    title: 'Longest Commong Prefix',
    description: `Write a function to find the longest common prefix string amongst an array of strings.
If there is no common prefix, return an empty string: ""`,
    answer: 'answer needed'
  },
  stackQueue: {
    title: 'I heard you like data structures...',
    description: 'Implement a queue, only using stacks.',
    answer: 'Use 2 stacks, one for in, and one for out. When popping from the "queue", flush in stack into out stack.'
  },
  sumLeftLeaves: {
    title: 'Summing Left Leaves',
    description: 'Write a program that calculates the sum of all left leaf nodes of a tree. For example, the answer for the following tree would be 2 + 5 + 4 = 11.',
    answer: 'needs an answer',
    img: leftLeavesImg
  },
  aiGame: {
    title: 'AlphaStone',
    description: `Design an AI to play the following 1v1 game:
There are X number of stones in a pile. Each turn a player can take 1 through M stones. The player who takes the last stone wins the game.`,
    answer: 'needs an answer'
  }
};

export default Questions;