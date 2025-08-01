# mcp-rpc

Type-safe RPC library for building Model Context Protocol (MCP) servers with an intuitive, fluent API.

## Features

- 🔒 **Type-safe** - Full TypeScript support with automatic type inference
- 🏗️ **Fluent API** - Intuitive method chaining for building RPC handlers
- ✅ **Schema validation** - Built-in Zod integration for input validation
- 🔐 **Context support** - Pass authentication and shared resources to handlers
- 📁 **Nested tools** - Organize tools in hierarchical namespaces
- 🚀 **Lightweight** - Minimal dependencies, focused on developer experience

## Installation

```bash
npm install mcp-rpc zod
# or
pnpm add mcp-rpc zod
# or
yarn add mcp-rpc zod
```

## Quick Start

```typescript
import { initRPC } from 'mcp-rpc';
import { z } from 'zod';

// Initialize RPC with optional context
const rpc = initRPC
  .context(async ({ authInfo }) => {
    // Create context available to all handlers
    return {
      user: await getUser(authInfo),
      db: database,
    };
  })
  .create();

// Create handler with tools
export const handler = rpc.handler({
  // Simple tool
  echo: rpc
    .tool('Echo a message back')
    .input(z.object({ message: z.string() }))
    .handler(async ({ input }) => ({
      content: [{ type: 'text', text: `Echo: ${input.message}` }],
    })),

  // Tool with context
  getProfile: rpc
    .tool('Get user profile')
    .handler(async ({ ctx }) => ({
      content: [{ type: 'text', text: `Hello, ${ctx.user.name}!` }],
    })),

  // Nested tools
  users: {
    list: rpc.tool('List all users').handler(async ({ ctx }) => ({
      content: [{ type: 'text', text: JSON.stringify(await ctx.db.users.findMany()) }],
    })),
    
    get: rpc
      .tool('Get a specific user')
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, ctx }) => {
        const user = await ctx.db.users.findById(input.id);
        return {
          content: [{ type: 'text', text: JSON.stringify(user) }],
        };
      }),
  },
});

// Type inference
type Tools = typeof handler.$inferTools;
type EchoInput = Tools['echo']['input']; // { message: string }
```

## API Reference

### `initRPC`

Creates a new RPC builder instance.

```typescript
const rpc = initRPC
  .context(async ({ authInfo }) => ({ /* context */ }))
  .metadata({ /* metadata */ })
  .create();
```

### `rpc.tool(description)`

Creates a new tool builder.

```typescript
rpc.tool('Tool description')
  .input(zodSchema) // Optional: Add input validation
  .handler(async ({ input, ctx }) => {
    // Handler implementation
    return { content: [{ type: 'text', text: 'response' }] };
  });
```

### `rpc.handler(tools)`

Creates an RPC handler with the specified tools.

```typescript
const handler = rpc.handler({
  toolName: tool,
  namespace: {
    nestedTool: tool,
  },
});
```

### Handler Registration

Register the handler with an MCP server:

```typescript
handler.register(mcpServer);
```

## Advanced Usage

### Context with Authentication

```typescript
const rpc = initRPC
  .context(async ({ authInfo }) => {
    const user = await authenticateUser(authInfo.token);
    const permissions = await getPermissions(user.id);
    
    return {
      user,
      permissions,
      services: {
        email: emailService,
        storage: storageService,
      },
    };
  })
  .create();
```

### Complex Input Validation

```typescript
const createUser = rpc
  .tool('Create a new user')
  .input(
    z.object({
      name: z.string().min(1).max(100),
      email: z.string().email(),
      role: z.enum(['admin', 'user', 'guest']),
      metadata: z.record(z.string()).optional(),
    })
  )
  .handler(async ({ input, ctx }) => {
    // Input is fully typed and validated
    const user = await ctx.db.users.create(input);
    return {
      content: [{ type: 'text', text: `User ${user.id} created` }],
    };
  });
```

### Error Handling

```typescript
const tool = rpc
  .tool('Fetch data')
  .handler(async ({ ctx }) => {
    try {
      const data = await ctx.api.fetch();
      return {
        content: [{ type: 'text', text: JSON.stringify(data) }],
      };
    } catch (error) {
      return {
        content: [{ 
          type: 'text', 
          text: `Error: ${error.message}` 
        }],
        isError: true,
      };
    }
  });
```

## Integration with MCP Servers

### Standard MCP Server

```typescript
import { McpServer } from '@modelcontextprotocol/sdk';

const server = new McpServer({
  name: 'my-mcp-server',
  version: '1.0.0',
});

// Register all tools with the server
handler.register(server);

// Start the server
server.listen();
```

### Vercel MCP Adapter

Use the Vercel MCP adapter to deploy your MCP server as a Next.js API route:

```typescript
// app/api/mcp/[transport]/route.ts
import { createMcpHandler } from '@vercel/mcp-adapter';
import { initRPC } from 'mcp-rpc';
import { z } from 'zod';

// Create your RPC handler
const rpc = initRPC
  .context(async ({ authInfo }) => ({
    // Your context setup
  }))
  .create();

const appHandler = rpc.handler({
  // Your tools
  echo: rpc
    .tool('Echo a message')
    .input(z.object({ message: z.string() }))
    .handler(async ({ input }) => ({
      content: [{ type: 'text', text: `Echo: ${input.message}` }],
    })),
});

// Create the Vercel handler
const handler = createMcpHandler(
  async (server) => {
    appHandler.register(server);
  },
  {
    capabilities: {
      tools: appHandler.tools,
    },
  },
  {
    basePath: '',
    verboseLogs: process.env.NODE_ENV === 'development',
    maxDuration: 60,
  }
);

// Export for Next.js App Router
export { handler as GET, handler as POST, handler as DELETE };
```

Now your MCP server is accessible at:
- Local: `http://localhost:3000/api/mcp`
- Production: `https://your-app.vercel.app/api/mcp`

## TypeScript Support

The library provides complete type inference:

```typescript
// Infer all tool types
type AppTools = typeof handler.$inferTools;

// Access specific tool input/output types
type EchoInput = AppTools['echo']['input'];
type EchoOutput = AppTools['echo']['output'];

// Tool names are typed
type ToolNames = keyof AppTools; // 'echo' | 'getProfile' | 'users.list' | 'users.get'
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT