import type { UserRole } from "./auth";

declare global {
	namespace Express {
		interface Locals {
			user?: {
				id: number;
				role: UserRole;
			};
			authToken?: string;
			isAdmin?: boolean;
			isApplicant?: boolean;
		}
	}
}
