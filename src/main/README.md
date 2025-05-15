# KwiZ Backend

This is the backend application for the KwiZ pub quiz system built with Spring Boot.

## Prerequisites

- Java 21 or higher
- Gradle (or use the included Gradle wrapper)

## Getting Started

1. Navigate to the project root directory

2. Run the Spring Boot application:
   ```
   ./gradlew bootRun
   ```
   or on Windows:
   ```
   gradlew.bat bootRun
   ```

3. The backend will start on http://localhost:8080

## Available Gradle Tasks

- `./gradlew bootRun` - Starts the Spring Boot application
- `./gradlew build` - Builds the application
- `./gradlew test` - Runs the tests
- `./gradlew clean` - Cleans the build directory

## Application Configuration

The application configuration is defined in `src/main/resources/application.properties`. The current configuration includes:

- Application name: kwiz

## Project Structure

- `src/main/java` - Java source code
  - The code is organized by domain following DDD principles
- `src/main/resources` - Configuration files and static resources
- `src/test` - Test source code

## Development Guidelines

- Follow Domain-Driven Design (DDD) principles
- Write unit tests for all business logic
- Follow the Clean Architecture principles
- Package by domain, not by technical layer
- Each domain should be self-contained
- Business logic should reside only in the domain layer

## API Documentation

The API documentation will be available at http://localhost:8080/swagger-ui.html when the application is running (if Swagger is configured).