import treeImg from './img/binaryTree.png';

const Questions = {
  timedRope: {
    title: 'Running out of Rope',
    description: 'You have two ropes lying on the floor and each rope burns in 60 minutes. How would you measure 45 minutes without touching or manipulating the rope other than burning them?',
    answer: `Notes/Hints:
- Ropes have two ends.

Solution: Burn one from two ends (gives 30 mins), while that is happening, burn another one normally. Then after 30, light other side. 30+15=45`
  },
  birthdays: {
    title: 'Birthday Bonanza',
    description: 'If you\'re in a room of 400 people, what is the likelihood that two people share the same birthday?',
    answer: `Notes/Hints:
- Only Month/Day matters.
- The converse is that everyone has a different birthday.

Solution: 1 by pigeon hole.`
  },
  deathByHat: {
    title: 'High Stakes Hats',
    description: `You are playing a game with two other people. Each player has a black or white hat put on them at random from a collection of 3 white and 2 black hats. Nobody knows the color of their own hat but is able to see the hats of the other players.

The goal of the game is to figure out the color of your own hat, but if you are wrong you are executed. Your opponents will behave logically and will not guess unless they are certain.

When the game starts you see that each opponent has a white hat. After 5 minutes nobody has said anything. What color is your hat?
`,
    answer: `Notes/Hints:
Think from your opponents shoes

Solution: By cases, either you have a white hat or black hat. If you have a black hat then each opponent would see 1w 1b. The opponents would then think, ”if I have a black then the player with the white hat would immediately know that they are white” and would quickly figure out that he must have a white hat. Since this does not happen you must also have a white hat.`
  },
  trailingZeroes: {
    title: 'Zeroed Out',
    description: 'What is the number of trailing zeros in 100! (factorial)?',
    answer: `Notes/Hints:
- What is it mean to have a trailing 0 (4*5 = 20, 8*25 = 400)

Solution: Each trailing zero can be thought of as having a 10 as a factor. So 100 is two 10s factors. A 10 is further decomposed into a 5 and a 2. So for every 5 and 2 pair in the prime factorization of a number, the number will have a trailing zero. Since 5’s are rarer than 2s in a factorial we only need to consider the number of 5s in the prime factorization of 100!. Each multiple of 5 will have a single 5, but multiples of 25 have two since 25 is 5*5. There are 20 multiples of 5 and 4 of those are multiples of 25 so there will be 20+4=24 5s in the prime factorization => 24 0s`
  },
  clubDice: {
    title: 'Club UPE',
    description: 'You are trying to get into a club. The way the club charges the entrance fee is as follows: first select either the sequence 5, 5 or 5, 6. Then repeatedly role a single dice until you get the selected sequence. You are charged $1 per roll. Which sequence should you pick?',
    answer: `Notes/Hints:
- They are not the same, what could be the difference?
- If you roll a 5 which sequence would you rather have.

Solution: 56. Consider rolling a 5 first. With 55 you win 1/6 and restart 5/6. With 56 you win 1/6, redo 1/6, and restart 4/6. It is better.`
  },
  numberGame: {
    title: 'Gambler\'s Game',
    description: 'A random number from 0 to 1 is written on a piece of paper. You and I are playing a game. We will each write down a number from 0 to 1. You win if your number is greater than mine but less than the number on the paper, otherwise I win. I will pick a number at random. What number should you choose to maximize your probability of winning?',
    answer: `Notes/Hints:
- Try assuming that you pick a value p.
- Try drawing it in 2D space.

Solution: .5. You pick p.
You win with prob p*(1-p), I will pick a number lower with p, and paper is higher with 1-p.
To maximize take derivative of p-p^2 => p=.5`
  },
  cows: {
    title: 'Cow Conundrum',
    description: 'On a farm there are 101 cows. Each cow has some number of spots at least one but can be unboundedly high. Is it always possible to find a subgroup of the cows that has a total number of spots divisible by 11.',
    answer: `Notes/Hints:
- Think about the remainder 

Solution: Yes. Mod 11 and pigeon hole principle.`
  },
  palindrome: {
    title: 'Taco Cat?',
    description: 'Write a function that checks if an input string is a palindrome.',
    answer: 'Solution: Scan forwards and backwards or use recursion.'
  },
  longestPrefix: {
    title: 'Pretty Prefix',
    description: 'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.',
    answer: 'Solution: Scan and maintain longest prefix.'
  },
  stackQueue: {
    title: 'Stack-2-Queue',
    description: `Implement a queue only using stacks.
Queue: first in first out.
Stack: first in last out.`,
    answer: 'Solution: use 2 stacks. In stack and out stack. When user wants something out of the queue, pop from the outstack. If outstack is empty, completely pop in-stack into outstack. Then pop out of at stack.'
  },
  sumLeftLeaves: {
    title: 'Leaf Me Alone!',
    description: 'Write a program that calculates the sum of all left leaf nodes of a tree. For example, the answer for the following tree would be 2 + 5 + 4 = 11.',
    answer: 'needs an answer',
    img: treeImg
  },
  slidingWindow: {
    title: 'Optimized Subarray',
    description: 'Write a program that takes as input an array and max_sum and returns the length of the longest contiguous subarray whose elements add up to less than or equal to max_sum.',
    answer: 'Solution: Sliding window, if <max add next element, if >max remove first element. Maintain variable for longest window.'
  },
  aiGame: {
    title: 'AlphaStone',
    description: `Design an AI to play the following 1v1 game:
There are X number of stones in a pile. Each turn a player can take 1 through M stones. The player who takes the last stone wins the game.`,
    answer: `Notes/Hints:
- Try starting at low numbers
- If you know how to win if its your turn with Y can you develop a strategy to get there
- Try always leaving your opponent with 0 mod Y+1

Solution: Either do recursively or with dp and keep track of winning and losing states. Or always try to get to 0 mod Y+1.`
  },
  zigZag: {
    title: 'Zigzag Traversal',
    description: 'Write a program that traverses a binary tree in a zigzag pattern. For example, the following tree would be traversed in this order: 2, 5, 7, 2, 6, 9, 4, 11, 5.',
    answer: `Notes/Hints:
- You will need to do a BFS, how can you keep track of which way to go?

Solution: Maintain a stack and a direction flag. Do BFS and for each layer flip the flag. When going left print out the elements then add them to the stack. When switching directions copy pop everything off the stack and write it and add its children to another stack.
Can also be done using 2 stacks, one when adding left child first and another for adding right child first, and you alternate when one empties.`,
    img: treeImg
  }
};

export default Questions;