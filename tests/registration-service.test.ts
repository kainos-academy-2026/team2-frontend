import { beforeEach, describe, expect, it, vi } from "vitest";
import apiURL from "../src/config/backend";
import { RegistrationService } from "../src/services/registration-service";

vi.mock("../src/config/backend", () => ({
	default: {
		post: vi.fn(),
	},
}));

const mockedApiURL = vi.mocked(apiURL, true);

describe("registerUser", () => {
	let service: RegistrationService;

	beforeEach(() => {
		service = new RegistrationService();
		mockedApiURL.post.mockReset();
	});

	it("should post registration payload to configured endpoint", async () => {
		mockedApiURL.post.mockResolvedValue({ data: {} });

		await service.registerUser({
			fullName: "Jane Smith",
			email: "jane.smith@example.com",
			password: "password123",
		});

		expect(mockedApiURL.post).toHaveBeenCalledWith("/register", {
			fullName: "Jane Smith",
			email: "jane.smith@example.com",
			password: "password123",
		});
	});

	it("should rethrow API errors", async () => {
		const apiError = new Error("Email already exists");

		mockedApiURL.post.mockRejectedValue(apiError);

		await expect(
			service.registerUser({
				fullName: "Jane Smith",
				email: "jane.smith@example.com",
				password: "password123",
			}),
		).rejects.toThrow("Email already exists");
	});

	it("should rethrow unknown errors", async () => {
		mockedApiURL.post.mockRejectedValue(new Error("boom"));

		await expect(
			service.registerUser({
				fullName: "Jane Smith",
				email: "jane.smith@example.com",
				password: "password123",
			}),
		).rejects.toThrow("boom");
	});
});
