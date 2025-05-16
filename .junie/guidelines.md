1. Tech Stack
* Backend: Java 21+ with Spring Boot 
* Frontend: Angular 19 with TypeScript and Scss

2. Communication Between Frontend & Backend 
* Use WebSockets for real-time or frequent interactions. 
* Use REST only when WebSockets are not suitable (e.g., for simple, infrequent or stateless requests). 
* All communication must be type-safe and follow OpenAPI or shared contract principles.

3. Development Practices
* Follow Test-Driven Development (TDD) strictly:
  * Write tests before implementing features. 
  * All business logic must be covered by unit tests. 
* Use integration tests for system-wide behavior.

4. Software Design Principles
* Apply Domain-Driven Design (DDD):
  * Define Aggregates, Entities, Value Objects, and Repositories clearly. 
  * Business logic resides only in the domain layer. 
* Adhere to Clean Code principles:
  * Code should be readable, maintainable, and minimal. 
* Follow Clean Architecture:
  * Separate domain, application, infrastructure, and interface layers. 
  * No cross-dependencies that violate architectural boundaries.

5. Specifications
* All features must comply with requirements in GAMEPLAY.md. 
* If a specification is ambiguous or incomplete, ask clarifying questions before implementation.

6. Project Structure Expectations
* Backend:
  * Package by domain, not by technical layer. 
  * Each domain should be self-contained. 
* Frontend:
  * Use feature-based module structure.

7. AI-Specific Instructions
* Think step-by-step. 
* If generating multiple classes, start with domain models first. 
* Avoid premature optimization. 
* Always assume junior developer mode: clarify edge cases, document assumptions, and focus on correctness over brevity.

8. Architecture
* The game state is only held in memory without persistency

9. UI Design
* The UI design should be cool, modern and stylish
* The UI Design must be consistent, same design as on the landing home page
* All new UI components should be styled as other existing components in the project.
* The UI must be responsive and adapt to different screen sizes.
* The game screens must work well on a mobile screen

10. Glossary
* **Quiz**: A collection of rounds containing questions that players answer to earn points.
* **Quizmaster**: The person responsible for creating and managing the quiz, including preparing questions, starting the quiz, and overseeing the gameplay.
* **Player**: A participant in the quiz who answers questions to earn points.
* **Round**: A segment of the quiz containing a set of related questions.
* **Question**: A prompt presented to players that requires an answer.
* **Answer**: The response provided by a player to a question.
* **Game**: An instance of a quiz being played, with specific players and a current state.
* **GameEngine**: The core component that processes game logic, validates answers, and calculates scores.
* **GameStatus**: The current state of a game (e.g., WAITING, IN_PROGRESS, COMPLETED).
* **Quiz ID**: A unique identifier for a specific quiz that players use to join.
* **Leaderboard**: A display showing the ranking of players based on their scores.
* **Score**: The points accumulated by a player for correct answers.
* **Timer**: A countdown mechanism that limits the time available to answer questions.
