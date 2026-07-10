import http from "node:http";

const fakeJobRoles = [
	{
		roleName: "Software Engineer",
		location: "Belfast",
		capability: "Engineering",
		band: "Associate",
		closingDate: "2026-08-15",
		status: "OPEN",
	},
	{
		roleName: "Senior Software Engineer",
		location: "London",
		capability: "Engineering",
		band: "Senior Associate",
		closingDate: "2026-08-20",
		status: "OPEN",
	},
	{
		roleName: "Business Analyst",
		location: "Birmingham",
		capability: "Consulting",
		band: "Associate",
		closingDate: "2026-07-31",
		status: "OPEN",
	},
	{
		roleName: "UX Designer",
		location: "Edinburgh",
		capability: "Design",
		band: "Associate",
		closingDate: "2026-09-01",
		status: "OPEN",
	},
	{
		roleName: "DevOps Engineer",
		location: "Belfast",
		capability: "Engineering",
		band: "Senior Associate",
		closingDate: "2026-08-10",
		status: "OPEN",
	},
];

const PORT = 3000;

const server = http.createServer((req, res) => {
	if (req.url === "/job-roles" && req.method === "GET") {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify(fakeJobRoles));
	} else {
		res.writeHead(404);
		res.end("Not found");
	}
});

server.listen(PORT, () => {
	console.log(`Seed server running at http://localhost:${PORT}`);
	console.log(`Set JOB_ROLES_API_URL=http://localhost:${PORT}/job-roles in your environment`);
});
