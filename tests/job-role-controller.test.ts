import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../src/controllers/job-role-controller";
import { ForbiddenError } from "../src/errors/forbidden-error";
import type { JobRoleService } from "../src/services/job-role-service";
import { JobRoleStatus } from "../src/types/job-role";

const createResponse = () => {
	const res: Partial<Response> = {
		status: vi.fn(),
		render: vi.fn(),
		redirect: vi.fn(),
		locals: {
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
	const mockedGetJobRoles = vi.fn<JobRoleService["getJobRoles"]>();
	const mockedGetJobRoleById = vi.fn<JobRoleService["getJobRoleById"]>();

	const jobRoleService: Pick<JobRoleService, "getJobRoles" | "getJobRoleById"> =
		{
			getJobRoles: mockedGetJobRoles,
			getJobRoleById: mockedGetJobRoleById,
		};

	let controller: JobRoleController;

	beforeEach(() => {
		vi.clearAllMocks();
		controller = new JobRoleController(jobRoleService as JobRoleService);
	});

	it("getJobRolesPage returns early when token is missing", async () => {
		const req = { query: {} } as unknown as Request;
		const res = createResponse();

		await controller.getJobRolesPage(req, res);

		expect(mockedGetJobRoles).not.toHaveBeenCalled();
	});

	it("getJobRolesPage renders roles and forbidden banner state", async () => {
		mockedGetJobRoles.mockResolvedValueOnce([]);
		const req = {
			query: { forbidden: "1" },
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();

		await controller.getJobRolesPage(req, res);

		expect(mockedGetJobRoles).toHaveBeenCalledWith("token");
		expect(res.render).toHaveBeenCalledWith("job-role-list", {
			jobRoles: [],
		});
	});

	it("getJobRolesPage renders forbidden error when service throws ForbiddenError", async () => {
		mockedGetJobRoles.mockRejectedValueOnce(new ForbiddenError());
		const req = {
			query: {},
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();

		await controller.getJobRolesPage(req, res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 403,
			message: "You do not have permission to access this resource.",
		});
	});

	it("getJobRolesPage renders empty list for generic service errors", async () => {
		mockedGetJobRoles.mockRejectedValueOnce(new Error("down"));
		const req = {
			query: {},
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();

		await controller.getJobRolesPage(req, res);

		expect(res.render).toHaveBeenCalledWith("job-role-list", {
			jobRoles: [],
		});
	});

	it("getJobRoleDetailPage returns early when token is missing", async () => {
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getJobRoleDetailPage(req, res);

		expect(mockedGetJobRoleById).not.toHaveBeenCalled();
	});

	it("getJobRoleDetailPage renders details with applicant flag", async () => {
		mockedGetJobRoleById.mockResolvedValueOnce({
			id: "1",
			name: "Role",
			location: "Belfast",
			capability: "Engineering",
			band: "B2",
			closingDate: "2026-08-15",
			status: JobRoleStatus.OPEN,
			description: "desc",
			responsibilities: "resp",
			sharepointUrl: "",
			numberOfOpenPositions: 1,
		});
		const req = {
			params: { id: "1" },
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();

		await controller.getJobRoleDetailPage(req, res);

		expect(res.render).toHaveBeenCalledWith("job-role-detail", {
			jobRole: expect.objectContaining({ id: "1" }),
			canApply: true,
		});
	});

	it("getJobRoleDetailPage renders not found message when role is missing", async () => {
		mockedGetJobRoleById.mockResolvedValueOnce(null);
		const req = {
			params: { id: "missing" },
			cookies: { authSession: "token" },
		} as unknown as Request;
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
		mockedGetJobRoleById.mockRejectedValueOnce(new ForbiddenError());
		const req = {
			params: { id: "1" },
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();

		await controller.getJobRoleDetailPage(req, res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 403,
			message: "You do not have permission to access this resource.",
		});
	});

	it("getJobRoleDetailPage renders 502 for generic errors", async () => {
		mockedGetJobRoleById.mockRejectedValueOnce(new Error("down"));
		const req = {
			params: { id: "1" },
			cookies: { authSession: "token" },
		} as unknown as Request;
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
