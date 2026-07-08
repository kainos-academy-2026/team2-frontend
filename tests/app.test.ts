import axios from "axios";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, true);

const sampleApiJobRoles = [
	{
		roleName: "Software Engineer",
		location: "Belfast",
		capability: "Engineering",
		band: "3",
		closingDate: "2026-08-15",
		status: "OPEN",
	},
	{
		roleName: "Test Engineer",
		location: "London",
		capability: "Quality Assurance",
		band: "2",
		closingDate: "2026-08-30",
		status: "open",
	},
	{
		roleName: "Business Analyst",
		location: "",
		capability: "Consulting",
		band: "3",
		closingDate: "2026-09-01",
		status: "OPEN",
	},
	{
		roleName: "Delivery Manager",
		location: "Dublin",
		capability: "Delivery",
		band: "4",
		closingDate: "2026-07-20",
		status: "CLOSED",
	},
];

beforeEach(() => {
	mockedAxios.get.mockResolvedValue({ data: sampleApiJobRoles });
});

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
	it("should redirect to /login", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});
});

describe("Auth routes", () => {
	it("GET /login should return 200 with login form", async () => {
		const response = await request(app).get("/login");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Sign In");
		expect(response.text).toContain('form action="/login" method="POST"');
	});

	it("POST /login should return 400 and show generic error for invalid input", async () => {
		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "invalid-email", password: "" });

		expect(response.status).toBe(400);
		expect(response.text).toContain("Invalid email or password.");
	});

	it("POST /login should redirect to /job-roles for valid input", async () => {
		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "candidate@example.com", password: "password123" });

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles");
	});

	it("POST /logout should redirect to login with loggedOut flag", async () => {
		const response = await request(app).post("/logout");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login?loggedOut=1");
	});
});

describe("GET /job-roles", () => {
	it("should return 200", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
	});

	it("should return HTML content", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.headers["content-type"]).toMatch(/html/);
	});

	it("should render the job roles table headers", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.text).toContain("Role Name");
		expect(response.text).toContain("Location");
		expect(response.text).toContain("Capability");
		expect(response.text).toContain("Band");
		expect(response.text).toContain("Closing Date");
		expect(response.text).toContain("Status");
	});

	it("should only display open job roles", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Test Engineer");
		expect(response.text).toContain("Business Analyst");
		expect(response.text).not.toContain("Delivery Manager");
		expect(response.text).not.toContain("CLOSED");
	});

	it("should render closing dates as DD/MM/YYYY", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.text).toContain("15/08/2026");
		expect(response.text).toContain("30/08/2026");
		expect(response.text).toContain("01/09/2026");
	});

	it("should render fallback placeholders for missing values", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.text).toContain("<td>-</td>");
	});

	it("should request job roles from the API service endpoint", async () => {
		await request(app).get("/job-roles");

		expect(mockedAxios.get).toHaveBeenCalledWith(
			"http://localhost:3001/job-roles",
		);
	});

	it("should render empty-state row when API call fails", async () => {
		mockedAxios.get.mockRejectedValueOnce(new Error("API unavailable"));

		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"No open job roles are available right now.",
		);
	});
});
