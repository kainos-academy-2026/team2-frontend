import type { UserRole } from "./auth";

declare global {
	namespace Express {
		interface Locals {
			user?: {
				id: string;
				role: UserRole;
				email: string;
				name: string;
				isAdmin?: boolean;
			};
			authToken?: string;
		}
	}
}
