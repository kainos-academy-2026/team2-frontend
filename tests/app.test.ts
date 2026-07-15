import axios from "axios";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app";
import apiURL from "../src/config/backend";
import { authService } from "../src/routes/auth-router";

vi.mock("axios");
vi.mock("../src/config/backend", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

const mockedAxios = vi.mocked(axios, true);
const mockedApiURL = vi.mocked(apiURL, true);

const getSetCookieHeader = (header: string | string[] | undefined) => {
	if (Array.isArray(header)) {
		return header.join(";");
	}

	return header ?? "";
};

const createJwtToken = (exp: number, payload: Record<string, unknown> = {}) => {
	const header = Buffer.from(
		JSON.stringify({ alg: "none", typ: "JWT" }),
	).toString("base64url");
	const body = Buffer.from(JSON.stringify({ exp, ...payload })).toString(
		"base64url",
	);

	return `${header}.${body}.signature`;
};

const AUTH_SESSION_TOKEN = createJwtToken(
	Math.floor(Date.now() / 1000) + 3600,
	{
		id: 123,
		role: "user",
	},
);

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

const createJwtToken = (
	exp: number,
	extraClaims: Record<string, unknown> = {},
) => {
	const header = Buffer.from(
		JSON.stringify({ alg: "none", typ: "JWT" }),
	).toString("base64url");
	const payload = Buffer.from(JSON.stringify({ exp, ...extraClaims })).toString(
		"base64url",
	);
	return `${header}.${payload}.signature`;
};

const validToken = createJwtToken(Math.floor(Date.now() / 1000) + 3600, {
	role: "user",
});

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
	mockedAxios.get.mockReset();
	mockedAxios.post.mockReset();
	mockedAxios.isAxiosError.mockReset();
	mockedApiURL.get.mockReset();
	mockedApiURL.post.mockReset();
	mockedApiURL.get.mockResolvedValue({ data: sampleApiJobRoles });
	mockedApiURL.post.mockResolvedValue({ data: {} });
	mockedAxios.isAxiosError.mockReturnValue(false);
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
	it("should redirect to /job-roles", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles");
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

	it("GET /login should render login page for authenticated users", async () => {
		const response = await request(app)
			.get("/login")
			.set("Cookie", [`authSession=${validToken}`]);

		expect(response.status).toBe(200);
		expect(response.text).toContain("Sign In");
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

	it("POST /login should redirect to / and set authSession cookie on successful login with cookie set", async () => {
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
		expect(response.headers.location).toBe("/");
		expect(getSetCookieHeader(response.headers["set-cookie"])).toContain(
			"authSession=",
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

describe("GET /public/register.css", () => {
	it("should serve static assets", async () => {
		const response = await request(app).get("/public/register.css");

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toMatch(/text\/css/);
	});
});

describe("POST /register", () => {
	it("should re-render the form when required fields are missing", async () => {
		const response = await request(app).post("/register").send({
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
		});

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toMatch(/html/);
	});

	it("should re-render the form when passwords do not match", async () => {
		const response = await request(app).post("/register").send({
			fullName: "Jane Smith",
			email: "jane.smith@example.com",
			password: "Password1!",
			confirmPassword: "Password2!",
		});

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toMatch(/html/);
	});

	it("should call backend registration API and redirect to login", async () => {
		const response = await request(app).post("/register").send({
			fullName: "Jane Smith",
			email: "jane.smith@example.com",
			password: "Password1!",
			confirmPassword: "Password1!",
		});

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
		expect(mockedApiURL.post).toHaveBeenCalledWith("/register", {
			fullName: "Jane Smith",
			email: "jane.smith@example.com",
			password: "Password1!",
		});
	});

	it("should re-render the form when backend registration fails", async () => {
		mockedApiURL.post.mockRejectedValueOnce(new Error("backend unavailable"));

		const response = await request(app).post("/register").send({
			fullName: "Jane Smith",
			email: "jane.smith@example.com",
			password: "Password1!",
			confirmPassword: "Password1!",
		});

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toMatch(/html/);
	});
});

describe("GET /job-roles", () => {
	it("should redirect unauthenticated users to login", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});

	it("should return 200 for authenticated users", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", [`authSession=${validToken}`]);

		expect(response.status).toBe(200);
	});

	it("should return HTML content", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", [`authSession=${validToken}`]);

		expect(response.headers["content-type"]).toMatch(/html/);
	});

	it("should render a logout form for authenticated users", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", [`authSession=${validToken}`]);

		expect(response.text).toContain('form action="/logout" method="POST"');
		expect(response.text).toContain("Log Out");
	});

	it("should render the job roles table headers", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", [`authSession=${validToken}`]);

		expect(response.text).toContain("Role Name");
		expect(response.text).toContain("Location");
		expect(response.text).toContain("Capability");
		expect(response.text).toContain("Band");
		expect(response.text).toContain("Closing Date");
	});

	it("should only display open job roles", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", [`authSession=${validToken}`]);

		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Test Engineer");
		expect(response.text).toContain("Business Analyst");
		expect(response.text).not.toContain("Delivery Manager");
		expect(response.text).not.toContain("CLOSED");
	});

	it("should render role names as links to detail pages", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", [`authSession=${validToken}`]);

		expect(response.text).toContain('href="/job-roles/1"');
		expect(response.text).toContain('href="/job-roles/2"');
		expect(response.text).toContain('href="/job-roles/3"');
	});

	it("should render closing dates for open roles", async () => {
		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", [`authSession=${validToken}`]);

		expect(response.text).toContain("<td>2026-12-31</td>");
		expect(response.text).toContain("<td>2026-09-30</td>");
		expect(response.text).toContain("<td>2026-11-15</td>");
	});

	it("should render fallback placeholders for missing values", async () => {
		mockedApiURL.get.mockResolvedValueOnce({
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
			.set("Cookie", [`authSession=${validToken}`]);

		expect(response.text).toMatch(/<td>\s*-\s*<\/td>/);
	});

	it("should request job roles from the API service endpoint", async () => {
		await request(app)
			.get("/job-roles")
			.set("Cookie", [`authSession=${validToken}`]);

		expect(mockedApiURL.get).toHaveBeenCalledWith("/job-roles", {
			headers: { Authorization: `Bearer ${validToken}` },
		});
	});

	it("should render error page when API call fails", async () => {
		mockedApiURL.get.mockRejectedValueOnce(new Error("API unavailable"));

		const response = await request(app)
			.get("/job-roles")
			.set("Cookie", [`authSession=${validToken}`]);

		expect(response.status).toBe(500);
		expect(response.text).toContain("Something went wrong");
	});
});

describe("GET /job-roles/:id", () => {
	it("should show job role details including specification", async () => {
		const response = await request(app)
			.get("/job-roles/1")
			.set("Cookie", [`authSession=${validToken}`]);

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
		mockedAxios.isAxiosError.mockReturnValueOnce(true);
		mockedApiURL.get.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 404 },
			message: "Not Found",
		});

		const response = await request(app)
			.get("/job-roles/999")
			.set("Cookie", [`authSession=${validToken}`]);

		expect(response.status).toBe(404);
		expect(response.text).toContain("Job role not found.");
	});
});

