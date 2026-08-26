import { vettingResultCsvToArray } from "./process/vettingResult";
import { vettingRequestCsvToArray } from "./process/vettingRequest";
import { csgAttendCsvToArray } from "./process/csgAttend";
import { processResult } from "./process/report";
import { buildTable } from "./process/buildTable";
import { buildLocationMap, locationCsvToArray } from "./process/location";
import { buildCorrectionMap, correctionCsvToArray } from "./process/correction";

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

export const attachPrintFn = (btn) => {
	if (btn) {
		btn.addEventListener("click", () => {
			window.print();
		});
	}
};
