import axios from "axios";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, true);

const sampleApiJobRoles = [
	{
		id: "1",
		roleName: "Software Engineer",
		description: "Build and maintain production software systems.",
		specification: "Build and maintain production software systems.",
		responsibilities: "Design, build, and support core services.",
		sharepointUrl: "https://example.com/software-engineer",
		numberOfOpenPositions: 2,
		status: "OPEN",
	},
	{
		id: "2",
		roleName: "Test Engineer",
		description: "Create and execute robust testing strategies.",
		specification: "Create and execute robust testing strategies.",
		responsibilities: "Own test automation and release confidence.",
		sharepointUrl: "https://example.com/test-engineer",
		numberOfOpenPositions: 1,
		status: "OPEN",
	},
	{
		id: "3",
		roleName: "Business Analyst",
		description: "Translate business needs into clear requirements.",
		specification: "Translate business needs into clear requirements.",
		responsibilities: "Facilitate workshops and define requirements.",
		sharepointUrl: "",
		numberOfOpenPositions: 3,
		status: "OPEN",
	},
	{
		id: "4",
		roleName: "Delivery Manager",
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
	it("should return 200", async () => {
		const response = await request(app).get("/");

		expect(response.status).toBe(200);
	});

	it("should return HTML content", async () => {
		const response = await request(app).get("/");

		expect(response.headers["content-type"]).toMatch(/html/);
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
		expect(response.text).toContain("Status");
		expect(response.text).toContain("Open Positions");
		expect(response.text).toContain("Description");
		expect(response.text).toContain("Responsibilities");
		expect(response.text).toContain("SharePoint");
	});

	it("should only display open job roles", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Test Engineer");
		expect(response.text).toContain("Business Analyst");
		expect(response.text).not.toContain("Delivery Manager");
		expect(response.text).not.toContain("CLOSED");
	});

	it("should render role names as links to detail pages", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.text).toContain('href="/job-roles/1"');
		expect(response.text).toContain('href="/job-roles/2"');
		expect(response.text).toContain('href="/job-roles/3"');
	});

	it("should render open position counts", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.text).toContain("<td>2</td>");
		expect(response.text).toContain("<td>1</td>");
		expect(response.text).toContain("<td>3</td>");
	});

	it("should render fallback placeholders for missing values", async () => {
		const response = await request(app).get("/job-roles");

		expect(response.text).toMatch(/<td>\s*-\s*<\/td>/);
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

describe("GET /job-roles/:id", () => {
	it("should show job role details including specification", async () => {
		const response = await request(app).get("/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.headers["content-type"]).toMatch(/html/);
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Specification");
		expect(response.text).toContain("Description");
		expect(response.text).toContain("Responsibilities");
		expect(response.text).toContain("SharePoint");
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
