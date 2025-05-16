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

The API documentation is available through Swagger UI when the application is running. Swagger UI provides an interactive interface to explore and test the API endpoints.

### Accessing Swagger UI

1. Start the backend application as described in the "Getting Started" section
2. Open your browser and navigate to: http://localhost:8080/swagger-ui.html

### Using Swagger UI

Swagger UI provides the following features:

- **API Overview**: View all available endpoints grouped by controller/tag
- **Request Details**: For each endpoint, you can see:
  - HTTP method (GET, POST, PUT, DELETE, etc.)
  - URL path
  - Description
  - Request parameters
  - Request body schema (for POST/PUT requests)
  - Response body schema
  - Authorization requirements (if applicable)

### Testing Endpoints

To test an API endpoint:

1. Click on the endpoint you want to test
2. Click the "Try it out" button
3. Fill in any required parameters or request body
4. Click "Execute"
5. View the response, including:
   - Status code
   - Response headers
   - Response body

### API Documentation Configuration

The Swagger/OpenAPI configuration is defined in `src/main/resources/application.properties`:

```properties
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operationsSorter=method
springdoc.swagger-ui.tagsSorter=alpha
```

You can also access the raw OpenAPI specification at: http://localhost:8080/api-docs

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

### Configuration

The actuator endpoints are configured in `src/main/resources/application.properties`:

```properties
management.endpoints.web.exposure.include=health,info,gamestate
management.endpoint.health.show-details=always
management.endpoints.web.base-path=/actuator
```

You can modify these settings to enable or disable specific endpoints or change the base path.
