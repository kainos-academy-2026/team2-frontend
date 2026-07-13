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
		jobRoleId: 1,
		roleName: "Software Engineer",
		location: "Wellington",
		capability: "Engineering",
		band: "B2",
		closingDate: "2026-12-31",
		description: "Build and maintain production software systems.",
		specification: "Build and maintain production software systems.",
		responsibilities: "Design, build, and support core services.",
		sharepointUrl: "https://example.com/software-engineer",
		numberOfOpenPositions: 2,
		status: "OPEN",
	},
	{
		jobRoleId: 2,
		roleName: "Test Engineer",
		location: "Auckland",
		capability: "Quality Engineering",
		band: "B2",
		closingDate: "2026-09-30",
		description: "Create and execute robust testing strategies.",
		specification: "Create and execute robust testing strategies.",
		responsibilities: "Own test automation and release confidence.",
		sharepointUrl: "https://example.com/test-engineer",
		numberOfOpenPositions: 1,
		status: "OPEN",
	},
	{
		jobRoleId: 3,
		roleName: "Business Analyst",
		location: "Hamilton",
		capability: "Business Analysis",
		band: "B3",
		closingDate: "2026-11-15",
		description: "Translate business needs into clear requirements.",
		specification: "Translate business needs into clear requirements.",
		responsibilities: "Facilitate workshops and define requirements.",
		sharepointUrl: "",
		numberOfOpenPositions: 3,
		status: "OPEN",
	},
	{
		jobRoleId: 4,
		roleName: "Delivery Manager",
		location: "Remote",
		capability: "Delivery",
		band: "B4",
		closingDate: "2026-10-20",
		description: "Lead delivery plans and cross-team execution.",
		specification: "Lead delivery plans and cross-team execution.",
		responsibilities: "Coordinate plans and remove blockers.",
		sharepointUrl: "https://example.com/delivery-manager",
		numberOfOpenPositions: 1,
		status: "CLOSED",
	},
];

beforeEach(() => {
	mockedAxios.get.mockImplementation((url) => {
		if (url === "http://localhost:3001/job-roles") {
			return Promise.resolve({ data: sampleApiJobRoles });
		}

		if (url === "http://localhost:3001/job-roles/1") {
			return Promise.resolve({ data: sampleApiJobRoles[0] });
		}

		return Promise.reject(new Error("Unexpected URL"));
	});
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

describe("GET /job-roles", () => {
	it("should return 200 for unauthenticated users", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(200);
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

	it("should render role names as links to detail pages", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", ["authSession=token"]);

		expect(response.text).toContain('href="/job-roles/1"');
		expect(response.text).toContain('href="/job-roles/2"');
		expect(response.text).toContain('href="/job-roles/3"');
	});

	it("should render closing dates for open roles", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.text).toContain("<td>2026-12-31</td>");
		expect(response.text).toContain("<td>2026-09-30</td>");
		expect(response.text).toContain("<td>2026-11-15</td>");
	});

	it("should render fallback placeholders for missing values", async () => {
		mockedAxios.get.mockResolvedValueOnce({
			data: [
				{
					jobRoleId: 5,
					roleName: "Data Analyst",
					location: "",
					capability: "",
					band: "",
					closingDate: "",
					description: "",
					responsibilities: "",
					sharepointUrl: "",
					numberOfOpenPositions: 0,
					status: "OPEN",
				},
			],
		});

		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", ["authSession=token"]);

		expect(response.text).toMatch(/<td>\s*-\s*<\/td>/);
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

describe("GET /job-roles/:id", () => {
	it("should show job role details including specification", async () => {
		const response = await request(app).get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toMatch(/html/);
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Specification");
		expect(response.text).toContain("Description");
		expect(response.text).toContain("Responsibilities");
		expect(response.text).toContain("Open SharePoint");
		expect(response.text).toContain(
			"Build and maintain production software systems.",
		);
	});

	it("should return 404 when role does not exist", async () => {
		mockedAxios.get.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 404 },
			message: "Not Found",
		});

		const response = await request(app).get("/job-roles/999");

		expect(response.status).toBe(404);
		expect(response.text).toContain("Job role not found.");
	});
});
