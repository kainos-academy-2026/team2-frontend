import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegistrationService } from "../src/services/registration-service";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, true);

describe("registerUser", () => {
	let service: RegistrationService;

	beforeEach(() => {
		service = new RegistrationService();
		mockedAxios.post.mockReset();
	});

	it("should post registration payload to configured endpoint", async () => {
		mockedAxios.post.mockResolvedValue({ data: {} });

		await service.registerUser({
			fullName: "Jane Smith",
			email: "jane.smith@example.com",
			password: "password123",
		});

		expect(mockedAxios.post).toHaveBeenCalledWith(
			"http://localhost:3000/register",
			{
				fullName: "Jane Smith",
				email: "jane.smith@example.com",
				password: "password123",
			},
		);
	});

	it("should rethrow API errors", async () => {
		const apiError = new Error("Email already exists");

		mockedAxios.post.mockRejectedValue(apiError);

		await expect(
			service.registerUser({
				fullName: "Jane Smith",
				email: "jane.smith@example.com",
				password: "password123",
			}),
		).rejects.toThrow("Email already exists");
	});

	it("should rethrow unknown errors", async () => {
		mockedAxios.post.mockRejectedValue(new Error("boom"));

		await expect(
			service.registerUser({
				fullName: "Jane Smith",
				email: "jane.smith@example.com",
				password: "password123",
			}),
		).rejects.toThrow("boom");
	});
});
