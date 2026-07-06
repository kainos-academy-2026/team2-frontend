export function greet(name: string): string {
  return `Hello, ${name}!`;
}

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
	console.log("Server running on http://localhost:" + PORT);
});
