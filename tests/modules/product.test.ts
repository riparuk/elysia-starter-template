import { describe, expect, it, beforeAll } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { app } from "../../src/app";

// Wrap the app with Treaty client
const tClient = treaty(app);


describe("Product Module Tests", () => {
    let authCookie = "";
    let createdProductId = "";

    beforeAll(async () => {
        // Create a test user to get an authenticated session cookie
        const testEmail = `test_product_${Date.now()}@example.com`;
        const res = await tClient.auth.api["sign-up"].email.post({
            email: testEmail,
            password: "password123",
            name: "Test User"
        });

        console.log("res", res);

        const cookieHeader = res.response?.headers.get("set-cookie");
        if (cookieHeader) {
            authCookie = cookieHeader;
        }
    });

    describe("GET /products", () => {
        it("should return a list of products successfully", async () => {
            const { status, error } = await tClient.api.products.get();

            expect(status).toBe(200);
            expect(error).toBeNull();
        });
    });

    describe("POST /products", () => {
        it("should return 401 Unauthorized for unauthenticated requests", async () => {
            const { status } = await tClient.api.products.post({
                name: "Test Name",
                price: 100,
                description: "Test Description"
            });
            expect(status).toBe(401);
        });

        it("should create a new product when authenticated", async () => {
            const { status, data, error } = await tClient.api.products.post({
                name: "New Product",
                price: 1500,
                description: "This is a new product test"
            }, {
                fetch: {
                    headers: { cookie: authCookie }
                }
            });

            expect(status).toBe(200); // HTTP Status is 200
            expect(data?.status).toBe(201); // Logical formatResponse status is 201
            expect(error).toBeNull();
            expect(data?.data).toHaveProperty("id");
            expect(data?.data.name).toBe("New Product");

            if (data?.data.id) {
                createdProductId = data.data.id;
            }
        });
    });

    describe("GET /products/:id", () => {
        it("should return the newly created product", async () => {
            const { status, data } = await tClient.api.products({ id: createdProductId }).get();
            expect(status).toBe(200);
            expect(data?.data.id).toBe(createdProductId);
        });
    });

    describe("DELETE /products/:id", () => {
        it("should delete the product when authenticated", async () => {
            const { status, error } = await tClient.api.products({ id: createdProductId }).delete(undefined, {
                fetch: {
                    headers: { cookie: authCookie }
                }
            });

            expect(status).toBe(200);
            expect(error).toBeNull();
        });

        it("should return 404 when getting the deleted product", async () => {
            const { status } = await tClient.api.products({ id: createdProductId }).get();
            expect(status).toBe(404);
        });
    });
});
