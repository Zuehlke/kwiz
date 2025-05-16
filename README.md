# KwiZ - The Zühlke Pub Quiz

## Introduction
A pub quiz is a quiz held in a pub or bar. These quizzes are popular social events that combine knowledge testing with a fun, relaxed atmosphere. This document outlines the basic rules for running and participating in a pub quiz.

## General Rules
1. **Participants**: Individual players participate in the quiz
2. **No Cheating**: The Online research or asking people not part of the participant group is not allowed.
3. **Quiet During Questions**: Participants should remain quiet while questions are being read.
4. **Time Limit**: Each round typically has a set time limit for answering questions.

## Player Registration
1. Choose a unique player name.
2. Register with the quiz master before the quiz begins.

## Scoring
1. Each correct answer is typically worth one point.
2. Some questions may be worth more points if they are particularly difficult.
3. The player with the highest total score at the end of all rounds wins.
4. In case of a tie, a tie-breaker question will be used to determine the winner.

## Rounds
A typical pub quiz consists of several rounds, which may include:
1. **General Knowledge**: Questions covering a wide range of topics.
2. **Music**: Identifying songs, artists, or lyrics.
3. **Picture Round**: Identifying images, celebrities, landmarks, etc.
4. **Sports**: Questions related to various sports and sporting events.
5. **History**: Questions about historical events, figures, and periods.
6. **Science and Nature**: Questions about scientific facts, discoveries, and natural phenomena.
7. **Entertainment**: Questions about movies, TV shows, books, etc.

## Etiquette
1. Be respectful to the quiz master and other participants.
2. Keep your answers and discussions quiet to avoid giving away answers to other players.
3. Accept the quiz master's decision as final.
4. Have fun! The primary purpose of a pub quiz is entertainment.

Remember, the main goal of a pub quiz is to have fun while testing your knowledge in a social setting!

## Development Setup

### Prerequisites
- Java 21 or higher
- Node.js and npm
- Angular CLI (`npm install -g @angular/cli`)

### Starting the Backend
1. Navigate to the project root directory
2. Run the Spring Boot application:
   ```
   ./gradlew bootRun
   ```
3. The backend will start on http://localhost:8080
4. Access the API documentation at http://localhost:8080/swagger-ui.html

### Starting the Frontend
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies (first time only):
   ```
   npm install
   ```
3. Start the Angular development server:
   ```
   npm start
   ```
4. A browser window will automatically open to the application
5. The frontend will be available at http://localhost:4200

The frontend is configured with a proxy to the backend, so API calls will be automatically forwarded to the backend server.

## API Documentation

The KwiZ application uses Swagger UI for API documentation. Swagger UI provides an interactive interface to explore and test the API endpoints.

### Accessing Swagger UI

1. Start the backend application as described in the "Starting the Backend" section
2. Open your browser and navigate to: http://localhost:8080/swagger-ui.html

### Benefits of Swagger UI

- **Interactive Documentation**: Explore API endpoints with an interactive UI
- **Request Testing**: Test API requests directly from the browser
- **Response Visualization**: See the structure of API responses
- **Parameter Information**: Understand required and optional parameters for each endpoint

This is particularly useful for both backend and frontend developers to understand the available services and how to interact with them.

## Actuator Endpoints

Spring Boot Actuator provides production-ready features to help monitor and manage the application. The KwiZ application has the following actuator endpoints enabled:

### Accessing Actuator Endpoints

All actuator endpoints are available under the base path: http://localhost:8080/actuator

### Available Endpoints

- **Health**: http://localhost:8080/actuator/health
  - Provides information about the application's health
  - Shows detailed health information including disk space, database status, etc.
  - Useful for monitoring systems to check if the application is running properly

- **Info**: http://localhost:8080/actuator/info
  - Provides general information about the application
  - Shows application metadata like version, description, etc.

- **Game State**: http://localhost:8080/actuator/gamestate
  - Custom endpoint that provides comprehensive information about the game state
  - Shows all quizzes, rounds, questions, and players in the system
  - Useful for debugging and monitoring the application state

### Using Actuator Endpoints

Actuator endpoints return JSON responses that can be viewed in a browser or consumed by monitoring tools. For example:

```bash
# Get application health information
curl http://localhost:8080/actuator/health

# Get application information
curl http://localhost:8080/actuator/info

# Get game state information
curl http://localhost:8080/actuator/gamestate
```

These endpoints are particularly useful for operations teams to monitor the application's health and state in production environments.

## Release and Deployment Process

The KwiZ application follows a streamlined release and deployment process that ensures consistent delivery from development to production.

### Frontend Integration

- The frontend is built and served by the Spring Boot JAR as a static resource
- During the build process, the Angular frontend is compiled and then copied into the Spring Boot static resources directory
- This integration is handled by Gradle tasks:
  - `buildFrontend`: Builds the Angular application
  - `copyFrontendToBuild`: Copies the built frontend into `build/resources/main/web`
  - These tasks run automatically as part of the main build process

### Continuous Deployment

- A GitHub Action automatically deploys the application to Azure Cloud on every commit to the main branch
- The workflow is defined in `.github/workflows/main_kwiz.yml`
- The deployment process:
  1. Builds the application using Gradle
  2. Copies the JAR file to `build/release/kwiz.jar` (without version number)
  3. Uploads the JAR as an artifact
  4. Deploys the JAR to Azure Web App in the Production slot

### Local Testing

- The "Test Release Jar" run configuration can be used to test the release JAR locally
- This configuration:
  - Uses the JAR file from `build/release/kwiz.jar`
  - Sets the working directory to the project root
  - Uses Azul JDK 21 as the runtime environment
- To use this configuration:
  1. Build the project with `./gradlew build` to generate the release JAR
  2. Run the "Test Release Jar" configuration from your IDE

### Production Environment

- The application is deployed and accessible at: https://kwiz-brgkdec7cphbcbb2.westeurope-01.azurewebsites.net/home
- This URL is the production environment where users can access the application
- The deployment is automatically updated whenever changes are pushed to the main branch
- The application is hosted on Azure Web App service in the West Europe region

### Known Issues

* Somehow the pure URL without any trailing path seems not to work yet - which is a bug in current WebConfig that our most valued developer IntelliJ Junie was not yet able to fix.
