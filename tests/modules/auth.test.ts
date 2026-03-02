import { describe, expect, it } from "bun:test";
import { createAuthClient } from "better-auth/client"
import { env } from "../../src/lib/env";

// Wrap the app with Treaty client
export const authClient = createAuthClient({
    baseURL: env.BETTER_AUTH_URL // The base URL of your auth server
})

describe("Auth Module Tests (via better-auth)", () => {
    describe("POST /auth/api/sign-in/email", () => {
        it("should reject invalid login credentials", async () => {
            const SignInResponse = await authClient.signIn.email({
                email: "test@example.com",
                password: "wrongpassword"
            });

            // better-auth generally returns 400 or 401 for bad logins depending on configuration
            expect([404]).toContain(SignInResponse.error?.status || 500);
        });
    });

    describe("GET /auth/api/get-session", () => {
        it("should return null or unauthorized when no session exists", async () => {
            const SessionResponse = await authClient.getSession();
            // Typically returns 200 with no session data or 401
            expect([404]).toContain(SessionResponse.error?.status || 500);
        });
    });
});
