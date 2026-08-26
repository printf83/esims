const setSafeHTML = (element, htmlString) => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, "text/html");

	// Remove high-risk elements
	const dangerousElements = doc.querySelectorAll(
		"script, iframe, object, embed, style",
	);
	dangerousElements.forEach((el) => el.remove());

	// Strip inline event attributes (e.g., onclick, onerror)
	const allElements = doc.querySelectorAll("*");
	allElements.forEach((el) => {
		Array.from(el.attributes).forEach((attr) => {
			if (attr.name.startsWith("on")) {
				el.removeAttribute(attr.name);
			}
		});
	});

	element.innerHTML = doc.body.innerHTML;
};

export const showModal = (title, msg, btn, btnType, callback) => {
	const dlg = document.getElementById("dlgConfirm");
	const continueBtn = dlg.querySelector(".btn-dlg-continue");
	const cancelBtn = dlg.querySelector(".btn-dlg-cancel");

	setSafeHTML(dlg.querySelector(".dialog-title"), title);
	setSafeHTML(dlg.querySelector(".dialog-body"), msg);
	continueBtn.textContent = btn;

	// Update the active callback on every call
	dlg._onContinue = callback;

	// Show cancel button if callback exists, hide if purely informational
	if (typeof callback === "function") {
		cancelBtn.classList.remove("hide");
	} else {
		cancelBtn.classList.add("hide");
	}

	// Change continue button styling
	continueBtn.classList.remove("btn-primary", "btn-danger", "btn-secondary");
	if (btnType === "primary") {
		continueBtn.classList.add("btn-primary");
	} else if (btnType === "danger") {
		continueBtn.classList.add("btn-danger");
	} else {
		continueBtn.classList.add("btn-secondary");
	}

	// Attach global modal event handlers only once
	if (!dlg.classList.contains("attached")) {
		dlg.classList.add("attached");

		// Backdrop click handler to close dialog
		dlg.addEventListener("click", (e) => {
			const rect = dlg.getBoundingClientRect();
			const isClickOutside =
				e.clientX < rect.left ||
				e.clientX > rect.right ||
				e.clientY < rect.top ||
				e.clientY > rect.bottom;

			if (isClickOutside) {
				dlg.close();
			}
		});

		cancelBtn.addEventListener("click", () => {
			dlg.close();
		});

		continueBtn.addEventListener("click", () => {
			dlg.close();
			if (typeof dlg._onContinue === "function") {
				dlg._onContinue();
			}
		});
	}

	dlg.showModal();
};
