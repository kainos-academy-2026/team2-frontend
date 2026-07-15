import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../src/controllers/job-role-controller";
import {
	ForbiddenError,
	type JobRoleService,
} from "../src/services/job-role-service";

const createResponse = () => {
	const res: Partial<Response> = {
		status: vi.fn(),
		render: vi.fn(),
		redirect: vi.fn(),
		locals: {
			authToken: "token",
			isAdmin: false,
			isApplicant: true,
		},
	};

	(res.status as ReturnType<typeof vi.fn>).mockImplementation(
		() => res as Response,
	);

	return res as Response;
};

describe("JobRoleController", () => {
	const jobRoleService: Pick<JobRoleService, "getJobRoles" | "getJobRoleById"> =
		{
			getJobRoles: vi.fn(),
			getJobRoleById: vi.fn(),
		};

	let controller: JobRoleController;

	beforeEach(() => {
		vi.clearAllMocks();
		controller = new JobRoleController(jobRoleService as JobRoleService);
	});

	it("getJobRolesPage returns early when token is missing", async () => {
		const req = { query: {} } as unknown as Request;
		const res = createResponse();
		res.locals.authToken = undefined;

		await controller.getJobRolesPage(req, res);

		expect(jobRoleService.getJobRoles).not.toHaveBeenCalled();
	});

	it("getJobRolesPage renders roles and forbidden banner state", async () => {
		jobRoleService.getJobRoles.mockResolvedValueOnce([]);
		const req = { query: { forbidden: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getJobRolesPage(req, res);

		expect(jobRoleService.getJobRoles).toHaveBeenCalledWith("token");
		expect(res.render).toHaveBeenCalledWith("job-role-list", {
			jobRoles: [],
			isAdmin: false,
			forbidden: true,
		});
	});

	it("getJobRolesPage renders forbidden error when service throws ForbiddenError", async () => {
		jobRoleService.getJobRoles.mockRejectedValueOnce(new ForbiddenError());
		const req = { query: {} } as unknown as Request;
		const res = createResponse();

		await controller.getJobRolesPage(req, res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 403,
			message: "You do not have permission to access this resource.",
		});
	});

	it("getJobRolesPage renders empty list for generic service errors", async () => {
		jobRoleService.getJobRoles.mockRejectedValueOnce(new Error("down"));
		const req = { query: {} } as unknown as Request;
		const res = createResponse();

		await controller.getJobRolesPage(req, res);

		expect(res.render).toHaveBeenCalledWith("job-role-list", {
			jobRoles: [],
			isAdmin: false,
			forbidden: false,
		});
	});

	it("getJobRoleDetailPage returns early when token is missing", async () => {
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();
		res.locals.authToken = undefined;

		await controller.getJobRoleDetailPage(req, res);

		expect(jobRoleService.getJobRoleById).not.toHaveBeenCalled();
	});

	it("getJobRoleDetailPage renders details with applicant flag", async () => {
		jobRoleService.getJobRoleById.mockResolvedValueOnce({
			id: "1",
			name: "Role",
			location: "Belfast",
			capability: "Engineering",
			band: "B2",
			closingDate: "2026-08-15",
			status: "OPEN",
			description: "desc",
			responsibilities: "resp",
			sharepointUrl: "",
			numberOfOpenPositions: 1,
		});
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getJobRoleDetailPage(req, res);

		expect(res.render).toHaveBeenCalledWith("job-role-detail", {
			jobRole: expect.objectContaining({ id: "1" }),
			isApplicant: true,
			message: "",
			isAdmin: false,
		});
	});

	it("getJobRoleDetailPage renders not found message when role is missing", async () => {
		jobRoleService.getJobRoleById.mockResolvedValueOnce(null);
		const req = { params: { id: "missing" } } as unknown as Request;
		const res = createResponse();

		await controller.getJobRoleDetailPage(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.render).toHaveBeenCalledWith("job-role-detail", {
			jobRole: null,
			isApplicant: true,
			message: "Job role not found.",
			isAdmin: false,
		});
	});

	it("getJobRoleDetailPage renders forbidden error for ForbiddenError", async () => {
		jobRoleService.getJobRoleById.mockRejectedValueOnce(new ForbiddenError());
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getJobRoleDetailPage(req, res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 403,
			message: "You do not have permission to access this resource.",
		});
	});

	it("getJobRoleDetailPage renders 502 for generic errors", async () => {
		jobRoleService.getJobRoleById.mockRejectedValueOnce(new Error("down"));
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getJobRoleDetailPage(req, res);

		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.render).toHaveBeenCalledWith("job-role-detail", {
			jobRole: null,
			isApplicant: true,
			message: "Could not load this job role right now.",
			isAdmin: false,
		});
	});
});
