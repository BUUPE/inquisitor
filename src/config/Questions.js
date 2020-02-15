import treeImg from './img/binaryTree.png';
import diameterBinaryTree from './img/Diameter-of-Binary-Tree.png';

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
    answer: 'Solution: Scan and maintain longest prefix. A more efficient solution would be to sort the array and then find longest common prefix between first and last string.'
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
  },
  speedRacer: {
    title: 'Speed Racer',
    description: `In a competition with 25 racers, what is the minimum number of races needed to identify the 3 fastest racers? The track can only race 5 people at a time and you do not have a way to measure time.`,
    answer: `Hints:
- Try drawing the “heats”
- Who can you eliminate?

Answer:
5+1+1 = 7
Race in groups of 5
Race the winners (Find out who is first)
Race 2nd and 3rd from the winners, 2nd and 3rd from 1st overall’s initial race and 2nd from 2nd of the winners initial race
Visually, you need to race the 5 bracketed people after the first 6 races:
 1  [2] [3] 4 5
[1] [2]  3 4 5
[1]  2   3 4 5
 1   2   3 4 5
 1   2   3 4 5`
  },
  howOldIsShe: {
    title: 'How Old is She?',
    description: `Two neighbors are chatting.
Neighbor A asks, "What are the ages of your three daughters?"
Neighbor B replies that the product of their ages is 36.
Neighbor A can't figure it out and asks for a hint.
Neighbor B says that the sum of their ages is your house number.
Neighbor A still can't figure it out and asks for another hint.
Neighbor B says that the youngest has blue eyes. 
Now, Neighbor A knows their ages.
What is the youngest daughter’s age?`,
    answer: `Hints:
- Each clue has some information
- Not knowing after the second hint is important
- What are all the possibilities

Answer:
1
After knowing they multiply to 36 this is all the possibilities:
1,1,36 => 38
1,2,18 => 21
1,3,12 => 16
1,4,9 => 14
1,6,6 => 13
2,2,9 => 13
2,3,6 => 11
3,3,4 => 10
Notice that if his house number was anything other than 13, he would know the answer after the second hint.
Since there is a youngest daughter, it must be 1,6,6`
  },
  blindAsABat: {
    title: 'Blind as a Bat',
    description: `You walk into a dark room with a table of quarters on it. There are exactly 25 heads up quarters and 75 tails up quarters, but you can’t see which are which. Your goal is to split the quarters into two groups where each group has the exact same number of heads up quarters. You can only flip coins and move them into groups. How do you do it and why?`,
    answer: `Hints:
- The groups don’t need to be the same size and there can be a new number of heads
- You have to do 2 things, divide the coins and flip some over
- Try with 1 coin heads and 99 tails
- What are some logical divisions of the coins (50,50 and 1,99 are reasonable)
- If its 1 and 99 what can you flip?

Answer:
Divide into 2 groups, 25 and 75
Flip all the coins in the 25
In the 25 there are x heads and therefore in the 75 there are 25-x heads
If we flip the 25 there are 25-x heads in the left pile. Thus, both groups have the same number of heads`
  },
  proPunch: {
    title: 'Pro Punch',
    description: `100 people are sitting around a table. All of a sudden, everyone randomly either punches the person to the left or right. How many people are expected to be punched?`,
    answer: `Hints:
- Focus on the individual

Answer:
75
Each person has a .5*.5 = .25 chance of not getting punched
By linearity of expectation we can then say that 25 people wont get punched and thus 75 people get punched

Follow up:
Is the fact that it’s not independent matter? [no linearity of expectation]`
  },
  higherPowers: {
    title: 'Higher Powers',
    description: `Write a program to check if an input number is a perfect power of 2.`,
    answer: `Hints:
- What is a power of 2 (2*2*2….), try reversing that

Answer:
Either take log (If they do this, ask for recursive solution)
Or
Divide by 2 repeatedly, if you reach 1 it works, if any number is odd, other than 1 then it failed`
  },
  lastButLeast: {
    title: 'Last but Least',
    description: `Write a program to find the 3 smallest numbers in an array.`,
    answer: `Hints: 
- What information do you need to keep track of and how do you update it

Answer:
Iterate over the array and store the 3 smallest values
When a number is smaller than all of them => Shift 1 to 2 and 2 to 3 and replace 1
When a number is smaller than 2nd and 3rd => Shift 2 to 3 and replace 2
When a number is smaller than 3rd => replace 3

Follow Ups:
Running time: [This solution is O(N)]`
  },
  aStressedDessert: {
    title: 'A Stressed Dessert',
    description: `Write a program to check whether two input strings are anagrams of one another.`,
    answer: `Hints: 
- How could you tell if two strings are anagrams? (all the same letters)
- Dictionary or HashTable

Answer:
Convert the first string to hashtable letter:count
Iterate over second string and subtract from first hashtable, if any letter reaches -1 then return false.
Then repeat vicaversa

Follow Ups:
Running time: [This solution is O(N)]`
  },
  getAwayFromMe: {
    title: 'Get Away From Me',
    description: `Find the diameter of a binary tree. The diameter is defined as the longest path between any two nodes. For example:`,
    answer: `Hints:
- Notice that it must be between two leaf nodes
- Traverse the tree

Answer:
Recursive solution,
Function for each node that returns its height and max diameter
Height is max of left and right height +1
Diameter is max(left diameter, right diameter, and left height+right height + 1)
Follow Ups:
What kind of traversal are you doing: postorder traversal [Left, Right, Itself]
Running time: [This solution is O(N)]`,
    img: diameterBinaryTree
  },
  youGotTheStones: {
    title: 'You got the Stones?',
    description: `In a game, there is a pile of n stones and 2 players. Each turn a player can take 1, 2, or 3 stones from the pile. The game ends when no stones remain. Write a program to count the total number of different games that can occur.`,
    answer: `Hints:
- Think about it recursively

Answer:
Dynamic Programming
1 has 1 way
2 has 2 ways
3 has 4 ways
For loop 4 to n
Answer[i] = answer[i-1]+answer[i-2]+answer[i-3]`
  },
  calmDown: {
    title: 'Calm Down',
    description: `A relaxing number is one where adjacent digits are within 2 of one another. For example, 246, 424, and 123 are relaxing while 219 is not. Write a program to find all relaxing numbers between two input numbers.`,
    answer: `Hints:
- Brute force?
- How can you generate new numbers from old numbers

Answer:
Think about it as a queue system
If you have a relaxed number like 124, we can also create 125,126,122,121 from it
This lets us generate all such numbers efficiently and just have to check that they are within the bound
Start with each of the digits in the queue, create their “offspring” and add them to the queue if they are within the bound.`
  },
  peakedInterest: {
    title: 'Peaked Interest',
    description: `Given a list of elements, find a peak element. A peak element is one where the adjacent elements are both smaller.`,
    answer: `Hints:
- They better get the naive solution
- Check follow ups
- First/last digit can be a peak

Answer:
Use binary search
Check middle element, if it is a peak then return it
If one is bigger than check that half
O(Log(N))

Follow ups:
Can they do it faster than N (If they didn't)
Can it be faster?
What’s the worst case scenario`
  }
};

export default Questions;