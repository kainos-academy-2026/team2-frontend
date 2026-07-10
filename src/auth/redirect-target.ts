export const DEFAULT_REDIRECT_TARGET = "/job-roles";

const ALLOWED_PREFIXES = ["/job-roles"] as const;

const isAllowedRedirectTarget = (value: unknown): value is string =>
	typeof value === "string" &&
	ALLOWED_PREFIXES.some((prefix) => value.startsWith(prefix));

export const getAllowedRedirectTarget = (value: unknown): string | null =>
	isAllowedRedirectTarget(value) ? value : null;

export const resolveRedirectTarget = (
	attemptedTarget: unknown,
	fallbackTarget: unknown = DEFAULT_REDIRECT_TARGET,
): string => {
	const allowedAttemptedTarget = getAllowedRedirectTarget(attemptedTarget);
	if (allowedAttemptedTarget) {
		return allowedAttemptedTarget;
	}

	const allowedFallbackTarget = getAllowedRedirectTarget(fallbackTarget);
	if (allowedFallbackTarget) {
		return "/";
	}

	return DEFAULT_REDIRECT_TARGET;
};
