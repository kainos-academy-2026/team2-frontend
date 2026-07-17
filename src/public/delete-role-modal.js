const modal = document.getElementById("delete-role-modal");

if (modal) {
	const roleNameElement = document.getElementById("delete-role-name");
	const cancelButton = document.getElementById("delete-cancel-btn");
	const confirmButton = document.getElementById("delete-confirm-btn");
	const openButtons = document.querySelectorAll("[data-delete-open]");
	let pendingForm = null;

	const closeModal = () => {
		if (typeof modal.close === "function") {
			modal.close();
			return;
		}

		modal.setAttribute("hidden", "true");
	};

	const openModal = () => {
		if (typeof modal.showModal === "function") {
			modal.showModal();
			return;
		}

		modal.removeAttribute("hidden");
	};

	openButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const formId = button.getAttribute("data-form-id");
			const roleName = button.getAttribute("data-role-name") || "this role";
			pendingForm = formId ? document.getElementById(formId) : null;

			if (!pendingForm) {
				return;
			}

			if (roleNameElement) {
				roleNameElement.textContent = roleName;
			}

			openModal();
		});
	});

	cancelButton?.addEventListener("click", () => {
		pendingForm = null;
		closeModal();
	});

	confirmButton?.addEventListener("click", () => {
		if (pendingForm) {
			pendingForm.submit();
		}
	});

	if (typeof modal.addEventListener === "function") {
		modal.addEventListener("cancel", (event) => {
			event.preventDefault();
			pendingForm = null;
			closeModal();
		});
	}
}
