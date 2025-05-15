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

4. Design Principles
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
