# KwiZ Project Development Guidelines

## 1. Tech Stack
- **Backend**: 
  - Java 21+ with Spring Boot
  - All backend code must be compatible with Java 21 features
- **Frontend**: 
  - Angular 19 with TypeScript and Scss
  - Follow Angular best practices for component structure

## 2. Communication Between Frontend & Backend
- **WebSockets**: 
  - Use for real-time or frequent interactions
  - Examples: game state updates, player actions, timer updates
- **REST API**: 
  - Use only when WebSockets are not suitable
  - Examples: quiz creation, user registration, static data retrieval
- **Type Safety**:
  - All communication must be type-safe
  - Follow OpenAPI or shared contract principles
  - Define clear DTOs for data transfer

## 3. Development Practices
- **Test-Driven Development (TDD)**:
  - Write tests BEFORE implementing features
  - Follow this sequence: 1) Write test, 2) Run test (it should fail), 3) Implement feature, 4) Run test again (it should pass)
  - All business logic must have unit test coverage
- **Testing Types**:
  - **Backend**: Unit tests for all business logic
  - **Frontend**: Component tests for Angular components
  - **System-wide**: Integration tests for end-to-end functionality

## 4. Software Design Principles
- **Domain-Driven Design (DDD)**:
  - **Aggregates**: Define clear aggregate roots (e.g., Quiz, Game)
  - **Entities**: Objects with identity (e.g., Player, Question)
  - **Value Objects**: Immutable objects without identity (e.g., Answer)
  - **Repositories**: Data access objects for aggregates
  - Business logic must reside ONLY in the domain layer
- **Clean Code**:
  - Code should be readable, maintainable, and minimal
  - Use meaningful variable and method names
  - Keep methods short and focused on a single responsibility
- **Clean Architecture**:
  - **Layers**: 
    - Domain (core business logic)
    - Application (use cases, orchestration)
    - Infrastructure (external services, persistence)
    - Interface (controllers, presenters)
  - No dependencies from inner layers to outer layers
  - No cross-dependencies that violate architectural boundaries

## 5. Specifications
- **Requirements Compliance**:
  - All features must comply with requirements in GAMEPLAY.md
  - Read GAMEPLAY.md thoroughly before implementation
- **Ambiguity Handling**:
  - If a specification is ambiguous or incomplete, ask clarifying questions BEFORE implementation
  - Do not make assumptions without explicit confirmation
- **Documentation Updates**:
  - If implementation differs from specification, update GAMEPLAY.md to reflect actual implementation
  - Keep documentation and code in sync at all times

## 6. Project Structure
- **Backend Structure**:
  - Package by domain, NOT by technical layer
  - Example: `ch.zuhlke.camp.kwiz.domain`, `ch.zuhlke.camp.kwiz.application`
  - Each domain should be self-contained with minimal dependencies
- **Frontend Structure**:
  - Use feature-based module organization
  - Example: QuizCreation, GamePlay, PlayerManagement modules

## 7. AI-Specific Instructions
- **Methodical Approach**:
  - Think step-by-step through each problem
  - Break complex tasks into smaller, manageable subtasks
- **Implementation Order**:
  - When generating multiple classes, start with domain models first
  - Then implement services, controllers, and UI components
- **Optimization Strategy**:
  - Avoid premature optimization
  - Focus on correctness first, then improve performance if needed
- **Development Mode**:
  - Always assume junior developer mode:
    - Clarify edge cases explicitly
    - Document all assumptions
    - Focus on correctness over brevity
    - Provide explanatory comments for complex logic

## 8. Architecture
- **State Management**:
  - The game state is only held in memory without persistence
  - No database is used for storing game state
  - Consider implications for error recovery and session management

## 9. UI Design
- **Visual Style**:
  - UI must be cool, modern, and stylish
  - Follow existing design patterns from the landing home page
- **Consistency**:
  - All new UI components must match existing components in style
  - Use the same color scheme, typography, and component designs
- **Responsiveness**:
  - UI must adapt to different screen sizes
  - Game screens must work well on mobile devices
  - Test layouts on both desktop and mobile viewports

## 10. Glossary
- **Quiz**: A collection of rounds containing questions that players answer to earn points.
- **Quizmaster**: The person responsible for creating and managing the quiz, including preparing questions, starting the quiz, and overseeing the gameplay.
- **Player**: A participant in the quiz who answers questions to earn points.
- **Round**: A segment of the quiz containing a set of related questions.
- **Question**: A prompt presented to players that requires an answer.
- **Answer**: The response provided by a player to a question.
- **Game**: An instance of a quiz being played, with specific players and a current state.
- **GameEngine**: The core component that processes game logic, validates answers, and calculates scores.
- **GameStatus**: The current state of a game (e.g., WAITING, IN_PROGRESS, COMPLETED).
- **Quiz ID**: A unique identifier for a specific quiz that players use to join.
- **Leaderboard**: A display showing the ranking of players based on their scores.
- **Score**: The points accumulated by a player for correct answers.
- **Timer**: A countdown mechanism that limits the time available to answer questions.

## 11. Definition of Done
When completing any task, perform these verification steps:

1. **Documentation Consistency**:
   - Check if implementation matches GAMEPLAY.md
   - If different, update GAMEPLAY.md to reflect actual implementation

2. **Test Coverage**:
   - Ensure new functionality has test coverage
   - Backend: Unit tests for business logic
   - Frontend: Component tests for UI elements

3. **Quality Verification**:
   - Run all tests to ensure they pass
   - Backend: `./gradlew test`
   - Frontend: Navigate to frontend folder and run `npm test`

4. **Build Verification**:
   - Ensure no compile errors
   - Ensure no test failures
   - Backend: `./gradlew build`
   - Frontend: `npm run build`
