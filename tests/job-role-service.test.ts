import { beforeEach, describe, expect, it, vi } from "vitest";
import apiURL from "../src/config/backend";
import { JobRoleMapper } from "../src/mappers/job-role-mapper";
import { JobRoleService } from "../src/services/job-role-service";

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
});
