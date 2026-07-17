import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiURL from "../src/config/backend";
import { JobRoleMapper } from "../src/mappers/job-role-mapper";
import { JobRoleService } from "../src/services/job-role-service";
import { JobRoleStatus } from "../src/types/job-role";

vi.mock("../src/config/backend", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}));

const mockedApiURL = vi.mocked(apiURL, true);
const TEST_TOKEN = "test-token";

describe("JobRoleService", () => {
	let service: JobRoleService;

	beforeEach(() => {
		service = new JobRoleService(new JobRoleMapper());
		mockedApiURL.get.mockReset();
		mockedApiURL.post.mockReset();
	});

	it("should fetch bands from API endpoint with Authorization header", async () => {
		mockedApiURL.get.mockResolvedValueOnce({
			data: [
				{ id: 1, name: "Band 1" },
				{ id: 2, name: "Band 2" },
			],
		});

		const bands = await service.getBands(TEST_TOKEN);

		expect(mockedApiURL.get).toHaveBeenCalledWith("/bands", {
			headers: { Authorization: `Bearer ${TEST_TOKEN}` },
		});
		expect(bands).toEqual([
			{ id: 1, name: "Band 1" },
			{ id: 2, name: "Band 2" },
		]);
	});

	it("should fetch capabilities from API endpoint with Authorization header", async () => {
		mockedApiURL.get.mockResolvedValueOnce({
			data: [
				{ id: 10, name: "Engineering" },
				{ id: 20, name: "Design" },
			],
		});

		const capabilities = await service.getCapabilities(TEST_TOKEN);

		expect(mockedApiURL.get).toHaveBeenCalledWith("/capabilities", {
			headers: { Authorization: `Bearer ${TEST_TOKEN}` },
		});
		expect(capabilities).toEqual([
			{ id: 10, name: "Engineering" },
			{ id: 20, name: "Design" },
		]);
	});

	it("should post create role payload with Authorization header", async () => {
		mockedApiURL.post.mockResolvedValueOnce({ data: {} });

		await service.createJobRole(TEST_TOKEN, {
			name: "Principal Engineer",
			location: "Belfast",
			capabilityId: 10,
			bandId: 2,
			closingDate: "2026-12-31",
			description: "Lead technical delivery.",
			sharepointUrl: "https://example.com/spec",
			responsibilities: ["Lead delivery", "Mentor developers"],
			numberOfOpenPositions: 1,
		});

		expect(mockedApiURL.post).toHaveBeenCalledWith(
			"/job-roles",
			{
				name: "Principal Engineer",
				location: "Belfast",
				capabilityId: 10,
				bandId: 2,
				closingDate: "2026-12-31",
				description: "Lead technical delivery.",
				sharepointUrl: "https://example.com/spec",
				responsibilities: ["Lead delivery", "Mentor developers"],
				numberOfOpenPositions: 1,
			},
			{
				headers: { Authorization: `Bearer ${TEST_TOKEN}` },
			},
		);
	});

	it("should fetch job roles from API endpoint with Authorization header", async () => {
		mockedApiURL.get.mockResolvedValue({ data: [] });

		await service.getJobRoles(TEST_TOKEN);

		expect(mockedApiURL.get).toHaveBeenCalledWith("/job-roles", {
			headers: { Authorization: `Bearer ${TEST_TOKEN}` },
		});
	});

	it("should map API roleName to UI name", async () => {
		mockedApiURL.get.mockResolvedValue({
			data: [
				{
					jobRoleId: 42,
					roleName: "Software Engineer",
					location: "Belfast",
					capability: "Engineering",
					band: "3",
					closingDate: "2026-08-15",
					status: "OPEN",
				},
			],
		});

		const jobRoles = await service.getJobRoles(TEST_TOKEN);

		expect(jobRoles).toEqual([
			{
				id: "42",
				name: "Software Engineer",
				location: "Belfast",
				capability: "Engineering",
				band: "3",
				closingDate: "2026-08-15",
				status: "OPEN",
				description: undefined,
				responsibilities: undefined,
				sharepointUrl: undefined,
				numberOfOpenPositions: 0,
			},
		]);
	});

	it("should rethrow API errors", async () => {
		mockedApiURL.get.mockRejectedValue(new Error("API unavailable"));

		await expect(service.getJobRoles(TEST_TOKEN)).rejects.toThrow(
			"API unavailable",
		);
	});

	it("should fetch a single job role by id with Authorization header", async () => {
		mockedApiURL.get.mockResolvedValueOnce({
			data: {
				jobRoleId: 11,
				roleName: "Test Engineer",
				location: "Christchurch",
				capability: "QA",
				band: "B2",
				closingDate: "2026-08-15",
				status: "OPEN",
				description: "Owns quality strategy and test automation.",
				responsibilities: "Defines quality gates and automation standards.",
				sharepointUrl: "https://example.com/qa",
				numberOfOpenPositions: 2,
			},
		});

		const jobRole = await service.getJobRoleById("11", TEST_TOKEN);

		expect(mockedApiURL.get).toHaveBeenCalledWith("/job-roles/11", {
			headers: { Authorization: `Bearer ${TEST_TOKEN}` },
		});
		expect(jobRole).toEqual({
			id: "11",
			name: "Test Engineer",
			location: "Christchurch",
			capability: "QA",
			band: "B2",
			closingDate: "2026-08-15",
			status: JobRoleStatus.OPEN,
			description: "Owns quality strategy and test automation.",
			responsibilities: "Defines quality gates and automation standards.",
			sharepointUrl: "https://example.com/qa",
			numberOfOpenPositions: 2,
		});
	});

	it("should return null when API responds with 404", async () => {
		mockedApiURL.get.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 404 },
			message: "Not found",
		});

		const jobRole = await service.getJobRoleById("missing", TEST_TOKEN);

		expect(jobRole).toBeNull();
	});

	it("should return null when API returns an empty array for a role", async () => {
		mockedApiURL.get.mockResolvedValueOnce({ data: [] });

		const jobRole = await service.getJobRoleById("missing", TEST_TOKEN);

		expect(jobRole).toBeNull();
	});

	it("should throw a normalized error for non-404 axios errors", async () => {
		mockedApiURL.get.mockRejectedValueOnce({ message: "socket hang up" });
		vi.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

		await expect(service.getJobRoleById("1", TEST_TOKEN)).rejects.toThrow(
			"Failed to fetch job role: socket hang up",
		);
	});

	it("should throw a generic error for non-axios errors", async () => {
		mockedApiURL.get.mockRejectedValueOnce(new Error("unexpected"));
		vi.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

		await expect(service.getJobRoleById("1", TEST_TOKEN)).rejects.toThrow(
			"An unexpected error occurred while fetching the job role.",
		);
	});

	it("should return null when API returns an empty array payload", async () => {
		mockedApiURL.get.mockResolvedValueOnce({ data: [] });

		const jobRole = await service.getJobRoleById("missing", TEST_TOKEN);

		expect(jobRole).toBeNull();
	});

	it("should throw normalized axios error for non-403/404 failures", async () => {
		mockedApiURL.get.mockRejectedValueOnce({ message: "socket hang up" });
		vi.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);

		await expect(service.getJobRoleById("1", TEST_TOKEN)).rejects.toThrow(
			"Failed to fetch job role: socket hang up",
		);
	});

	it("should throw generic error for non-axios failures", async () => {
		mockedApiURL.get.mockRejectedValueOnce(new Error("boom"));
		vi.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);

		await expect(service.getJobRoleById("1", TEST_TOKEN)).rejects.toThrow(
			"An unexpected error occurred while fetching the job role.",
		);
	});
});
