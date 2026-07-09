export const DEFAULT_REDIRECT_TARGET = "/job-roles";

const REDIRECT_ALLOWLIST_VALUES = ["/job-roles"] as const;
const REDIRECT_ALLOWLIST = new Set<string>(REDIRECT_ALLOWLIST_VALUES);

if (!REDIRECT_ALLOWLIST.has(DEFAULT_REDIRECT_TARGET)) {
	throw new Error(
		"DEFAULT_REDIRECT_TARGET must be included in REDIRECT_ALLOWLIST_VALUES.",
	);
}

const toRelativePathname = (value: unknown): string | null => {
	if (typeof value !== "string" || value.trim().length === 0) {
		return null;
	}

	if (!value.startsWith("/") || value.startsWith("//")) {
		return null;
	}

	try {
		const parsed = new URL(value, "http://localhost");
		return parsed.pathname;
	} catch {
		return null;
	}
};

export const getAllowedRedirectTarget = (value: unknown): string | null => {
	const pathname = toRelativePathname(value);

	if (!pathname) {
		return null;
	}

	return REDIRECT_ALLOWLIST.has(pathname) ? pathname : null;
};

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
		return allowedFallbackTarget;
	}

	return DEFAULT_REDIRECT_TARGET;
};
