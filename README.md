# Elysia with Bun runtime

## Getting Started
To get started with this template, simply paste this command into your terminal:
```bash
bun create elysia ./elysia-example
```

## Project Structure

This project uses a modular directory structure to separate concerns:

- `src/core/`: Contains core foundation components that are agnostic to business logic (e.g., custom errors, global middlewares, standard response formats).
- `src/lib/`: Custom wrappers and configurations for external libraries or third-party services (e.g., database connection, email provider, auth utilities).
- `src/modules/`: Contains the actual business logic grouped by features or domains (e.g., `auth`, `users`). Each module encapsulates its own routes, schema, and services.
- `src/utils/`: General-purpose helper functions and utilities used across the application.

## Development
To start the development server run:
```bash
bun run dev
```

Jika ingin menerapkan semua migrasi dari awal ke database:
```bash
bunx drizzle-kit up
```

Open http://localhost:3000/ with your browser to see the result.
Open http://localhost:3000/openapi with your browser to see the OpenAPI documentation.
Open http://localhost:3000/health-check with your browser to see the health check (e.g database connection).