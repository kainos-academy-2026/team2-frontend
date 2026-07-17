import { beforeEach, describe, expect, it, vi } from "vitest";
import apiURL from "../src/config/backend";
import { ApplicationService } from "../src/services/application-service";

vi.mock("../src/config/backend", () => ({
	default: {
		post: vi.fn(),
	},
}));

const mockedApiURL = vi.mocked(apiURL, true);

describe("ApplicationService", () => {
	let service: ApplicationService;

	beforeEach(() => {
		service = new ApplicationService();
		mockedApiURL.post.mockReset();
	});

	describe("getUploadUrl", () => {
		it("should POST to the correct endpoint with the correct body", async () => {
			mockedApiURL.post.mockResolvedValue({
				data: {
					cvKey: "cvs/job-role-1/user-123/cv.pdf",
					uploadUrl: "https://s3.example.com/presigned",
				},
			});

			const result = await service.getUploadUrl(
				"1",
				{
					userId: 123,
					fileName: "cv.pdf",
					contentType: "application/pdf",
				},
				"token",
			);

			expect(mockedApiURL.post).toHaveBeenCalledWith(
				"/job-roles/1/applications/upload-url",
				{ userId: 123, fileName: "cv.pdf", contentType: "application/pdf" },
				{ headers: { Authorization: "Bearer token" } },
			);
			expect(result).toEqual({
				cvKey: "cvs/job-role-1/user-123/cv.pdf",
				uploadUrl: "https://s3.example.com/presigned",
			});
		});

		it("should rethrow errors from the API", async () => {
			mockedApiURL.post.mockRejectedValue(new Error("API error"));

			await expect(
				service.getUploadUrl(
					"1",
					{
						userId: 123,
						fileName: "cv.pdf",
						contentType: "application/pdf",
					},
					"token",
				),
			).rejects.toThrow("API error");
		});
	});

	describe("createApplication", () => {
		it("should POST to the correct endpoint with userId and cvKey", async () => {
			mockedApiURL.post.mockResolvedValue({ data: {} });

			await service.createApplication(
				"1",
				{
					userId: 123,
					cvKey: "cvs/job-role-1/user-123/cv.pdf",
				},
				"token",
			);

			expect(mockedApiURL.post).toHaveBeenCalledWith(
				"/job-roles/1/applications",
				{ userId: 123, cvKey: "cvs/job-role-1/user-123/cv.pdf" },
				{ headers: { Authorization: "Bearer token" } },
			);
		});

		it("should rethrow errors from the API", async () => {
			mockedApiURL.post.mockRejectedValue(new Error("Submission failed"));

			await expect(
				service.createApplication(
					"1",
					{
						userId: 123,
						cvKey: "cvs/job-role-1/user-123/cv.pdf",
					},
					"token",
				),
			).rejects.toThrow("Submission failed");
		});
	});
});
