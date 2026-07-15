import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationController } from "../src/controllers/application-controller";
import type { ApplicationService } from "../src/services/application-service";
import type { JobRoleService } from "../src/services/job-role-service";
import { JobRoleStatus } from "../src/types/job-role";

const createResponse = () => {
	const res: Partial<Response> = {
		status: vi.fn(),
		render: vi.fn(),
		redirect: vi.fn(),
		json: vi.fn(),
		locals: {
			user: { id: 1, role: "user" },
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

const createJobRole = () => ({
	id: "1",
	name: "Software Engineer",
	location: "Wellington",
	capability: "Engineering",
	band: "B2",
	closingDate: "2026-12-31",
	status: JobRoleStatus.OPEN,
	description: "Build things",
	responsibilities: "Build and maintain",
	sharepointUrl: "https://example.com",
	numberOfOpenPositions: 2,
});

describe("ApplicationController", () => {
	const mockedGetUploadUrl = vi.fn<ApplicationService["getUploadUrl"]>();
	const mockedCreateApplication =
		vi.fn<ApplicationService["createApplication"]>();
	const mockedGetJobRoleById = vi.fn<JobRoleService["getJobRoleById"]>();

	const applicationService: Pick<
		ApplicationService,
		"getUploadUrl" | "createApplication"
	> = {
		getUploadUrl: mockedGetUploadUrl,
		createApplication: mockedCreateApplication,
	};
	const jobRoleService: Pick<JobRoleService, "getJobRoleById"> = {
		getJobRoleById: mockedGetJobRoleById,
	};
	let controller: ApplicationController;

	beforeEach(() => {
		vi.clearAllMocks();
		controller = new ApplicationController(
			applicationService as ApplicationService,
			jobRoleService as JobRoleService,
		);
	});

	it("getApplyPage redirects when user is missing", async () => {
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();
		res.locals.user = undefined;

		await controller.getApplyPage(req, res);

		expect(res.redirect).toHaveBeenCalledWith("/job-roles");
	});

	it("getApplyPage redirects when user is admin", async () => {
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();
		res.locals.user = { id: 1, role: "admin" };
		res.locals.isAdmin = true;

		await controller.getApplyPage(req, res);

		expect(res.redirect).toHaveBeenCalledWith("/job-roles");
	});

	it("getApplyPage renders 404 when role is missing", async () => {
		const req = { params: { id: "missing" } } as unknown as Request;
		const res = createResponse();
		res.locals.user = { id: 2, role: "user" };
		mockedGetJobRoleById.mockResolvedValueOnce(null);

		await controller.getApplyPage(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 404,
			message: "The job role you are trying to apply for could not be found.",
		});
	});

	it("getApplyPage renders apply view when role exists", async () => {
		const jobRole = createJobRole();
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();
		res.locals.user = { id: 2, role: "user" };
		mockedGetJobRoleById.mockResolvedValueOnce(jobRole);

		await controller.getApplyPage(req, res);

		expect(res.render).toHaveBeenCalledWith("apply", { jobRole });
	});

	it("getApplyPage renders 502 when role lookup fails", async () => {
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();
		res.locals.user = { id: 2, role: "user" };
		mockedGetJobRoleById.mockRejectedValueOnce(new Error("down"));

		await controller.getApplyPage(req, res);

		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 502,
			message:
				"Could not load the application page right now. Please try again later.",
		});
	});

	it("getUploadUrl returns 403 when user is missing", async () => {
		const req = {
			params: { id: "1" },
			body: { fileName: "cv.pdf", contentType: "application/pdf" },
		} as unknown as Request;
		const res = createResponse();
		res.locals.user = undefined;

		await controller.getUploadUrl(req, res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith({ error: "Forbidden." });
	});

	it("getUploadUrl returns 400 when request body is incomplete", async () => {
		const req = { params: { id: "1" }, body: {} } as unknown as Request;
		const res = createResponse();
		res.locals.user = { id: 2, role: "user" };

		await controller.getUploadUrl(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: "fileName and contentType are required.",
		});
	});

	it("getUploadUrl returns generated upload url details", async () => {
		const req = {
			params: { id: "1" },
			body: { fileName: "cv.pdf", contentType: "application/pdf" },
		} as unknown as Request;
		const res = createResponse();
		res.locals.user = { id: 22, role: "user" };
		mockedGetUploadUrl.mockResolvedValueOnce({
			cvKey: "cvs/job-role-1/user-22/cv.pdf",
			uploadUrl: "https://upload.example.com",
		});

		await controller.getUploadUrl(req, res);

		expect(applicationService.getUploadUrl).toHaveBeenCalledWith("1", {
			userId: 22,
			fileName: "cv.pdf",
			contentType: "application/pdf",
		});
		expect(res.json).toHaveBeenCalledWith({
			cvKey: "cvs/job-role-1/user-22/cv.pdf",
			uploadUrl: "https://upload.example.com",
		});
	});

	it("getUploadUrl returns 502 when upload url service fails", async () => {
		const req = {
			params: { id: "1" },
			body: { fileName: "cv.pdf", contentType: "application/pdf" },
		} as unknown as Request;
		const res = createResponse();
		res.locals.user = { id: 22, role: "user" };
		mockedGetUploadUrl.mockRejectedValueOnce(new Error("down"));

		await controller.getUploadUrl(req, res);

		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.json).toHaveBeenCalledWith({
			error: "Could not generate an upload URL. Please try again.",
		});
	});

	it("postApply redirects when user is missing", async () => {
		const req = {
			params: { id: "1" },
			body: { cvKey: "cv-key" },
		} as unknown as Request;
		const res = createResponse();
		res.locals.user = undefined;

		await controller.postApply(req, res);

		expect(res.redirect).toHaveBeenCalledWith("/job-roles");
	});

	it("postApply returns 400 and role when cvKey is missing", async () => {
		const jobRole = createJobRole();
		const req = {
			params: { id: "1" },
			body: { cvKey: " " },
		} as unknown as Request;
		const res = createResponse();
		res.locals.user = { id: 9, role: "user" };
		mockedGetJobRoleById.mockResolvedValueOnce(jobRole);

		await controller.postApply(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("apply", {
			jobRole,
			error: "Please upload your CV before submitting.",
		});
	});

	it("postApply returns 400 with null role when role lookup fails", async () => {
		const req = {
			params: { id: "1" },
			body: { cvKey: "" },
		} as unknown as Request;
		const res = createResponse();
		res.locals.user = { id: 9, role: "user" };
		mockedGetJobRoleById.mockRejectedValueOnce(new Error("down"));

		await controller.postApply(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("apply", {
			jobRole: null,
			error: "Please upload your CV before submitting.",
		});
	});

	it("postApply creates application with trimmed cvKey then redirects", async () => {
		const req = {
			params: { id: "1" },
			body: { cvKey: "  cv-key  " },
		} as unknown as Request;
		const res = createResponse();
		res.locals.user = { id: 99, role: "user" };

		await controller.postApply(req, res);

		expect(applicationService.createApplication).toHaveBeenCalledWith("1", {
			userId: 99,
			cvKey: "cv-key",
		});
		expect(res.redirect).toHaveBeenCalledWith(
			"/job-roles/1/apply/confirmation",
		);
	});

	it("postApply returns 502 and role when submit fails", async () => {
		const req = {
			params: { id: "1" },
			body: { cvKey: "cv-key" },
		} as unknown as Request;
		const res = createResponse();
		res.locals.user = { id: 99, role: "user" };
		mockedCreateApplication.mockRejectedValueOnce(new Error("down"));
		const jobRole = createJobRole();
		mockedGetJobRoleById.mockResolvedValueOnce(jobRole);

		await controller.postApply(req, res);

		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.render).toHaveBeenCalledWith("apply", {
			jobRole,
			error: "Your application could not be submitted. Please try again.",
		});
	});

	it("postApply returns 502 with null role when both calls fail", async () => {
		const req = {
			params: { id: "1" },
			body: { cvKey: "cv-key" },
		} as unknown as Request;
		const res = createResponse();
		res.locals.user = { id: 99, role: "user" };
		mockedCreateApplication.mockRejectedValueOnce(new Error("down"));
		mockedGetJobRoleById.mockRejectedValueOnce(new Error("down"));

		await controller.postApply(req, res);

		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.render).toHaveBeenCalledWith("apply", {
			jobRole: null,
			error: "Your application could not be submitted. Please try again.",
		});
	});

	it("getConfirmationPage renders role when lookup succeeds", async () => {
		const jobRole = createJobRole();
		mockedGetJobRoleById.mockResolvedValueOnce(jobRole);
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getConfirmationPage(req, res);

		expect(res.render).toHaveBeenCalledWith("apply-confirmation", {
			jobRole,
		});
	});

	it("getConfirmationPage renders null role when token is missing", async () => {
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();
		res.locals.authToken = undefined;

		await controller.getConfirmationPage(req, res);

		expect(mockedGetJobRoleById).not.toHaveBeenCalled();
		expect(res.render).toHaveBeenCalledWith("apply-confirmation", {
			jobRole: null,
		});
	});

	it("getConfirmationPage renders with null role when lookup fails", async () => {
		mockedGetJobRoleById.mockRejectedValueOnce(new Error("down"));
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getConfirmationPage(req, res);

		expect(res.render).toHaveBeenCalledWith("apply-confirmation", {
			jobRole: null,
		});
	});
});
