# KwiZ Frontend

This is the frontend application for the KwiZ pub quiz system built with Angular 19.

## Prerequisites

- Node.js and npm
- Angular CLI (`npm install -g @angular/cli`)

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```
   This will start the Angular development server with the proxy configuration that forwards API requests to the backend.

3. The application will be available at http://localhost:4200

## Available Scripts

- `npm start` - Starts the development server with proxy configuration
- `npm run build` - Builds the application for production
- `npm run watch` - Builds the application and watches for changes
- `npm test` - Runs the unit tests

## Proxy Configuration

The application is configured with a proxy to forward API requests to the backend server. This configuration is defined in `proxy.conf.json`.

## API Documentation

The backend API is documented using Swagger UI. When the backend is running, you can access the API documentation at:

```
http://localhost:8080/swagger-ui.html
```

This interactive documentation allows you to:
- View all available API endpoints
- Understand request and response formats
- Test API endpoints directly from the browser

This is particularly useful for frontend developers to understand the available backend services.

## Project Structure

- `src/app` - Application source code
  - Components, services, and other Angular artifacts are organized by feature
- `src/assets` - Static assets like images, icons, etc.
- `src/environments` - Environment-specific configuration

## Development Guidelines

- Follow Angular best practices
- Use Angular Signals for state management when applicable
- Write unit tests for all components and services
- Follow the TypeScript coding standards
