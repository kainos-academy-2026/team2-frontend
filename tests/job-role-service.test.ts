import { beforeEach, describe, expect, it, vi } from "vitest";
import apiURL from "../src/config/backend";
import { JobRoleMapper } from "../src/mappers/job-role-mapper";
import {
	ForbiddenError,
	JobRoleService,
} from "../src/services/job-role-service";
import { JobRoleStatus } from "../src/types/job-role";

vi.mock("../src/config/backend", () => ({
	default: {
		get: vi.fn(),
	},
}));

const mockedApiURL = vi.mocked(apiURL, true);
const TEST_TOKEN = "test-token";

describe("JobRoleService", () => {
	let service: JobRoleService;

	beforeEach(() => {
		service = new JobRoleService(new JobRoleMapper());
		mockedApiURL.get.mockReset();
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

	it("should throw ForbiddenError when getJobRoles receives 403", async () => {
		mockedApiURL.get.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 403 },
			message: "Forbidden",
		});

		await expect(service.getJobRoles(TEST_TOKEN)).rejects.toThrow(
			ForbiddenError,
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

	it("should throw ForbiddenError when getJobRoleById receives 403", async () => {
		mockedApiURL.get.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 403 },
			message: "Forbidden",
		});

		await expect(service.getJobRoleById("1", TEST_TOKEN)).rejects.toThrow(
			ForbiddenError,
		);
	});
});
