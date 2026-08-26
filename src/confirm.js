export const showConfirm = (title, msg, btn, callback) => {
	const dlg = document.getElementById("dlgConfirm");
	dlg.querySelector(".dialog-title").textContent = title;
	dlg.querySelector(".dialog-body").textContent = msg;
	dlg.querySelector(".btn-dlg-continue").textContent = btn;

	// Update the active callback on every call
	dlg._onContinue = callback;

	if (!dlg.classList.contains("attached")) {
		dlg.classList.add("attached");

		dlg.addEventListener("click", (e) => {
			const rect = dlg.getBoundingClientRect();

			// Check if the click coordinates fall outside the dialog bounds
			const isClickOutside =
				e.clientX < rect.left ||
				e.clientX > rect.right ||
				e.clientY < rect.top ||
				e.clientY > rect.bottom;

			if (isClickOutside) {
				dlg.close();
			}
		});

		dlg.querySelector(".btn-dlg-cancel").addEventListener("click", () => {
			dlg.close();
		});

		dlg.querySelector(".btn-dlg-continue").addEventListener("click", () => {
			dlg.close();

			if (typeof dlg._onContinue === "function") {
				dlg._onContinue();
			}
		});
	}

	dlg.showModal();
};
