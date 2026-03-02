# Repository Guidelines

## Project Structure & Module Organization

```
src/
├── app.ts            # App entry point; registers plugins, middleware, and modules
├── main.ts           # Server start
├── core/             # Framework-agnostic foundations (errors, response formats, interfaces)
├── lib/              # Wrappers for external services (database, auth, env)
├── middleware/       # Elysia middleware plugins
├── modules/          # Feature modules grouped by domain (e.g., product, auth)
│   └── product/
│       ├── handler.ts   # Route definitions (Elysia group)
│       ├── model.ts     # DTOs / request-response types
│       ├── schema.ts    # Drizzle table schema
│       └── service.ts   # Business logic
└── utils/            # General-purpose helpers

drizzle/              
├── schemas.ts        # Central re-export of all module schemas
├── meta/             # Auto-generated Drizzle metadata
└── *.sql             # Auto-generated migration files

tests/
├── health-check.test.ts
└── modules/          # Integration tests per module
```

- Use `src/modules/product/` as the canonical example for any new module.
- Register new module schemas in `drizzle/schemas.ts`.

---

## Build, Test & Development Commands

| Command | Description |
|---|---|
| `bun run dev` | Start the development server with hot reload |
| `bun run build` | Type-check and compile a production binary to `.output/server` |
| `bun run start` | Run the compiled production binary |
| `bun test` | Run all tests |
| `bun test <pattern>` | Run tests matching a name or path pattern (e.g., `bun test auth`) |
| `bunx drizzle-kit generate --name <name>` | Generate a migration from schema changes |
| `bunx drizzle-kit check` | Validate pending migrations |
| `bunx drizzle-kit migrate` | Apply pending migrations to the database |

> ⚠️ Never use `drizzle-kit push`, `drizzle-kit up`, or `drizzle-kit drop`.

---

## Coding Style & Naming Conventions

- **Language:** TypeScript (strict).
- **Indentation:** 4 spaces.
- **File & folder names:** `kebab-case` only (e.g., `product-handler.ts`, `my-module/`).
- **Error handling:** Always throw `AppError` from `src/core/error.ts` — never throw plain errors or `new Error(...)`.
- **DTOs:** Define all request/response shapes in the module's `model.ts`. Use the same DTO types consistently across `handler.ts` and `service.ts`.
- **No magic strings:** Use enums or constants for status codes and error types.
- **Don't use 'any' type:** Use proper types instead of 'any' as much as possible
- **Always make tests for new features:** For every new feature, create a new test file in the `tests/modules/` directory.
- **Don't edit product module:** The product module is a template and should not be edited. Use it as a reference to create new modules.

---

## Testing Guidelines

Tests use Bun's built-in test runner (`bun:test`) with Eden Treaty for end-to-end typed HTTP calls.

### Setup Pattern

```typescript
import { describe, expect, it, beforeAll } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { app } from "../../src/app";

const tClient = treaty(app);
```

### Testing Endpoints That Require Authentication

Better Auth routes are mounted via `.mount(auth.handler)` and are not statically reflected in the Eden type system. Cast `tClient` to `any` for auth-specific calls:

```typescript
describe("My Module Tests", () => {
    let authCookie = "";

    beforeAll(async () => {
        // 1. Sign up a temporary test user
        const res = await (tClient as any).auth.api["sign-up"].email.post({
            email: `test_${Date.now()}@example.com`,
            password: "password123",
            name: "Test User"
        });

        // 2. Capture the session cookie for subsequent authenticated requests
        const cookieHeader = res.response?.headers.get("set-cookie");
        if (cookieHeader) authCookie = cookieHeader;
    });

    it("should succeed with auth cookie", async () => {
        const { status } = await tClient.api.myResource.post(
            { field: "value" },
            { fetch: { headers: { cookie: authCookie } } }
        );
        expect(status).toBe(200);
    });

    it("should return 401 without auth", async () => {
        const { status } = await tClient.api.myResource.post({ field: "value" });
        expect(status).toBe(401);
    });
});
```

- See `tests/modules/product.test.ts` for a full example with create, read, and delete flows.
- See `tests/modules/auth.test.ts` for auth-specific test patterns.
- Test file names mirror module names: `tests/modules/<module-name>.test.ts`.

---

## Commit & Pull Request Guidelines

- **Prefix commit messages with:**
    - `Fix:` for bug fixes
    - `Feat:` for new features
    - `Docs:` for documentation changes
    - `Style:` for code style changes
    - `Refactor:` for code refactoring
    - `Test:` for test changes
    - `Chore:` for chore changes
- **Commit messages:** Use concise imperative sentences: `Add product delete endpoint`, `Fix auth cookie handling in tests`.
- **One concern per commit:** Avoid mixing unrelated refactors with feature changes.
- **PRs:** Include a short description of what changed and why. Reference related issues if applicable.
- **No dead code:** Remove `console.log` statements and commented-out code before committing.

---

## Security & Configuration

- All secrets live in `.env`. Use `src/lib/env.ts` to access them — never import `process.env` directly in modules.
- Do not commit `.env`. Use `.env.example` to document required variables.
- Cookies use `Secure`, `HttpOnly`, and `SameSite=None` by default (see `src/lib/auth.ts`).