export const DEFAULT_REDIRECT_TARGET = "/";

const ALLOWED_PREFIXES = ["/job-roles"] as const;

const isAllowedRedirectTarget = (value: unknown): value is string =>
	typeof value === "string" &&
	ALLOWED_PREFIXES.some((prefix) => value.startsWith(prefix));

export const getAllowedRedirectTarget = (value: unknown): string | null =>
	isAllowedRedirectTarget(value) ? value : null;

export const resolveRedirectTarget = (attemptedTarget: unknown): string => {
	const allowedAttemptedTarget = getAllowedRedirectTarget(attemptedTarget);
	return allowedAttemptedTarget ?? DEFAULT_REDIRECT_TARGET;
};
