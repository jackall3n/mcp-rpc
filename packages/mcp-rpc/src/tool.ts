import { Args, Context } from "./types.js";
import { z } from "zod";

export class ToolBuilder<C extends Context, S extends z.ZodObject = z.ZodObject> {
  inputSchema: z.ZodObject | undefined;

  constructor(public description: string) {}

  input<S extends z.ZodObject>(schema: S) {
    this.inputSchema = schema;
    return this as unknown as ToolBuilder<C, S>;
  }

  handler<R>(fn: (args: Args<C, S>) => R) {
    return new Tool<C, S, R>(this, fn);
  }
}

export class Tool<C extends Context, S extends z.ZodObject = z.ZodObject, R = any> {
  constructor(
    private builder: ToolBuilder<C>,
    public fn: (args: Args<C, S>) => R
  ) {}

  get description() {
    return this.builder.description;
  }

  get input() {
    return this.builder.inputSchema;
  }
}
