import { beforeEach, describe, expect, it, vi } from "vitest";
import apiURL from "../src/config/backend";
import { JobRoleMapper } from "../src/mappers/job-role-mapper";
import { JobRoleService } from "../src/services/job-role-service";
import { JobRoleStatus } from "../src/types/job-role";

vi.mock("../src/config/backend", () => ({
	default: {
		get: vi.fn(),
	},
}));

const mockedApiURL = vi.mocked(apiURL, true);
describe("JobRoleService", () => {
	let service: JobRoleService;

	beforeEach(() => {
		service = new JobRoleService(new JobRoleMapper());
		mockedApiURL.get.mockReset();
	});

	it("should fetch job roles from API endpoint", async () => {
		mockedApiURL.get.mockResolvedValue({ data: [] });

		await service.getJobRoles();

		expect(mockedApiURL.get).toHaveBeenCalledWith("/job-roles");
	});

	it("should map API roleName to UI name", async () => {
		mockedApiURL.get.mockResolvedValue({
			data: [
				{
					roleName: "Software Engineer",
					location: "Belfast",
					capability: "Engineering",
					band: "3",
					closingDate: "2026-08-15",
					status: "OPEN",
				},
			],
		});

		const jobRoles = await service.getJobRoles();

		expect(jobRoles).toEqual([
			{
				id: "42",
				name: "Software Engineer",
				location: "Belfast",
				capability: "Engineering",
				band: "3",
				closingDate: "2026-08-15",
				status: "OPEN",
			},
		]);
	});

	it("should rethrow API errors", async () => {
		mockedApiURL.get.mockRejectedValue(new Error("API unavailable"));

		await expect(service.getJobRoles()).rejects.toThrow("API unavailable");
	});

	it("should fetch a single job role by id", async () => {
		mockedAxios.get.mockResolvedValue({
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

		const jobRole = await service.getJobRoleById("11");

		expect(mockedAxios.get).toHaveBeenCalledWith(
			"http://localhost:3001/job-roles/11",
		);
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
		mockedAxios.get.mockRejectedValue({
			isAxiosError: true,
			response: { status: 404 },
			message: "Not found",
		});

		const jobRole = await service.getJobRoleById("missing");

		expect(jobRole).toBeNull();
	});
});
