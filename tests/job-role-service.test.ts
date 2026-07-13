import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleService } from "../src/services/job-role-service";
import { JobRoleStatus } from "../src/types/job-role";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, true);
const TEST_API_URL = "http://localhost:3001/job-roles";

describe("JobRoleService", () => {
	let service: JobRoleService;

	beforeEach(() => {
		service = new JobRoleService(TEST_API_URL);
		mockedAxios.get.mockReset();
	});

	it("should fetch job roles from API endpoint", async () => {
		mockedAxios.get.mockResolvedValue({ data: [] });

		await service.getJobRoles();

		expect(mockedAxios.get).toHaveBeenCalledWith(
			"http://localhost:3001/job-roles",
		);
	});

	it("should map job roles using the mapper", async () => {
		mockedAxios.get.mockResolvedValue({
			data: [
				{
					jobRoleId: 42,
					roleName: "Software Engineer",
					location: "Wellington",
					capability: "Engineering",
					band: "B2",
					closingDate: "2026-12-31",
					status: " CLOSED ",
					description: "Build systems",
					responsibilities: "Deliver features",
					sharepointUrl: "https://example.com/software-engineer",
					numberOfOpenPositions: 2,
				},
			],
		});

		const jobRoles = await service.getJobRoles();

		expect(jobRoles).toEqual([
			{
				id: "42",
				name: "Software Engineer",
				location: "Wellington",
				capability: "Engineering",
				band: "B2",
				closingDate: "2026-12-31",
				status: JobRoleStatus.CLOSED,
				description: "Build systems",
				responsibilities: "Deliver features",
				sharepointUrl: "https://example.com/software-engineer",
				numberOfOpenPositions: 2,
			},
		]);
	});

	it("should default missing status to OPEN", async () => {
		mockedAxios.get.mockResolvedValue({
			data: [
				{
					jobRoleId: 77,
					roleName: "Platform Engineer",
					location: "Auckland",
					capability: "Platform",
					band: "B3",
					closingDate: "2026-10-01",
					description: "Builds internal platform capabilities.",
					responsibilities: "Supports teams and improves delivery flow.",
					sharepointUrl: "https://example.com/team-space",
					numberOfOpenPositions: 3,
				},
			],
		});

		const jobRoles = await service.getJobRoles();

		expect(jobRoles).toEqual([
			{
				id: "77",
				name: "Platform Engineer",
				location: "Auckland",
				capability: "Platform",
				band: "B3",
				closingDate: "2026-10-01",
				status: JobRoleStatus.OPEN,
				description: "Builds internal platform capabilities.",
				responsibilities: "Supports teams and improves delivery flow.",
				sharepointUrl: "https://example.com/team-space",
				numberOfOpenPositions: 3,
			},
		]);
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
