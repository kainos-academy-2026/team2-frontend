import axios, { type AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { handleResponseError } from "../src/config/backend";
import { ForbiddenError } from "../src/errors/forbidden-error";
import { ServerError } from "../src/errors/server-error";

const makeAxiosError = (status: number) => {
	const error = new axios.AxiosError("Request failed");
	error.response = { status } as AxiosError["response"];
	return error;
};

describe("handleResponseError", () => {
	it("throws ForbiddenError for 403 responses", () => {
		expect(() => handleResponseError(makeAxiosError(403))).toThrow(
			ForbiddenError,
		);
	});

	it("throws ServerError for 500 responses", () => {
		expect(() => handleResponseError(makeAxiosError(500))).toThrow(ServerError);
	});

	it("rethrows unhandled axios errors unchanged", () => {
		const error = makeAxiosError(404);
		expect(() => handleResponseError(error)).toThrow(error);
	});

	it("rethrows non-axios errors unchanged", () => {
		const error = new Error("network failure");
		expect(() => handleResponseError(error)).toThrow(error);
	});
});
