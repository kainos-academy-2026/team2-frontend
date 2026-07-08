import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleStatus } from "../src/models/job-role";
import { JobRoleService } from "../src/services/job-role-service";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, true);
const jobRoleService = new JobRoleService();

describe("getJobRoles", () => {
	beforeEach(() => {
		mockedAxios.get.mockReset();
	});

	it("should fetch job roles from API endpoint", async () => {
		mockedAxios.get.mockResolvedValue({ data: [] });

		await jobRoleService.getJobRoles();

		expect(mockedAxios.get).toHaveBeenCalledWith(
			"http://localhost:3001/job-roles",
		);
	});

	it("should normalize missing fields to empty strings", async () => {
		mockedAxios.get.mockResolvedValue({
			data: [
				{
					id: 42,
					roleName: "  Software Engineer  ",
					status: " OPEN ",
				},
			],
		});

		const jobRoles = await jobRoleService.getJobRoles();

		expect(jobRoles).toEqual([
			{
				id: "42",
				name: "Software Engineer",
				location: "",
				capability: "",
				band: "",
				closingDate: "",
				status: JobRoleStatus.OPEN,
				description: "",
				responsibilities: "",
				sharepointUrl: "",
				numberOfOpenPositions: 0,
				specification: "",
			},
		]);
	});

	it("should map new fields and default missing status to OPEN", async () => {
		mockedAxios.get.mockResolvedValue({
			data: [
				{
					roleId: "77",
					roleName: "  Platform Engineer  ",
					description: " Builds internal platform capabilities. ",
					responsibilities: " Supports teams and improves delivery flow. ",
					sharepointUrl: " https://example.com/team-space ",
					numberOfOpenPositions: 3,
				},
			],
		});

		const jobRoles = await jobRoleService.getJobRoles();

		expect(jobRoles).toEqual([
			{
				id: "77",
				name: "Platform Engineer",
				location: "",
				capability: "",
				band: "",
				closingDate: "",
				status: JobRoleStatus.OPEN,
				description: "Builds internal platform capabilities.",
				responsibilities: "Supports teams and improves delivery flow.",
				sharepointUrl: "https://example.com/team-space",
				numberOfOpenPositions: 3,
				specification: "",
			},
		]);
	});
});

describe("getJobRoleById", () => {
	beforeEach(() => {
		mockedAxios.get.mockReset();
	});

	it("should fetch a single job role by id", async () => {
		mockedAxios.get.mockResolvedValue({
			data: {
				id: "11",
				roleName: "Test Engineer",
				description: "Owns quality strategy and test automation.",
				responsibilities: "Defines quality gates and automation standards.",
				sharepointUrl: "https://example.com/qa",
				numberOfOpenPositions: 2,
			},
		});

		const jobRole = await jobRoleService.getJobRoleById("11");

		expect(mockedAxios.get).toHaveBeenCalledWith(
			"http://localhost:3001/job-roles/11",
		);
		expect(jobRole).toEqual({
			id: "11",
			name: "Test Engineer",
			location: "",
			capability: "",
			band: "",
			closingDate: "",
			status: JobRoleStatus.OPEN,
			description: "Owns quality strategy and test automation.",
			responsibilities: "Defines quality gates and automation standards.",
			sharepointUrl: "https://example.com/qa",
			numberOfOpenPositions: 2,
			specification: "",
		});
	});

	it("should return null when API responds with 404", async () => {
		mockedAxios.get.mockRejectedValue({
			isAxiosError: true,
			response: { status: 404 },
			message: "Not found",
		});

		const jobRole = await jobRoleService.getJobRoleById("missing");

		expect(jobRole).toBeNull();
	});
});
