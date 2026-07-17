import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

const closeServer = () => {
	server.close();
};

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
