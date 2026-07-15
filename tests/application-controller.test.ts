import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationController } from "../src/controllers/application-controller";
import { getUserFromSession } from "../src/middleware/auth-session";
import type { ApplicationService } from "../src/services/application-service";
import type { JobRoleService } from "../src/services/job-role-service";
import { JobRoleStatus } from "../src/types/job-role";

vi.mock("../src/middleware/auth-session", () => ({
	getUserFromSession: vi.fn(),
}));

const mockedGetUserFromSession = vi.mocked(getUserFromSession);

const createResponse = () => {
	const res: Partial<Response> = {
		status: vi.fn(),
		render: vi.fn(),
		redirect: vi.fn(),
		json: vi.fn(),
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
	const applicationService: Pick<
		ApplicationService,
		"getUploadUrl" | "createApplication"
	> = {
		getUploadUrl: vi.fn(),
		createApplication: vi.fn(),
	};
	const jobRoleService: Pick<JobRoleService, "getJobRoleById"> = {
		getJobRoleById: vi.fn(),
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
		mockedGetUserFromSession.mockReturnValueOnce(null);
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getApplyPage(req, res);

		expect(res.redirect).toHaveBeenCalledWith("/job-roles");
	});

	it("getApplyPage redirects when user is admin", async () => {
		mockedGetUserFromSession.mockReturnValueOnce({ id: 1, role: "admin" });
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getApplyPage(req, res);

		expect(res.redirect).toHaveBeenCalledWith("/job-roles");
	});

	it("getApplyPage renders 404 when role is missing", async () => {
		mockedGetUserFromSession.mockReturnValueOnce({ id: 2, role: "candidate" });
		jobRoleService.getJobRoleById.mockResolvedValueOnce(null);
		const req = { params: { id: "missing" } } as unknown as Request;
		const res = createResponse();

		await controller.getApplyPage(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 404,
			message: "The job role you are trying to apply for could not be found.",
		});
	});

	it("getApplyPage renders apply view when role exists", async () => {
		mockedGetUserFromSession.mockReturnValueOnce({ id: 2, role: "candidate" });
		const jobRole = createJobRole();
		jobRoleService.getJobRoleById.mockResolvedValueOnce(jobRole);
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getApplyPage(req, res);

		expect(res.render).toHaveBeenCalledWith("apply", { jobRole });
	});

	it("getApplyPage renders 502 when role lookup fails", async () => {
		mockedGetUserFromSession.mockReturnValueOnce({ id: 2, role: "candidate" });
		jobRoleService.getJobRoleById.mockRejectedValueOnce(new Error("down"));
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getApplyPage(req, res);

		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.render).toHaveBeenCalledWith("error", {
			statusCode: 502,
			message:
				"Could not load the application page right now. Please try again later.",
		});
	});

	it("getUploadUrl returns 403 when user is missing", async () => {
		mockedGetUserFromSession.mockReturnValueOnce(null);
		const req = {
			params: { id: "1" },
			body: { fileName: "cv.pdf", contentType: "application/pdf" },
		} as unknown as Request;
		const res = createResponse();

		await controller.getUploadUrl(req, res);

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith({ error: "Forbidden." });
	});

	it("getUploadUrl returns 400 when request body is incomplete", async () => {
		mockedGetUserFromSession.mockReturnValueOnce({ id: 2, role: "candidate" });
		const req = { params: { id: "1" }, body: {} } as unknown as Request;
		const res = createResponse();

		await controller.getUploadUrl(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: "fileName and contentType are required.",
		});
	});

	it("getUploadUrl returns generated upload url details", async () => {
		mockedGetUserFromSession.mockReturnValueOnce({ id: 22, role: "candidate" });
		applicationService.getUploadUrl.mockResolvedValueOnce({
			cvKey: "cvs/job-role-1/user-22/cv.pdf",
			uploadUrl: "https://upload.example.com",
		});
		const req = {
			params: { id: "1" },
			body: { fileName: "cv.pdf", contentType: "application/pdf" },
		} as unknown as Request;
		const res = createResponse();

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
		mockedGetUserFromSession.mockReturnValueOnce({ id: 22, role: "candidate" });
		applicationService.getUploadUrl.mockRejectedValueOnce(new Error("down"));
		const req = {
			params: { id: "1" },
			body: { fileName: "cv.pdf", contentType: "application/pdf" },
		} as unknown as Request;
		const res = createResponse();

		await controller.getUploadUrl(req, res);

		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.json).toHaveBeenCalledWith({
			error: "Could not generate an upload URL. Please try again.",
		});
	});

	it("postApply redirects when user is missing", async () => {
		mockedGetUserFromSession.mockReturnValueOnce(null);
		const req = {
			params: { id: "1" },
			body: { cvKey: "cv-key" },
		} as unknown as Request;
		const res = createResponse();

		await controller.postApply(req, res);

		expect(res.redirect).toHaveBeenCalledWith("/job-roles");
	});

	it("postApply returns 400 and role when cvKey is missing", async () => {
		mockedGetUserFromSession.mockReturnValueOnce({ id: 9, role: "candidate" });
		const jobRole = createJobRole();
		jobRoleService.getJobRoleById.mockResolvedValueOnce(jobRole);
		const req = {
			params: { id: "1" },
			body: { cvKey: " " },
		} as unknown as Request;
		const res = createResponse();

		await controller.postApply(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("apply", {
			jobRole,
			error: "Please upload your CV before submitting.",
		});
	});

	it("postApply returns 400 with null role when role lookup fails", async () => {
		mockedGetUserFromSession.mockReturnValueOnce({ id: 9, role: "candidate" });
		jobRoleService.getJobRoleById.mockRejectedValueOnce(new Error("down"));
		const req = {
			params: { id: "1" },
			body: { cvKey: "" },
		} as unknown as Request;
		const res = createResponse();

		await controller.postApply(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("apply", {
			jobRole: null,
			error: "Please upload your CV before submitting.",
		});
	});

	it("postApply creates application with trimmed cvKey then redirects", async () => {
		mockedGetUserFromSession.mockReturnValueOnce({ id: 99, role: "candidate" });
		const req = {
			params: { id: "1" },
			body: { cvKey: "  cv-key  " },
		} as unknown as Request;
		const res = createResponse();

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
		mockedGetUserFromSession.mockReturnValueOnce({ id: 99, role: "candidate" });
		applicationService.createApplication.mockRejectedValueOnce(
			new Error("down"),
		);
		const jobRole = createJobRole();
		jobRoleService.getJobRoleById.mockResolvedValueOnce(jobRole);
		const req = {
			params: { id: "1" },
			body: { cvKey: "cv-key" },
		} as unknown as Request;
		const res = createResponse();

		await controller.postApply(req, res);

		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.render).toHaveBeenCalledWith("apply", {
			jobRole,
			error: "Your application could not be submitted. Please try again.",
		});
	});

	it("postApply returns 502 with null role when both calls fail", async () => {
		mockedGetUserFromSession.mockReturnValueOnce({ id: 99, role: "candidate" });
		applicationService.createApplication.mockRejectedValueOnce(
			new Error("down"),
		);
		jobRoleService.getJobRoleById.mockRejectedValueOnce(new Error("down"));
		const req = {
			params: { id: "1" },
			body: { cvKey: "cv-key" },
		} as unknown as Request;
		const res = createResponse();

		await controller.postApply(req, res);

		expect(res.status).toHaveBeenCalledWith(502);
		expect(res.render).toHaveBeenCalledWith("apply", {
			jobRole: null,
			error: "Your application could not be submitted. Please try again.",
		});
	});

	it("getConfirmationPage renders role when lookup succeeds", async () => {
		const jobRole = createJobRole();
		jobRoleService.getJobRoleById.mockResolvedValueOnce(jobRole);
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getConfirmationPage(req, res);

		expect(res.render).toHaveBeenCalledWith("apply-confirmation", {
			jobRole,
		});
	});

	it("getConfirmationPage renders with null role when lookup fails", async () => {
		jobRoleService.getJobRoleById.mockRejectedValueOnce(new Error("down"));
		const req = { params: { id: "1" } } as unknown as Request;
		const res = createResponse();

		await controller.getConfirmationPage(req, res);

		expect(res.render).toHaveBeenCalledWith("apply-confirmation", {
			jobRole: null,
		});
	});
});
