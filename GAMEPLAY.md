# QwiZ Gameplay

## Quizmaster
The quizmaster is responsible for:
1. Preparing the quiz questions and answers (or asking each player to add some during wait for game start). 
2. Providing the link or code to join a quiz to players (simply share the join link or the screen - so everybody can use the QR code on the admin screen).

## Players
1. **No Cheating**: The Online research or asking people not part of the player group is not allowed.
2. **Quiet During Questions**: players should remain quiet while questions are being read.
3. **Time Limit**: Each round typically has a set time limit for answering questions.
4. **Create Questions:** You can create own questions during wait for game start, if the game master asks you too. But do only add the amount of questions you have been asked for - such that all players have same amount of known questions and answers to keep it fair.

## Quiz creation
1. The quizmaster creates a quiz with a set of questions and answers.
   1. The quizmaster can create a quiz with multiple rounds.
   2. The quizmaster can create a quiz with multiple questions per round.
   3. The quizmaster can create a quiz with multiple answers per question.
   4. The quizmaster can set a time limit for each question.
2. The quizmaster can set a maximum number of players
   1. The quizmaster can adjust the maximum number of players using a slider on the admin page.
   2. The slider allows selecting up to 200 players in steps of 10.
   3. The maximum number of players can only be adjusted before the quiz has started.
   4. The maximum number of players cannot be set lower than the current number of players.
3. The quizmaster can submit the quiz to the server.
4. The quizmaster can start the quiz.
5. The quizmaster can end the quiz.
6. The quizmaster can view the results of the quiz.
7. The quizmaster can view the leaderboard of the quiz.
8. The quizmaster can view the answers of the players.
9. The quizmaster can view the questions of the players.
10. The quizmaster can view the scores of the players.
11. Every quiz has a unique ID.
12. The quizmaster can view the quiz ID.
13. This ID is used to identify the quiz. This ID can be sent to players to join the quiz.
14. The quizmaster can view the quiz link.

## Joining a quiz
1. A player can join a quiz with the unique ID provided by the quizmaster.
2. A player can join a quiz with the link provided by the quizmaster.
3. As a first step, a player has to choose a player name. The player name has to be unique per quiz.
4. As long as the quiz is not started, a player can change the player name.
5. As long as the quiz is not started, a player can leave the quiz.
6. As long as the quiz is not started, a player can join the quiz.
7. As long as the quiz is not started, a player can contribute own questions.

## Running a quiz as a quizmaster
1. The quizmaster can start a quiz.
2. The questions will be presented to the players.
3. Once all players have answered the question, the quizmaster can see the answers of all players.
4. If all players have answered, the quiz advances to the next question.
5. If all questions are answered, the quizmaster can end the quiz and see the ranking.

## Running a quiz as a player
1. A player sees the current question and can submit an answer.
2. Once an answer is submitted, the answer cannot be changed.
3. Before a player sees the next question, the player sees a countdown.
4. After every round, every player can see the ranking.

## Scoring System
1. Points are only awarded for correct answers.
2. The point calculation is based on how quickly a player answers a question:
   1. Maximum points (100) are awarded when answering immediately.
   2. Minimum points (1) are awarded when answering at the last moment.
   3. Points are linearly distributed based on the percentage of time left when answering.
   4. The formula is: `points = percentageTimeLeft * 100`, where `percentageTimeLeft = 1.0 - (answerTimeMs / totalTimeMs)`.
3. Incorrect answers receive 0 points.
4. A player's total score is the sum of points earned across all questions.
