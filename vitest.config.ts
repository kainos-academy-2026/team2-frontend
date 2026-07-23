import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["tests/**/*.{test,spec}.ts"],
		exclude: ["framework", "node_modules"],
	},
});

