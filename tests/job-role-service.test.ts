import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleService } from "../src/services/job-role-service";

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
			"http://localhost:3000/job-roles",
		);
	});

	it("should normalize missing fields to empty strings", async () => {
		mockedAxios.get.mockResolvedValue({
			data: [
				{
					roleName: "  Software Engineer  ",
					status: " OPEN ",
				},
			],
		});

		const jobRoles = await service.getJobRoles();

		expect(jobRoles).toEqual([
			{
				name: "Software Engineer",
				location: "",
				capability: "",
				band: "",
				closingDate: "",
				status: "OPEN",
			},
		]);
	});

	it("should map roleName and default missing status to OPEN", async () => {
		mockedAxios.get.mockResolvedValue({
			data: [
				{
					roleName: "  Platform Engineer  ",
					location: " Dublin ",
					capability: " Engineering ",
					band: " Band 3 ",
					closingDate: "2026-09-01T00:00:00.000Z",
				},
			],
		});

		const jobRoles = await service.getJobRoles();

		expect(jobRoles).toEqual([
			{
				name: "Platform Engineer",
				location: "Dublin",
				capability: "Engineering",
				band: "Band 3",
				closingDate: "2026-09-01T00:00:00.000Z",
				status: "OPEN",
			},
		]);
	});
});
