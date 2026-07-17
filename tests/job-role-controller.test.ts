import axios from "axios";
import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../src/controllers/job-role-controller";
import { JobRoleCreateMapper } from "../src/mappers/job-role-create-mapper";
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
	const mockedGetBands = vi.fn<JobRoleService["getBands"]>();
	const mockedGetCapabilities = vi.fn<JobRoleService["getCapabilities"]>();
	const mockedCreateJobRole = vi.fn<JobRoleService["createJobRole"]>();
	const mockedDeleteJobRole = vi.fn<JobRoleService["deleteJobRole"]>();

	const jobRoleService: Pick<
		JobRoleService,
		| "getJobRoles"
		| "getJobRoleById"
		| "deleteJobRole"
		| "getBands"
		| "getCapabilities"
		| "createJobRole"
	> = {
		getJobRoles: mockedGetJobRoles,
		getJobRoleById: mockedGetJobRoleById,
		deleteJobRole: mockedDeleteJobRole,
		getBands: mockedGetBands,
		getCapabilities: mockedGetCapabilities,
		createJobRole: mockedCreateJobRole,
	};

	let controller: JobRoleController;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.restoreAllMocks();
		controller = new JobRoleController(
			jobRoleService as JobRoleService,
			new JobRoleCreateMapper(),
		);
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
			query: { forbidden: "1", created: "1" },
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();

		await controller.getJobRolesPage(req, res);

		expect(mockedGetJobRoles).toHaveBeenCalledWith("token");
		expect(res.render).toHaveBeenCalledWith("job-role-list", {
			jobRoles: [],
			roleCreated: true,
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
			roleCreated: false,
			deletedMessage: "Job role deleted successfully.",
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
			roleCreated: false,
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

	it("getAddJobRolePage renders add view with bands and capabilities", async () => {
		mockedGetBands.mockResolvedValueOnce([{ id: 1, name: "Band 1" }]);
		mockedGetCapabilities.mockResolvedValueOnce([
			{ id: 10, name: "Engineering" },
		]);
		const req = {
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();
		const next = vi.fn();

		await controller.getAddJobRolePage(req, res, next);

		expect(res.render).toHaveBeenCalledWith("job-role-add", {
			bands: [{ id: 1, name: "Band 1" }],
			capabilities: [{ id: 10, name: "Engineering" }],
			values: {
				name: "",
				location: "",
				capabilityId: "",
				bandId: "",
				closingDate: "",
				description: "",
				sharepointUrl: "",
				responsibilities: "",
				numberOfOpenPositions: "",
			},
			errors: undefined,
		});
	});

	it("getAddJobRolePage renders 502 error when dropdown data lookup fails", async () => {
		mockedGetBands.mockRejectedValueOnce(new Error("backend unavailable"));
		const req = {
			cookies: { authSession: "token" },
		} as unknown as Request;
		const res = createResponse();
		const next = vi.fn();

		await controller.getAddJobRolePage(req, res, next);

		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 502,
			message:
				"Could not load the add role page right now. Please try again later.",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("postAddJobRole re-renders add form with field errors", async () => {
		mockedGetBands.mockResolvedValueOnce([{ id: 1, name: "Band 1" }]);
		mockedGetCapabilities.mockResolvedValueOnce([
			{ id: 10, name: "Engineering" },
		]);
		const req = {
			cookies: { authSession: "token" },
			body: {
				name: "",
				location: "",
				bandId: "",
				capabilityId: "",
				closingDate: "",
			},
		} as unknown as Request;
		const res = createResponse();
		res.locals.errors = {
			name: ["Job role name is required."],
		};
		const next = vi.fn();

		await controller.postAddJobRole(req, res, next);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-add",
			expect.objectContaining({
				errors: {
					name: ["Job role name is required."],
				},
				values: expect.objectContaining({
					name: "",
				}),
			}),
		);
		expect(mockedCreateJobRole).not.toHaveBeenCalled();
	});

	it("postAddJobRole creates role and redirects when payload is valid", async () => {
		mockedCreateJobRole.mockResolvedValueOnce(undefined);
		const req = {
			cookies: { authSession: "token" },
			body: {
				name: "Principal Engineer",
				location: "Belfast",
				capabilityId: "10",
				bandId: "2",
				closingDate: "2026-12-31",
				description: " Lead technical delivery. ",
				sharepointUrl: " https://example.com/spec ",
				responsibilities: "Lead delivery\n\nMentor engineers",
				numberOfOpenPositions: "3",
			},
		} as unknown as Request;
		const res = createResponse();
		res.locals.validatedBody = {
			name: "Principal Engineer",
			location: "Belfast",
			capabilityId: 10,
			bandId: 2,
			closingDate: "2026-12-31",
			description: "Lead technical delivery.",
			sharepointUrl: "https://example.com/spec",
			responsibilities: "Lead delivery\n\nMentor engineers",
			numberOfOpenPositions: 3,
		};
		const next = vi.fn();

		await controller.postAddJobRole(req, res, next);

		expect(mockedCreateJobRole).toHaveBeenCalledWith("token", {
			name: "Principal Engineer",
			location: "Belfast",
			capabilityId: 10,
			bandId: 2,
			closingDate: "2026-12-31",
			description: "Lead technical delivery.",
			sharepointUrl: "https://example.com/spec",
			responsibilities: "Lead delivery\n\nMentor engineers",
			numberOfOpenPositions: 3,
		});
		expect(res.redirect).toHaveBeenCalledWith("/job-roles?created=1");
	});

	it("postAddJobRole renders error page when backend returns 400", async () => {
		const axiosError = {
			response: {
				status: 400,
				data: { message: "Invalid band or capability" },
			},
		};
		mockedCreateJobRole.mockRejectedValueOnce(axiosError);
		vi.spyOn(axios, "isAxiosError").mockReturnValueOnce(true);
		const req = {
			cookies: { authSession: "token" },
			body: {
				name: "Principal Engineer",
				location: "Belfast",
				capabilityId: "10",
				bandId: "2",
				closingDate: "2026-12-31",
				description: "",
				sharepointUrl: "",
				responsibilities: "",
				numberOfOpenPositions: "0",
			},
		} as unknown as Request;
		const res = createResponse();
		res.locals.validatedBody = {
			name: "Principal Engineer",
			location: "Belfast",
			capabilityId: 10,
			bandId: 2,
			closingDate: "2026-12-31",
			description: "",
			sharepointUrl: "",
			responsibilities: "",
			numberOfOpenPositions: 0,
		};
		const next = vi.fn();

		await controller.postAddJobRole(req, res, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 400,
			message: "Invalid band or capability",
		});
	});

	it("postAddJobRole passes non-400 errors to next", async () => {
		mockedCreateJobRole.mockRejectedValueOnce(new Error("down"));
		vi.spyOn(axios, "isAxiosError").mockReturnValueOnce(false);
		const req = {
			cookies: { authSession: "token" },
			body: {
				name: "Principal Engineer",
				location: "Belfast",
				capabilityId: "10",
				bandId: "2",
				closingDate: "2026-12-31",
				description: "",
				sharepointUrl: "",
				responsibilities: "",
				numberOfOpenPositions: "0",
			},
		} as unknown as Request;
		const res = createResponse();
		res.locals.validatedBody = {
			name: "Principal Engineer",
			location: "Belfast",
			capabilityId: 10,
			bandId: 2,
			closingDate: "2026-12-31",
			description: "",
			sharepointUrl: "",
			responsibilities: "",
			numberOfOpenPositions: 0,
		};
		const next = vi.fn();

		await controller.postAddJobRole(req, res, next);

		expect(next).toHaveBeenCalledWith(expect.any(Error));
	});
});
