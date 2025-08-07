# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development**: `npm run dev` - Start development server with hot reload using tsx
- **Build**: `npm run build` - Compile TypeScript to JavaScript in dist/  
- **Production**: `npm start` - Run compiled server from dist/
- **Lint**: `npm run lint` - Run ESLint on TypeScript files
- **Test**: `npm run test` - Run tests using Vitest

Server runs on port 3001 by default (configurable via PORT env var).

## Architecture Overview

This is a TypeScript Express.js API server that integrates with Supabase for authentication and GitHub via Octokit. The application follows a modular structure:

### Core Structure
- **Express App Setup** (`src/index.ts`): Standard Express server with helmet, CORS, JSON parsing, and error handling
- **Route Organization**: Health checks (`/health`) and API routes (`/api`) are separated
- **Type Safety**: Uses Zod for request validation and TypeScript interfaces for responses

### Key Integrations
- **Supabase**: Authentication service integration with user verification
- **GitHub**: Octokit client configured for GitHub API access
- **Request Validation**: Zod schemas for input validation (see ExampleSchema pattern)

### Authentication Flow
The `/api/v1/prompt/first` endpoint implements a typical auth pattern:
1. Extracts `X-Adorable-AccessToken` and `X-Adorable-UserId` headers
2. Validates token with Supabase auth service  
3. Verifies claimed user ID matches authenticated user
4. Generates UUID for new projects

### Response Patterns
All API responses follow the `ApiResponse<T>` interface:
```typescript
{
  success: boolean;
  data?: T;
  error?: string; 
  message?: string;
}
```

### Error Handling
Centralized error handling in middleware with:
- Development vs production error message exposure
- 404 handler for unknown routes
- Async error handling with express-async-handler

## Environment Setup

Copy `.env.example` to `.env` before development. Required variables include GitHub token and Supabase configuration.

## File Extensions

Uses ES modules with `.js` extensions in imports despite TypeScript source files (configured in tsconfig.json with NodeNext module resolution).