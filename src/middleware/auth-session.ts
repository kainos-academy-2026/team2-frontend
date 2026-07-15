import type { NextFunction, Request, Response } from "express";
import * as jose from "jose";
import { Role } from "../types/role";

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

		res.locals.user = {
			id: userDetails.sub,
			role: userRole,
			email: userDetails.email,
			name: userDetails.name,
			isAdmin: userRole === Role.Admin,
		};

		next();
	};
}
