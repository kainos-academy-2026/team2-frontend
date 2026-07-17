export class ServerError extends Error {
	constructor(message = "Internal Server Error") {
		super(message);
		this.name = "ServerError";
	}
}
