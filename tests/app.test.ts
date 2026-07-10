import axios from "axios";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app";
import { authService } from "../src/routes/auth-router";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, true);

const getSetCookieHeader = (header: string | string[] | undefined) => {
	if (Array.isArray(header)) {
		return header.join(";");
	}

	return header ?? "";
};

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

	it("should render generic 404 page for unknown routes", async () => {
		const response = await request(app).get("/missing-page");

		expect(response.status).toBe(404);
		expect(response.text).toContain("Something went wrong");
		expect(response.text).toContain(
			"The page you requested could not be found.",
		);
		expect(response.text).toContain("Error code: 404");
	});
});

describe("Auth routes", () => {
	it("GET /login should return 200 with login form", async () => {
		const response = await request(app).get("/login");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Sign In");
		expect(response.text).toContain('form action="/login" method="POST"');
	});

	it("GET /login should redirect authenticated users to /job-roles", async () => {
		const response = await request(app)
			.get("/login")
			.set("Cookie", ["authSession=token"]);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles");
	});

	it("POST /login should return 400 and show field-level errors for invalid input", async () => {
		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "invalid-email", password: "" });

		expect(response.status).toBe(400);
		expect(response.text).toContain("Invalid email address");
		expect(response.text).toContain(
			"Too small: expected string to have &gt;=1 characters",
		);
	});

	it("POST /login should redirect to /job-roles for valid input", async () => {
		vi.spyOn(authService, "login").mockResolvedValueOnce({
			isAuthenticated: true,
			redirectTo: "/job-roles",
			authSession: "test-session-token",
		});

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "candidate@example.com", password: "password123" });

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/");
		expect(getSetCookieHeader(response.headers["set-cookie"])).toContain(
			"authSession=",
		);
	});

	it("POST /login should use allowlisted post-login redirect cookie", async () => {
		vi.spyOn(authService, "login").mockResolvedValueOnce({
			isAuthenticated: true,
			redirectTo: "/job-roles",
			authSession: "test-session-token",
		});

		const response = await request(app)
			.post("/login")
			.set("Cookie", ["postLoginRedirect=/job-roles"])
			.type("form")
			.send({ email: "candidate@example.com", password: "password123" });

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles");
		expect(getSetCookieHeader(response.headers["set-cookie"])).toContain(
			"postLoginRedirect=;",
		);
	});

	it("POST /login should call auth service with email and password", async () => {
		const loginSpy = vi.spyOn(authService, "login").mockResolvedValueOnce({
			isAuthenticated: true,
			redirectTo: "/job-roles",
			authSession: "test-session-token",
		});

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "candidate@example.com", password: "password123" });

		expect(response.status).toBe(302);
		expect(loginSpy).toHaveBeenCalledWith({
			email: "candidate@example.com",
			password: "password123",
		});
	});

	it("POST /login should return 401 for wrong dev credentials", async () => {
		vi.spyOn(authService, "login").mockResolvedValueOnce({
			isAuthenticated: false,
			redirectTo: "/job-roles",
		});

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "dev@example.com", password: "wrong-password" });

		expect(response.status).toBe(401);
		expect(response.text).toContain("Invalid email or password.");
	});

	it("POST /login should show generic auth error when auth service denies login", async () => {
		vi.spyOn(authService, "login").mockResolvedValueOnce({
			isAuthenticated: false,
			redirectTo: "/login",
		});

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "candidate@example.com", password: "wrong-password" });

		expect(response.status).toBe(401);
		expect(response.text).toContain("Invalid email or password.");
	});

	it("POST /login should render generic 500 page when auth service throws", async () => {
		vi.spyOn(authService, "login").mockRejectedValueOnce(
			new Error("auth provider down"),
		);

		const response = await request(app)
			.post("/login")
			.type("form")
			.send({ email: "candidate@example.com", password: "password123" });

		expect(response.status).toBe(500);
		expect(response.text).toContain("Something went wrong");
		expect(response.text).toContain(
			"Something went wrong. Please try again later.",
		);
		expect(response.text).toContain("Error code: 500");
	});

	it("POST /logout should redirect to login with loggedOut flag", async () => {
		const logoutSpy = vi.spyOn(authService, "logout").mockResolvedValueOnce();
		const response = await request(app).post("/logout");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login?loggedOut=1");
		expect(logoutSpy).toHaveBeenCalledTimes(1);
		expect(getSetCookieHeader(response.headers["set-cookie"])).toContain(
			"authSession=;",
		);
	});

	it("POST /logout should still redirect when auth service logout fails", async () => {
		vi.spyOn(authService, "logout").mockRejectedValueOnce(
			new Error("logout failed"),
		);

		const response = await request(app).post("/logout");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login?loggedOut=1");
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

describe("POST /register", () => {
	it("should return 400 when required fields are missing", async () => {
		const response = await request(app).post("/register").send({
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
		});

		expect(response.status).toBe(400);
		expect(response.text).toContain("All fields are required.");
	});

	it("should return 400 when passwords do not match", async () => {
		const response = await request(app).post("/register").send({
			fullName: "Jane Smith",
			email: "jane.smith@example.com",
			password: "password123",
			confirmPassword: "password456",
		});

		expect(response.status).toBe(400);
		expect(response.text).toContain("Passwords do not match.");
	});

	it("should call backend registration API and return success message", async () => {
		const response = await request(app).post("/register").send({
			fullName: "Jane Smith",
			email: "jane.smith@example.com",
			password: "password123",
			confirmPassword: "password123",
		});

		expect(response.status).toBe(201);
		expect(response.text).toContain("Your account has been created.");
		expect(mockedAxios.post).toHaveBeenCalledWith(
			"http://localhost:3000/register",
			{
				fullName: "Jane Smith",
				email: "jane.smith@example.com",
				password: "password123",
			},
		);
	});

	it("should return 502 when backend registration fails", async () => {
		mockedAxios.post.mockRejectedValueOnce(new Error("backend unavailable"));

		const response = await request(app).post("/register").send({
			fullName: "Jane Smith",
			email: "jane.smith@example.com",
			password: "password123",
			confirmPassword: "password123",
		});

		expect(response.status).toBe(502);
		expect(response.text).toContain("Registration failed. Please try again.");
	});
});

describe("GET /job-roles", () => {
	it("should redirect unauthenticated users to /login", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
		expect(getSetCookieHeader(response.headers["set-cookie"])).toContain(
			"postLoginRedirect=%2Fjob-roles",
		);
	});

	it("should return 200 for authenticated users", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", ["authSession=token"]);

		expect(response.status).toBe(200);
	});

	it("should return HTML content", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", ["authSession=token"]);

		expect(response.headers["content-type"]).toMatch(/html/);
	});

	it("should render a logout form for authenticated users", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", ["authSession=token"]);

		expect(response.text).toContain('form action="/logout" method="POST"');
		expect(response.text).toContain("Log Out");
	});

	it("should render the job roles table headers", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", ["authSession=token"]);

		expect(response.text).toContain("Role Name");
		expect(response.text).toContain("Location");
		expect(response.text).toContain("Capability");
		expect(response.text).toContain("Band");
		expect(response.text).toContain("Closing Date");
		expect(response.text).toContain("Status");
	});

	it("should only display open job roles", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", ["authSession=token"]);

		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Test Engineer");
		expect(response.text).toContain("Business Analyst");
		expect(response.text).not.toContain("Delivery Manager");
		expect(response.text).not.toContain("CLOSED");
	});

	it("should render closing dates as DD/MM/YYYY", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", ["authSession=token"]);

		expect(response.text).toContain("15/08/2026");
		expect(response.text).toContain("30/08/2026");
		expect(response.text).toContain("01/09/2026");
	});

	it("should render fallback placeholders for missing values", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", ["authSession=token"]);

		expect(response.text).toContain("<td>-</td>");
	});

	it("should request job roles from the API service endpoint", async () => {
		await request(app).get("/job-roles").set("Cookie", ["authSession=token"]);

		expect(mockedAxios.get).toHaveBeenCalledWith(
			"http://localhost:3001/job-roles",
		);
	});

	it("should render empty-state row when API call fails", async () => {
		mockedAxios.get.mockRejectedValueOnce(new Error("API unavailable"));

		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", ["authSession=token"]);

		expect(response.status).toBe(200);
		expect(response.text).toContain(
			"No open job roles are available right now.",
		);
	});
});
