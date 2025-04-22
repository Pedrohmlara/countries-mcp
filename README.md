# Countries MCP

This project implements a Model Context Protocol (MCP) server that provides country-related data using the [REST Countries API](https://restcountries.com/). It's built using TypeScript and Express, with Docker support for easy deployment.

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn package manager

## Installation

1. Install dependencies:
```bash
npm install
```

2. Add a `.env` file in the root directory as .example shows

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

1. Build the application:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

### Using Docker

1. Build and run using Docker Compose:
```bash
docker-compose up --build
```

## API Documentation

### Endpoints

#### POST /mcp
Main endpoint for MCP communication.

**Headers:**
- `Accept: application/json, text/event-stream`
- `mcp-session-id`: Session identifier (null for new sessions)

**Initial Request:**
- First request should not include a session ID
- Server will respond with a new session ID in the `mcp-session-id` header

**Subsequent Requests:**
- Include the session ID received from the initial request
- Maintains the session context for continued interaction