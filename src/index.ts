import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.BACKEND_URL) {
	throw new Error("BACKEND_URL is not defined in the environment variables.");
}

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
