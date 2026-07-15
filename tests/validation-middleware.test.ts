import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { validateBody } from "../src/middleware/validationMiddleware";

const createResponse = () => ({ locals: {} }) as unknown as Response;

describe("validateBody", () => {
	it("sets locals.errors to null when body is valid", () => {
		const schema = z.object({
			email: z.string().email(),
		});
		const middleware = validateBody(schema);
		const req = { body: { email: "person@example.com" } } as Request;
		const res = createResponse();
		const next = vi.fn() as NextFunction;

		middleware(req, res, next);

		expect(res.locals.errors).toBeNull();
		expect(next).toHaveBeenCalledTimes(1);
	});

	it("collects field errors when body is invalid", () => {
		const schema = z.object({
			email: z.string().email(),
		});
		const middleware = validateBody(schema);
		const req = { body: { email: "not-an-email" } } as Request;
		const res = createResponse();
		const next = vi.fn() as NextFunction;

		middleware(req, res, next);

		expect(res.locals.errors).toEqual({
			email: ["Invalid email address"],
		});
		expect(next).toHaveBeenCalledTimes(1);
	});

	it("ignores validation issues that do not map to a string field", () => {
		const schema = z.array(z.string().min(3));
		const middleware = validateBody(schema);
		const req = { body: [""] } as unknown as Request;
		const res = createResponse();
		const next = vi.fn() as NextFunction;

		middleware(req, res, next);

		expect(res.locals.errors).toEqual({});
		expect(next).toHaveBeenCalledTimes(1);
	});
});
