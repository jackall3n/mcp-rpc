import type { z } from "zod";

export type Context = any;

export type Args<C extends Context, S extends z.ZodObject = z.ZodObject> = {
  ctx: Awaited<C>;
  input: z.infer<S>;
};
