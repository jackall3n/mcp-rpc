# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo using Turborepo that contains an MCP (Model Context Protocol) RPC library and examples. The main library (`mcp-rpc`) provides a type-safe way to create RPC handlers for MCP servers.

## Commands

### Development
- `pnpm dev` - Run all apps and packages in development mode with watch
- `pnpm dev --filter=<package>` - Run specific package (e.g., `--filter=mcp-rpc`, `--filter=nextjs`)

### Building
- `pnpm build` - Build all apps and packages
- `pnpm build --filter=<package>` - Build specific package

### Code Quality
- `pnpm lint` - Run ESLint across all packages
- `pnpm format` - Format all TypeScript and Markdown files with Prettier
- `pnpm check-types` - Run TypeScript type checking

## Architecture

### Core Library (`packages/mcp-rpc`)
The main library at `packages/mcp-rpc/src/index.ts` exports `initRPC` which:
- Creates type-safe RPC handlers using a fluent API
- Supports context creation with authentication info
- Provides tool builders with Zod schema validation
- Enables nested tool organization (e.g., `organisations.list`, `organisations.get`)

Key components:
- `index.ts` - Main RPC builder and handler factory
- `tool.ts` - Tool builder implementation
- `types.ts` - TypeScript type definitions

### Example Implementation
The NextJS example at `examples/nextjs/src/app/[transport]/handler.ts` demonstrates:
- Creating an RPC instance with context (database, auth)
- Defining tools with input validation using Zod
- Nested tool structure for organization
- Type inference for tools

### Monorepo Structure
- Uses pnpm workspaces
- Shared TypeScript configs in `packages/typescript-config`
- Turbo tasks defined in `turbo.json` for build, lint, check-types, and dev

## Development Guidelines

When working with this codebase:
1. Use pnpm for package management (v10.8.0)
2. Follow the existing TypeScript patterns and Zod schema validation
3. Maintain type safety throughout the RPC chain
4. Use the fluent API pattern for tool builders
5. Run type checking before committing changes