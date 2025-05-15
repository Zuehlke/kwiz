# KwiZ - The Zühlke Pub Quiz

## Introduction
A pub quiz is a quiz held in a pub or bar. These quizzes are popular social events that combine knowledge testing with a fun, relaxed atmosphere. This document outlines the basic rules for running and participating in a pub quiz.

## General Rules
1. **Teams**: Participants form teams
2. **No Cheating**: The Online research or asking people not part of the team is not allowed.
3. **Quiet During Questions**: Teams should remain quiet while questions are being read.
4. **Time Limit**: Each round typically has a set time limit for answering questions.

## Team Formation
1. Choose a creative team name.
2. Register your team with the quiz master before the quiz begins.

## Scoring
1. Each correct answer is typically worth one point.
2. Some questions may be worth more points if they are particularly difficult.
3. The team with the highest total score at the end of all rounds wins.
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
1. Be respectful to the quiz master and other teams.
2. Keep your answers and discussions quiet to avoid giving away answers to other teams.
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
4. The frontend will be available at http://localhost:4200

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
