const loginForm = document.querySelector('form[action="/login"]');
const submitButton = loginForm?.querySelector('button[type="submit"]');

if (loginForm && submitButton) {
	loginForm.addEventListener("submit", () => {
		submitButton.disabled = true;
		submitButton.setAttribute("aria-busy", "true");
		submitButton.textContent =
			submitButton.getAttribute("data-loading-text") || "Signing In...";
	});
}
