import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getJobRoleById, getJobRoles } from "../src/services/job-role-service";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, true);

describe("getJobRoles", () => {
	beforeEach(() => {
		mockedAxios.get.mockReset();
	});

	it("should fetch job roles from API endpoint", async () => {
		mockedAxios.get.mockResolvedValue({ data: [] });

		await getJobRoles();

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

		const jobRoles = await getJobRoles();

		expect(jobRoles).toEqual([
			{
				id: "42",
				name: "Software Engineer",
				location: "",
				capability: "",
				band: "",
				closingDate: "",
				status: "OPEN",
				specification: "",
			},
		]);
	});

	it("should map roleName and default missing status to OPEN", async () => {
		mockedAxios.get.mockResolvedValue({
			data: [
				{
					roleId: "77",
					roleName: "  Platform Engineer  ",
					location: " Dublin ",
					capability: " Engineering ",
					band: " Band 3 ",
					closingDate: "2026-09-01T00:00:00.000Z",
					specification: " Build APIs and platform tooling. ",
				},
			],
		});

		const jobRoles = await getJobRoles();

		expect(jobRoles).toEqual([
			{
				id: "77",
				name: "Platform Engineer",
				location: "Dublin",
				capability: "Engineering",
				band: "Band 3",
				closingDate: "2026-09-01T00:00:00.000Z",
				status: "OPEN",
				specification: "Build APIs and platform tooling.",
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
				specification: "Owns quality strategy and test automation.",
			},
		});

		const jobRole = await getJobRoleById("11");

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
			status: "OPEN",
			specification: "Owns quality strategy and test automation.",
		});
	});

	it("should return null when API responds with 404", async () => {
		mockedAxios.get.mockRejectedValue({
			isAxiosError: true,
			response: { status: 404 },
			message: "Not found",
		});

		const jobRole = await getJobRoleById("missing");

		expect(jobRole).toBeNull();
	});
});
