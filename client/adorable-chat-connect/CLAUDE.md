# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a React TypeScript chat application called "Adorable Chat Connect" built with modern web technologies. The app is structured as a single-page application with the following key architecture patterns:

- **Frontend Framework**: React 18 with TypeScript, built using Vite
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: React Router v6 with routes for /, /login, /signup, and catch-all 404
- **Authentication**: Supabase Auth with session management and protected features
- **Backend**: Supabase as BaaS with Edge Functions (specifically a 'prompt' function)
- **Styling**: Tailwind CSS with custom theme configuration

## Key Components Architecture

- **App.tsx**: Root component with React Query provider, routing setup, and global toast providers
- **AdorableChat.tsx**: Main chat interface component with authentication state, prompt submission, and AI interaction
- **ChatSidebar.tsx**: Collapsible sidebar for chat history and navigation
- **Header.tsx**: Top navigation bar with authentication controls
- **UI Components**: Located in `src/components/ui/` - comprehensive shadcn/ui component library

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview

# Install dependencies
npm i
```

## Project Structure

- `src/components/` - React components including main chat interface and UI library
- `src/pages/` - Route components (Index, Login, Signup, NotFound)
- `src/integrations/supabase/` - Supabase client configuration and types
- `src/hooks/` - Custom React hooks (toast, mobile detection)
- `src/lib/` - Utility functions
- `supabase/functions/` - Supabase Edge Functions (contains 'prompt' function)

## Key Features

- **Chat Interface**: Main conversational UI with prompt submission to AI backend
- **Authentication Flow**: Login/signup modals with Supabase Auth integration
- **Protected Features**: Services and Supabase integrations only available to authenticated users
- **Responsive Design**: Mobile-first design with collapsible sidebar
- **File Upload**: Image upload functionality (placeholder implementation)
- **MCP Server Integration**: Placeholder for Model Context Protocol server connections

## Configuration Notes

- Uses path alias `@` mapping to `./src`
- Development server configured to run on all interfaces (::) port 8080
- Supabase client configured with localStorage persistence and auto token refresh
- The application integrates with Lovable platform for collaborative development

## Authentication & Data Flow

The app uses Supabase for authentication with session persistence. The main chat functionality requires authentication - unauthenticated users see a login modal when attempting to submit prompts. Authenticated users can access additional features like MCP servers and Supabase integrations. The chat interface calls a Supabase Edge Function named 'prompt' to process user input.