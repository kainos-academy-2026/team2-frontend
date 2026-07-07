import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app";

describe("GET /health", () => {
	it("should return 200 with status UP", async () => {
		const response = await request(app).get("/health");

		expect(response.status).toBe(200);
		expect(response.body.status).toBe("UP");
	});

	it("should return a valid ISO timestamp in the time field", async () => {
		const response = await request(app).get("/health");

		expect(response.status).toBe(200);
		expect(new Date(response.body.time).toISOString()).toBe(response.body.time);
	});
});

describe("GET /", () => {
	it("should return 200", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(200);
	});

	it("should return HTML content", async () => {
		const response = await request(app).get("/");

		expect(response.headers["content-type"]).toMatch(/html/);
	});
});

describe("GET /register", () => {
	it("should return 200", async () => {
		const response = await request(app).get("/register");

		expect(response.status).toBe(200);
	});

	it("should return HTML content", async () => {
		const response = await request(app).get("/register");

		expect(response.headers["content-type"]).toMatch(/html/);
	});
});
