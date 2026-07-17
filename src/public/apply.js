const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_CONTENT_TYPE = "application/pdf";

const form = document.getElementById("apply-form");
const fileInput = document.getElementById("cv-file");
const cvKeyInput = document.getElementById("cvKey");
const fileErrorEl = document.getElementById("cv-file-error");
const uploadStatusEl = document.getElementById("upload-status");
const submitBtn = document.getElementById("submit-btn");

function showFileError(message) {
	fileErrorEl.textContent = message;
	fileErrorEl.hidden = false;
	fileInput.setAttribute("aria-invalid", "true");
}

function clearFileError() {
	fileErrorEl.textContent = "";
	fileErrorEl.hidden = true;
	fileInput.removeAttribute("aria-invalid");
}

async function uploadToStorage(uploadUrl, file) {
	const withContentTypeResponse = await fetch(uploadUrl, {
		method: "PUT",
		headers: { "Content-Type": file.type },
		body: file,
	});

	if (withContentTypeResponse.ok) {
		return;
	}

	const withoutContentTypeResponse = await fetch(uploadUrl, {
		method: "PUT",
		body: file,
	});

	if (!withoutContentTypeResponse.ok) {
		throw new Error("Failed to upload CV to storage.");
	}
}

if (form && fileInput && cvKeyInput && submitBtn) {
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		clearFileError();

		const file = fileInput.files?.[0];

		if (!file) {
			showFileError("Please select a CV to upload.");
			return;
		}

		if (file.type !== ACCEPTED_CONTENT_TYPE) {
			showFileError("Only PDF files are accepted.");
			return;
		}

		if (file.size > MAX_FILE_SIZE_BYTES) {
			showFileError("Your CV must be smaller than 5MB.");
			return;
		}

		submitBtn.disabled = true;
		uploadStatusEl.hidden = false;

		try {
			const actionUrl = new URL(form.action, window.location.origin);
			const pathParts = actionUrl.pathname.split("/").filter(Boolean);
			const jobRolesSegmentIndex = pathParts.indexOf("job-roles");
			const jobRoleId =
				jobRolesSegmentIndex >= 0
					? pathParts[jobRolesSegmentIndex + 1]
					: undefined;

			if (!jobRoleId) {
				throw new Error("Could not determine job role id.");
			}

			const urlResponse = await fetch(
				`/job-roles/${jobRoleId}/apply/upload-url`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						fileName: file.name,
						contentType: file.type,
					}),
				},
			);

			if (!urlResponse.ok) {
				const uploadError = await urlResponse.json().catch(() => null);
				throw new Error(uploadError?.error ?? "Failed to get upload URL.");
			}

			const { cvKey, uploadUrl } = await urlResponse.json();
			await uploadToStorage(uploadUrl, file);

			cvKeyInput.value = cvKey;
			form.submit();
		} catch {
			uploadStatusEl.hidden = true;
			submitBtn.disabled = false;
			showFileError("There was a problem uploading your CV. Please try again.");
		}
	});
}
