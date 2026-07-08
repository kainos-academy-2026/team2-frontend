import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerUser } from "../src/services/registration-service";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, true);

describe("registerUser", () => {
	beforeEach(() => {
		mockedAxios.post.mockReset();
	});

	it("should post registration payload to configured endpoint", async () => {
		mockedAxios.post.mockResolvedValue({ data: {} });

		await registerUser({
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

	it("should surface API message when available", async () => {
		const apiError = {
			isAxiosError: true,
			response: {
				data: { message: "Email already exists" },
			},
		};
		mockedAxios.isAxiosError.mockReturnValueOnce(true);

		mockedAxios.post.mockRejectedValue(apiError);

		await expect(
			registerUser({
				fullName: "Jane Smith",
				email: "jane.smith@example.com",
				password: "password123",
			}),
		).rejects.toThrow("Email already exists");
	});

	it("should return fallback message on unknown errors", async () => {
		mockedAxios.post.mockRejectedValue(new Error("boom"));

		await expect(
			registerUser({
				fullName: "Jane Smith",
				email: "jane.smith@example.com",
				password: "password123",
			}),
		).rejects.toThrow("Registration failed. Please try again.");
	});
});
