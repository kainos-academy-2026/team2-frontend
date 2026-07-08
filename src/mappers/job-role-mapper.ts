export const toOpenPositions = (numberOfOpenPositions: number | undefined): number => {
	if (typeof numberOfOpenPositions === "number") {
		return Number.isFinite(numberOfOpenPositions) && numberOfOpenPositions > 0
			? numberOfOpenPositions
			: 0;
	}

	return 0;
};