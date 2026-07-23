module.exports = {
	default: {
		requireModule: ["ts-node/register"],
		require: ["tests/steps/**/*.js"],
		paths: ["tests/feature/**/*.feature"],
		format: ["progress"],
	},
};
