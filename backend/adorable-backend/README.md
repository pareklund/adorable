# Adorable Backend

TypeScript-based API server for the Adorable project.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/example` - Example GET endpoint
- `POST /api/example` - Example POST endpoint with validation

## Development

- **Dev server**: `npm run dev` (with hot reload)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Test**: `npm run test`

Server runs on port 3001 by default.