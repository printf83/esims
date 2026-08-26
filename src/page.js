import { vettingResultCsvToArray } from "./process/vettingResult";
import { vettingRequestCsvToArray } from "./process/vettingRequest";
import { csgAttendCsvToArray } from "./process/csgAttend";
import { processResult } from "./process/report";
import { buildTable } from "./process/buildTable";
import { buildLocationMap, locationCsvToArray } from "./process/location";
import { buildCorrectionMap, correctionCsvToArray } from "./process/correction";
import { showConfirm } from "./confirm";

export const buildResult = (container, data) => {
	const mapCorrection = new Map();
	const mapLocation = new Map();
	const allLocation = [
		...locationCsvToArray(data.location, "ESIMS"),
		...(data.item
			? data.item.flatMap((i) =>
					locationCsvToArray(i.location, i.company),
				)
			: []),
	];

	buildCorrectionMap(mapCorrection, correctionCsvToArray(data.correction));
	buildLocationMap(mapCorrection, mapLocation, allLocation);

	const table = (data) => {
		return buildTable(
			data.company,
			processResult({
				company: data.company,
				mapLocation: mapLocation,
				csgAttend: csgAttendCsvToArray(data.csgAttend),
				vettingResult: vettingResultCsvToArray(data.vettingResult),
				vettingRequest: vettingRequestCsvToArray(data.vettingRequest),
			}),
		);
	};

	const startTimer = performance.now();
	const html = data.item ? data.item.map((d) => table(d)) : [];
	console.log(
		`Prosess siap dalam masa ${(performance.now() - startTimer).toFixed(2)}ms`,
	);

	container.innerHTML = html.join('<div class="page-break"></div>');

	attachHoverEffect(container, "span[data-type]");
	attachTableSort(container, "table.output");
};

const attachHoverEffect = (container, selector) => {
	//add hover effect into span[data-type]
	const elements = container.querySelectorAll(selector);
	if (elements && elements.length > 0) {
		elements.forEach((el) => {
			el.addEventListener("click", () => {
				const table = el.closest("table");
				const type = el.dataset.type;

				if (table) {
					if (el.dataset.value !== "true") {
						table.classList.add(type);
						el.dataset.value = "true";
					} else {
						table.classList.remove(type);
						el.dataset.value = "false";
					}
				}
			});
		});
	}
};

const attachTableSort = (container, selector) => {
	const listOfTable = container.querySelectorAll(selector);

	listOfTable.forEach((table) => {
		const listOfTh = table.querySelectorAll("th");
		const tbody = table.querySelector("tbody");

		// Helper function to renumber the first <td> of each row
		const renumberRows = () => {
			if (!tbody) return;
			const rows = tbody.querySelectorAll("tr");
			rows.forEach((row, idx) => {
				const firstCell = row.querySelector("td");
				if (firstCell) {
					firstCell.textContent = idx + 1;
				}
			});
		};

		// Helper function to re-sort rows based on active th sort parameters
		const sortTableRows = () => {
			if (!tbody) return;

			// 1. Gather all currently sorted headers ordered by priority
			const sortedHeaders = Array.from(listOfTh)
				.filter(
					(th) =>
						th.hasAttribute("data-sort") &&
						th.hasAttribute("data-sort-index"),
				)
				.map((th) => ({
					columnIndex: Array.from(th.parentNode.children).indexOf(th),
					direction: th.getAttribute("data-sort"),
					priority: parseInt(th.getAttribute("data-sort-index"), 10),
				}))
				.sort((a, b) => a.priority - b.priority);

			if (sortedHeaders.length === 0) return;

			// 2. Sort the <tr> elements
			const rows = Array.from(tbody.querySelectorAll("tr"));

			rows.sort((rowA, rowB) => {
				for (const sortInfo of sortedHeaders) {
					const cellA =
						rowA.children[
							sortInfo.columnIndex
						]?.textContent.trim() || "";
					const cellB =
						rowB.children[
							sortInfo.columnIndex
						]?.textContent.trim() || "";

					const comparison = cellA.localeCompare(cellB, undefined, {
						numeric: true,
						sensitivity: "base",
					});

					if (comparison !== 0) {
						return sortInfo.direction === "asc"
							? comparison
							: -comparison;
					}
				}
				return 0;
			});

			// 3. Re-append rows back to tbody in new order
			rows.forEach((row) => tbody.appendChild(row));

			// 4. Update row numbers in the first column
			renumberRows();
		};

		// Attach click listeners to TH elements
		listOfTh.forEach((th, index) => {
			// Skip first column header (e.g., 'Bil')
			if (index === 0) return;

			th.addEventListener("click", () => {
				const currentSort = th.getAttribute("data-sort");

				if (currentSort === "asc") {
					th.setAttribute("data-sort", "desc");
				} else if (currentSort === "desc") {
					const removedIndex = parseInt(
						th.getAttribute("data-sort-index"),
						10,
					);
					th.removeAttribute("data-sort");
					th.removeAttribute("data-sort-index");

					if (!isNaN(removedIndex)) {
						listOfTh.forEach((otherTh) => {
							const otherIndex = parseInt(
								otherTh.getAttribute("data-sort-index"),
								10,
							);
							if (otherIndex > removedIndex) {
								otherTh.setAttribute(
									"data-sort-index",
									otherIndex - 1,
								);
							}
						});
					}
				} else {
					th.setAttribute("data-sort", "asc");
					const activeSortedThs =
						table.querySelectorAll("th[data-sort]");
					th.setAttribute(
						"data-sort-index",
						activeSortedThs.length - 1,
					);
				}

				// Execute sort and renumbering
				sortTableRows();
			});
		});
	});
};

export const attachPrintFn = (btn) => {
	if (btn) {
		btn.addEventListener("click", () => {
			window.print();
		});
	}
};

export const attachHelpFn = (btn) => {
	if (btn) {
		btn.addEventListener("click", () => {
			showConfirm(
				"Information",
				'Please install "Copy Table" browser extensions to copy table from ESIMS',
				"Okay",
				"primary",
			);
		});
	}
};
