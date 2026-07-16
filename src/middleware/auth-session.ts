import type { NextFunction, Request, Response } from "express";
import * as jose from "jose";
import z from "zod";
import { Role } from "../types/role";

const tokenPayloadSchema = z.object({
	sub: z.string(),
	email: z.string(),
	name: z.string(),
	role: z.enum(Role),
	exp: z.number(),
});

export default function requireRole(allowedRoles: Role[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		const token = req.cookies.authSession;
		if (!token) {
			res.redirect("/login");
			return;
		}

		if (token.length === 0) {
			res.redirect("/login");
			return;
		}

		const userDetails = jose.decodeJwt(token);
		if (userDetails.exp && userDetails.exp * 1000 < Date.now()) {
			res.redirect("/login");
			return;
		}

		const userRole = userDetails.role as Role;

		if (!allowedRoles.includes(userRole)) {
			res.status(403).render("forbidden");
			return;
		}

		if (!tokenPayloadSchema.safeParse(userDetails).success) {
			res.clearCookie("authSession");
			res.redirect("/login");
			return;
		}

		res.locals.user = {
			id: userDetails.sub as string,
			role: userRole,
			email: userDetails.email as string,
			name: userDetails.name as string,
			isAdmin: userRole === Role.Admin,
		};

		next();
	};
}
