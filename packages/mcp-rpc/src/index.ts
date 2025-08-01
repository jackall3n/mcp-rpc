import { McpServer } from "@modelcontextprotocol/sdk";
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { Tool, ToolBuilder } from "./tool.js";
import { Context } from "./types.js";
import { z } from "zod";

type HandlerTools<C extends Context> = Record<string, Tool<C>>;
type RootHandlerTools<C extends Context> = Record<
  string,
  Tool<C> | HandlerTools<C>
>;

function resolveTools<C extends Context>(
  tools: Record<string, Tool<C> | RootHandlerTools<C>>,
  parentName?: string
) {
  const results: [string, Tool<C>][] = [];

  for (const [name, tool] of Object.entries(tools)) {
    const fullName = parentName ? `${parentName}.${name}` : name;

    if (tool instanceof Tool) {
      results.push([fullName, tool]);
    } else {
      results.push(...resolveTools(tool, fullName));
    }
  }

  return results;
}

function createTools<C extends Context>(tools: [string, Tool<C>][]) {
  return Object.fromEntries(
    tools.map(([name, tool]) => [name, { description: tool.description }])
  );
}

type RootTools<C extends Context> = Record<
  string,
  Tool<C> | RootHandlerTools<C>
>;

type InferTools<C extends Context, T> =
  T extends RootTools<C>
    ? {
        [K in keyof T]: T[K] extends Tool<C, infer I, infer R>
          ? {
              input: z.infer<I>;
              output: Awaited<R>;
            }
          : never;
      }
    : never;

function createHandlerFactory<C extends Context>(rpc: RPC<C>) {
  return function handler<Tools extends RootTools<C>>(tools: Tools) {
    const _tools = resolveTools(tools);

    return {
      register: (server: McpServer) => {
        for (const [name, tool] of _tools) {
          server.tool(
            name,
            tool.description,
            tool.input,
            async (input: any, { authInfo }: { authInfo: AuthInfo }) => {
              const ctx = await rpc.createContext?.({ authInfo });

              return tool.fn({ ctx: ctx as Awaited<C>, input });
            }
          );
        }
      },
      tools: createTools(_tools),
      $inferTools: undefined as unknown as InferTools<C, Tools>,
      metadata: rpc._metadata,
    };
  };
}

function createToolFactory<C extends Context>() {
  return (description: string) => new ToolBuilder<C>(description);
}

class RPC<C extends Context> {
  public createContext?: (args: { authInfo: any }) => C;
  public _metadata: Record<string, any> = {};

  constructor(createContext?: (args: { authInfo: any }) => C) {
    this.createContext = createContext;
  }

  context<T extends Context>(createContext: (args: { authInfo: any }) => T) {
    this.createContext = createContext as any;

    return this as unknown as RPC<T>; // TODO: fix this
  }

  metadata(metadata: Record<string, any>) {
    this._metadata = metadata;
    return this;
  }

  create() {
    return {
      handler: createHandlerFactory(this),
      tool: createToolFactory<C>(),
    };
  }
}

function createRPCBuilder() {
  return new RPC();
}

export const initRPC = createRPCBuilder();
