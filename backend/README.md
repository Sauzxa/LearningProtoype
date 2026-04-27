# LiveKit Backend

NestJS backend server that serves as a token vending machine for LiveKit streaming platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Copy `.env` and update with your LiveKit credentials:
- `LIVEKIT_API_KEY`: Your LiveKit API key
- `LIVEKIT_API_SECRET`: Your LiveKit API secret
- `LIVEKIT_URL`: Your LiveKit server URL

3. Run the development server:
```bash
npm run start:dev
```

The server will start on http://localhost:3001

## Project Structure

```
backend/
├── src/
│   ├── livekit/
│   │   ├── livekit.controller.ts  # API endpoints
│   │   ├── livekit.service.ts     # Token generation logic
│   │   └── livekit.module.ts      # Module definition
│   ├── app.module.ts              # Root module
│   └── main.ts                    # Application entry point
├── .env                           # Environment variables
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript configuration
```

## Available Scripts

- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
