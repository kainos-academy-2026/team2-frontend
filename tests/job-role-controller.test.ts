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
	const mockedDeleteJobRole = vi.fn<JobRoleService["deleteJobRole"]>();

	const jobRoleService: Pick<
		JobRoleService,
		"getJobRoles" | "getJobRoleById" | "deleteJobRole"
	> = {
		getJobRoles: mockedGetJobRoles,
		getJobRoleById: mockedGetJobRoleById,
		deleteJobRole: mockedDeleteJobRole,
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
			deletedMessage: undefined,
		});
	});

	it("getJobRolesPage renders delete success message when query flag is set", async () => {
		mockedGetJobRoles.mockResolvedValueOnce([]);
		const req = {
			query: { deleted: "1" },
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();

		await controller.getJobRolesPage(req, res);

		expect(res.render).toHaveBeenCalledWith("job-role-list", {
			jobRoles: [],
			deletedMessage: "Job role deleted successfully.",
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
			deletedMessage: undefined,
		});
	});

	it("postDeleteJobRole redirects to login when token is missing", async () => {
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.postDeleteJobRole(req, res);

		expect(mockedDeleteJobRole).not.toHaveBeenCalled();
		expect(res.redirect).toHaveBeenCalledWith("/login");
	});

	it("postDeleteJobRole redirects with success query when delete succeeds", async () => {
		mockedDeleteJobRole.mockResolvedValueOnce();
		const req = {
			params: { id: "1" },
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();

		await controller.postDeleteJobRole(req, res);

		expect(mockedDeleteJobRole).toHaveBeenCalledWith("1", "token");
		expect(res.redirect).toHaveBeenCalledWith("/job-roles?deleted=1");
	});

	it("postDeleteJobRole renders forbidden error when service throws ForbiddenError", async () => {
		mockedDeleteJobRole.mockRejectedValueOnce(new ForbiddenError());
		const req = {
			params: { id: "1" },
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();

		await controller.postDeleteJobRole(req, res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 403,
			message: "You do not have permission to access this resource.",
		});
	});

	it("postDeleteJobRole renders error page for generic delete failures", async () => {
		mockedDeleteJobRole.mockRejectedValueOnce(new Error("down"));
		const req = {
			params: { id: "1" },
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();

		await controller.postDeleteJobRole(req, res);

		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 502,
			message: "Could not delete this job role right now. Please try again.",
		});
	});

	it("postDeleteJobRole renders 404 when backend reports role missing", async () => {
		mockedDeleteJobRole.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 404 },
			message: "Not found",
		});
		const req = {
			params: { id: "1" },
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();

		await controller.postDeleteJobRole(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 404,
			message: "Job role not found.",
		});
	});

	it("postDeleteJobRole clears cookie and redirects on unauthorized response", async () => {
		mockedDeleteJobRole.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 401 },
			message: "Unauthorized",
		});
		const req = {
			params: { id: "1" },
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();
		res.clearCookie = vi.fn() as unknown as Response["clearCookie"];

		await controller.postDeleteJobRole(req, res);

		expect(res.clearCookie).toHaveBeenCalledWith("authSession");
		expect(res.redirect).toHaveBeenCalledWith("/login");
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