describe("Static assets and error middleware", () => {
	it("GET /styles.css should return stylesheet content", async () => {
		const response = await request(app).get("/styles.css");

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toMatch(/text\/css/);
	});

	it("error middleware should not render when headers are already sent", () => {
		type ErrorHandler = (...args: unknown[]) => unknown;
		type RouterLayer = { handle: ErrorHandler };
		const appWithRouters = app as unknown as {
			_router?: { stack?: RouterLayer[] };
			router?: { stack?: RouterLayer[] };
		};

		const stack =
			appWithRouters._router?.stack ?? appWithRouters.router?.stack ?? [];

		const errorLayer = [...stack]
			.reverse()
			.find(
				(layer) =>
					typeof layer.handle === "function" && layer.handle.length === 4,
			);

		expect(errorLayer).toBeDefined();

		const res = {
			headersSent: true,
			status: vi.fn(),
			render: vi.fn(),
		};

		errorLayer?.handle(new Error("boom"), {}, res, vi.fn());

		expect(res.status).not.toHaveBeenCalled();
		expect(res.render).not.toHaveBeenCalled();
	});

	it("error middleware logs unknown errors when non-Error values are thrown", () => {
		type ErrorHandler = (...args: unknown[]) => unknown;
		type RouterLayer = { handle: ErrorHandler };
		const appWithRouters = app as unknown as {
			_router?: { stack?: RouterLayer[] };
			router?: { stack?: RouterLayer[] };
		};

		const stack =
			appWithRouters._router?.stack ?? appWithRouters.router?.stack ?? [];

		const errorLayer = [...stack]
			.reverse()
			.find(
				(layer) =>
					typeof layer.handle === "function" && layer.handle.length === 4,
			);

		expect(errorLayer).toBeDefined();

		const res = {
			headersSent: false,
			status: vi.fn().mockReturnThis(),
			render: vi.fn(),
		};
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);

		errorLayer?.handle("boom", {}, res, vi.fn());

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Unhandled application error",
			expect.objectContaining({ error: "Unknown error" }),
		);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalled();

		consoleErrorSpy.mockRestore();
	});
});
