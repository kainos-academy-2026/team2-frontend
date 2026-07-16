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
			const jobRoleId = form.action.split("/job-roles/")[1].split("/apply")[0];

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
				throw new Error("Failed to get upload URL.");
			}

			const { cvKey, uploadUrl } = await urlResponse.json();

			const s3Response = await fetch(uploadUrl, {
				method: "PUT",
				headers: { "Content-Type": file.type },
				body: file,
			});

			if (!s3Response.ok) {
				throw new Error("Failed to upload CV to storage.");
			}

			cvKeyInput.value = cvKey;
			form.submit();
		} catch {
			uploadStatusEl.hidden = true;
			submitBtn.disabled = false;
			showFileError("There was a problem uploading your CV. Please try again.");
		}
	});
}
