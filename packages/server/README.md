# @open-gsio/server

This directory contains the server component of open-gsio, a full-stack Conversational AI application. The server handles API requests, manages AI model interactions, serves static assets, and provides server-side rendering capabilities.

## Directory Structure

- `__tests__/`: Contains test files for the server components
- `services/`: Contains service modules for different functionalities
  - `AssetService.ts`: Handles static assets and SSR
  - `ChatService.ts`: Manages chat interactions with AI models
  - `ContactService.ts`: Processes contact form submissions
  - `FeedbackService.ts`: Handles user feedback
  - `MetricsService.ts`: Collects and processes metrics
  - `TransactionService.ts`: Manages transactions
- `durable_objects/`: Contains durable object implementations
  - `ServerCoordinator.ts`: Cloudflare Implementation
  - `ServerCoordinatorBun.ts`: Bun Implementation
- `api-router.ts`: API Router
- `RequestContext.ts`: Application Context
- `server.ts`: Main server entry point
