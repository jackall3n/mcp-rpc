import { createMcpHandler } from "@vercel/mcp-adapter";

import { appHandler } from "./handler";

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
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
  }
);

export { handler as DELETE, handler as GET, handler as POST };
