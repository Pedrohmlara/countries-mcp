import cors from "cors";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "crypto";
import { setTools } from "./tools";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

app.post("/mcp", async (req: Request, res: Response) => {
  const sessionId = getSessionIdFromHeader(req);
  let transport: StreamableHTTPServerTransport;

  if(sessionId && transports[sessionId]) {
    transport = transports[sessionId];

  } else if(!sessionId && isInitializeRequest(req.body)) {
    const newSessionId = randomUUID();
    res.setHeader("mcp-session-id", newSessionId);
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => newSessionId,
      onsessioninitialized: (sessionId) => {
        transports[sessionId] = transport;
      },
    });
    
    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    }

    const server = new McpServer({
      name: "Demo",
      version: "1.0.0"
    });
    
    setTools(server)

    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null
    });
    return;
  }

  await transport.handleRequest(req, res, req.body)
});

const handleSessionRequest = async (req: Request, res: Response) => {
  const sessionId = getSessionIdFromHeader(req);
  if(!sessionId || !transports[sessionId]){
      res.status(400).send('Invalid or missing session ID');
      return;
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
}

const getSessionIdFromHeader = (req: Request) => {
  return req.headers['mcp-session-id'] as string | undefined;
}

app.get('/mcp', handleSessionRequest)
app.delete('/mcp', handleSessionRequest)

app.listen(process.env.PORT || 3000)
