import { initRPC } from "mcp-rpc";
import { z } from "zod";

const rpc = initRPC
  .context(async ({ authInfo }) => {
    console.log(authInfo);

    return {
      db: {
        organisations: [
          { id: "1", name: "Organisation 1" },
          { id: "2", name: "Organisation 2" },
        ],
      },
      auth: {
        userId: "123",
      },
    };
  })
  .create();

export const appHandler = rpc.handler({
  echo: rpc
    .tool("Echo a message")
    .input(z.object({ message: z.string() }))
    .handler(async ({ input }) => {
      return {
        content: [{ type: "text", text: `Tool echo: ${input.message}` }],
      };
    }),

  organisations: {
    list: rpc.tool("List organisations").handler(async ({ ctx }) => {
      return {
        content: [{ type: "text", text: `Tool organisations: list` }],
      };
    }),
    get: rpc
      .tool("Get an organisation")
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, ctx }) => {
        const organisation = ctx.db.organisations.find(
          (organisation) => organisation.id === input.id
        );

        return {
          content: [
            {
              type: "text",
              text: `Tool organisations: get ${organisation?.name}`,
            },
          ],
        };
      }),
  },
});

export type AppHandler = typeof appHandler;
export type Tools = typeof appHandler.$inferTools;
export type ToolNames = keyof Tools;
export type EchoInput = Tools["echo"]["input"];
