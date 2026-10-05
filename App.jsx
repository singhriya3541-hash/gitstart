import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "fieldnotes.records.v1";
const VIEWS = ["home", "records", "search"];
const EMPTY_MESSAGE = "No records yet. Add your first entry to get started.";

const styles = `
	:root {
		color-scheme: light;
		--paper: #f5f6f1;
		--surface: #fffefa;
		--ink: #20291f;
		--muted: #788075;
		--line: #e3e7dd;
		--green: #315c43;
		--green-dark: #244631;
		--green-soft: #eaf0e8;
		--orange: #b95936;
		--orange-soft: #f8eee8;
		--shadow: 0 12px 36px rgba(39, 54, 40, .055);
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	}

	* { box-sizing: border-box; }
	body {
		min-width: 320px;
		min-height: 100vh;
		margin: 0;
		color: var(--ink);
		background-color: var(--paper);
		background-image: radial-gradient(#dce2d7 0.7px, transparent 0.7px);
		background-size: 19px 19px;
	}
	button, input, select { font: inherit; }
	button, a { -webkit-tap-highlight-color: transparent; }
	.fieldnotes-app { width: min(1100px, calc(100% - 48px)); margin: 0 auto; }
	.fn-topbar {
		display: flex; min-height: 82px; align-items: center; justify-content: space-between;
		gap: 24px; border-bottom: 1px solid rgba(49, 92, 67, .14);
	}
	.fn-brand { display: inline-flex; align-items: center; gap: 11px; color: var(--ink); text-decoration: none; }
	.fn-brand-mark {
		display: grid; width: 34px; aspect-ratio: 1; place-items: center; border-radius: 10px;
		color: white; background: var(--green); font-family: Georgia, serif; font-size: 21px; font-style: italic;
	}
	.fn-brand-name { font-family: Georgia, "Times New Roman", serif; font-size: 21px; }
	.fn-brand-caption {
		margin-left: 2px; color: var(--muted); font-size: 11px; letter-spacing: .08em; text-transform: uppercase;
	}
	.fn-nav { display: flex; align-items: center; gap: 7px; }
	.fn-nav a {
		padding: 10px 13px; border-radius: 7px; color: #606a5f; font-size: 13px;
		font-weight: 600; text-decoration: none; transition: color .18s ease, background .18s ease;
	}
	.fn-nav a:hover { color: var(--green-dark); background: rgba(49, 92, 67, .07); }
	.fn-nav a[aria-current="page"] { color: var(--green-dark); background: var(--green-soft); }
	.fn-main { min-height: calc(100vh - 145px); padding: 54px 0 72px; }
	.fn-view { animation: fn-enter .28s ease both; }
	@keyframes fn-enter { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
	.fn-eyebrow {
		margin: 0 0 12px; color: var(--orange); font-size: 11px; font-weight: 700;
		letter-spacing: .13em; text-transform: uppercase;
	}
	.fn-view h1, .fn-view h2, .fn-view p { margin-top: 0; }
	.fn-view h1 {
		margin-bottom: 10px; font-family: Georgia, "Times New Roman", serif; font-size: 46px;
		font-weight: 400; letter-spacing: 0; line-height: 1.12;
	}
	.fn-intro { max-width: 550px; margin-bottom: 0; color: var(--muted); font-size: 15px; line-height: 1.65; }
	.fn-page-heading {
		display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 30px;
	}
	.fn-button {
		display: inline-flex; min-height: 43px; align-items: center; justify-content: center; gap: 9px;
		padding: 0 17px; border: 1px solid transparent; border-radius: 7px; color: white;
		background: var(--green); font-size: 13px; font-weight: 650; white-space: nowrap;
		text-decoration: none; cursor: pointer; transition: background .18s ease, transform .18s ease;
	}
	.fn-button:hover { background: var(--green-dark); transform: translateY(-1px); }
	.fn-button:focus-visible, .fn-nav a:focus-visible, .fn-view input:focus-visible,
	.fn-view select:focus-visible, .fn-view button:focus-visible, .fn-view a:focus-visible {
		outline: 3px solid #b8cfb8; outline-offset: 2px;
	}
	.fn-plus { font-size: 18px; font-weight: 400; line-height: 1; }
	.fn-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 34px 0 42px; }
	.fn-stat {
		min-height: 108px; padding: 19px 21px; border: 1px solid var(--line); border-radius: 9px;
		background: var(--surface); box-shadow: var(--shadow);
	}
	.fn-stat-label { margin: 0 0 10px; color: var(--muted); font-size: 12px; }
	.fn-stat-value { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: 29px; line-height: 1; }
	.fn-section-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
	.fn-section-heading h2 {
		margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: 22px; font-weight: 400;
	}
	.fn-text-link { color: var(--green); font-size: 13px; font-weight: 650; text-decoration: none; }
	.fn-text-link:hover { text-decoration: underline; text-underline-offset: 3px; }
	.fn-records-list { margin-top: 38px; }
	.fn-table-wrap {
		overflow-x: auto; border: 1px solid var(--line); border-radius: 9px; background: var(--surface);
		box-shadow: var(--shadow);
	}
	.fn-view table { width: 100%; border-collapse: collapse; text-align: left; }
	.fn-view th, .fn-view td { padding: 14px 18px; white-space: nowrap; }
	.fn-view th {
		color: var(--muted); background: #fafbf7; font-size: 10px; font-weight: 700;
		letter-spacing: .09em; text-transform: uppercase;
	}
	.fn-view td { border-top: 1px solid #edf0e9; font-size: 13px; }
	.fn-view td:first-child { color: var(--green-dark); font-weight: 700; }
	.fn-view .fn-empty-row td { padding: 30px 18px; color: var(--muted); text-align: center; }
	.fn-panel {
		max-width: 690px; padding: 28px; border: 1px solid var(--line); border-radius: 10px;
		background: var(--surface); box-shadow: var(--shadow);
	}
	.fn-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 18px; }
	.fn-field { display: flex; flex-direction: column; gap: 8px; }
	.fn-field label { color: #465044; font-size: 12px; font-weight: 650; }
	.fn-view input, .fn-view select {
		width: 100%; min-height: 45px; padding: 0 12px; border: 1px solid #dce2d8;
		border-radius: 6px; color: var(--ink); background: #fff; font-size: 14px;
	}
	.fn-view input::placeholder { color: #a1a89e; }
	.fn-field-hint { margin: 0; color: var(--muted); font-size: 11px; line-height: 1.5; }
	.fn-form-actions { display: flex; align-items: center; gap: 14px; margin-top: 25px; }
	.fn-quiet-link { color: var(--muted); font-size: 13px; text-decoration: none; }
	.fn-quiet-link:hover { color: var(--green); }
	.fn-notice { min-height: 20px; margin: 13px 0 0; color: var(--orange); font-size: 12px; }
	.fn-search-panel { max-width: 760px; }
	.fn-search-form { display: flex; gap: 10px; }
	.fn-search-form input { flex: 1; }
	.fn-search-result { margin-top: 22px; }
	.fn-search-card {
		display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; padding: 21px;
		border: 1px solid var(--line); border-radius: 8px; background: #fff;
	}
	.fn-result-item span {
		display: block; margin-bottom: 6px; color: var(--muted); font-size: 10px; font-weight: 700;
		letter-spacing: .08em; text-transform: uppercase;
	}
	.fn-result-item strong { font-size: 14px; font-weight: 600; }
	.fn-result-message { margin: 0; padding: 18px 0 2px; color: var(--muted); font-size: 13px; }
	.fn-result-message.not-found { color: var(--orange); }
	.fn-storage-error { margin: 0 0 24px; padding: 12px 14px; border: 1px solid #e8c9bb; border-radius: 7px; color: #803d26; background: var(--orange-soft); font-size: 13px; }
	.fn-footer {
		display: flex; justify-content: space-between; gap: 16px; padding: 18px 0 26px;
		border-top: 1px solid rgba(49, 92, 67, .14); color: var(--muted); font-size: 11px;
	}
	@media (max-width: 640px) {
		.fieldnotes-app { width: min(100% - 32px, 520px); }
		.fn-topbar { min-height: 72px; flex-wrap: wrap; gap: 8px; padding: 13px 0 0; }
		.fn-brand-caption { display: none; }
		.fn-brand-name { font-size: 19px; }
		.fn-nav { width: 100%; justify-content: space-between; gap: 2px; }
		.fn-nav a { padding: 9px 10px; font-size: 12px; }
		.fn-main { padding: 38px 0 52px; }
		.fn-view h1 { font-size: 34px; }
		.fn-page-heading { align-items: start; flex-direction: column; gap: 18px; }
		.fn-page-heading > .fn-button { align-self: stretch; }
		.fn-stats { gap: 8px; margin: 27px 0 34px; }
		.fn-stat { min-height: 92px; padding: 15px 12px; }
		.fn-stat-label { min-height: 28px; font-size: 10px; line-height: 1.4; }
		.fn-stat-value { font-size: 25px; }
		.fn-panel { padding: 20px 16px; }
		.fn-form-grid { grid-template-columns: 1fr; gap: 17px; }
		.fn-search-form { align-items: stretch; flex-direction: column; }
		.fn-search-form .fn-button { width: 100%; }
		.fn-search-card { gap: 18px 12px; padding: 17px 14px; }
		.fn-view th, .fn-view td { padding: 12px 13px; }
		.fn-footer { flex-direction: column; gap: 6px; }
	}
	@media (prefers-reduced-motion: reduce) {
		*, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important; }
	}
`;

function todayLocal() {
	const now = new Date();
	const offset = now.getTimezoneOffset() * 60000;
	return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatDate(value) {
	if (!value) return "—";
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year, month - 1, day).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function readRecords() {
	try {
		const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
		if (!Array.isArray(saved)) throw new Error("Saved data is not a record list.");
		if (
			saved.some(
				(record) =>
					!record ||
					typeof record.serial !== "string" ||
					typeof record.name !== "string" ||
					typeof record.date !== "string" ||
					typeof record.gender !== "string" ||
					typeof record.time !== "string" ||
					typeof record.createdAt !== "string",
			)
		) {
			throw new Error("Saved data contains an invalid record.");
		}
		return { records: saved, error: "" };
	} catch {
		return {
			records: [],
			error: "Saved records could not be read from this browser. Check browser storage settings, then reload.",
		};
	}
}

function RecordTable({ records, emptyMessage }) {
	return (
		<div className="fn-table-wrap">
			<table>
				<thead>
					<tr>
						<th>Serial no.</th>
						<th>Name</th>
						<th>Date of entry</th>
						<th>Gender</th>
						<th>Time added</th>
					</tr>
				</thead>
				<tbody>
					{records.length ? (
						records.map((record) => (
							<tr key={`${record.serial}-${record.createdAt}`}>
								<td>{record.serial || "—"}</td>
								<td>{record.name || "—"}</td>
								<td>{formatDate(record.date)}</td>
								<td>{record.gender || "—"}</td>
								<td>{record.time || "—"}</td>
							</tr>
						))
					) : (
						<tr className="fn-empty-row">
							<td colSpan="5">{emptyMessage}</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}

export default function App() {
	const [recordState, setRecordState] = useState(readRecords);
	const [activeView, setActiveView] = useState(() => {
		const route = window.location.hash.slice(1);
		return VIEWS.includes(route) ? route : "home";
	});
	const [formValues, setFormValues] = useState({
		serial: "",
		name: "",
		date: todayLocal(),
		gender: "",
	});
	const [notice, setNotice] = useState("");
	const [searchValue, setSearchValue] = useState("");
	const [searchResult, setSearchResult] = useState(null);

	const records = useMemo(
		() => [...recordState.records].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
		[recordState.records],
	);
	const today = todayLocal();
	const todaysCount = records.filter((record) => record.createdAt.slice(0, 10) === today).length;

	useEffect(() => {
		function syncRoute() {
			const route = window.location.hash.slice(1);
			if (VIEWS.includes(route)) {
				setActiveView(route);
			} else {
				window.history.replaceState(null, "", "#home");
				setActiveView("home");
			}
		}

		window.addEventListener("hashchange", syncRoute);
		syncRoute();
		return () => window.removeEventListener("hashchange", syncRoute);
	}, []);

	useEffect(() => {
		if (activeView === "records") {
			setFormValues((current) => ({ ...current, date: current.date || todayLocal() }));
			setNotice("");
		}
		if (activeView !== "search") setSearchResult(null);
	}, [activeView]);

	function updateForm(event) {
		const { name, value } = event.target;
		setFormValues((current) => ({ ...current, [name]: value }));
	}

	function saveRecord(event) {
		event.preventDefault();
		const serial = formValues.serial.trim();
		const name = formValues.name.trim();

		if (recordState.records.some((record) => record.serial.toLocaleLowerCase() === serial.toLocaleLowerCase())) {
			setNotice("That serial number is already in use. Choose a different one.");
			document.getElementById("fn-serial")?.focus();
			return;
		}

		const now = new Date();
		const nextRecords = [
			...recordState.records,
			{
				serial,
				name,
				date: formValues.date,
				gender: formValues.gender,
				time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
				createdAt: now.toISOString(),
			},
		];

		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
		} catch {
			setNotice("This browser could not save the record. Check its storage settings and try again.");
			return;
		}

		setRecordState({ records: nextRecords, error: "" });
		setFormValues({ serial: "", name: "", date: todayLocal(), gender: "" });
		setNotice("");
		window.location.hash = "home";
	}

	function findRecord(event) {
		event.preventDefault();
		const query = searchValue.trim().toLocaleLowerCase();
		const match = recordState.records.find((record) => record.serial.toLocaleLowerCase() === query);
		setSearchResult(match || { notFound: true });
	}

	return (
		<>
			<style>{styles}</style>
			<div className="fieldnotes-app">
				<header className="fn-topbar">
					<a className="fn-brand" href="#home" aria-label="Fieldnotes home">
						<span className="fn-brand-mark" aria-hidden="true">f.</span>
						<span className="fn-brand-name">Fieldnotes</span>
						<span className="fn-brand-caption">Record keeper</span>
					</a>
					<nav className="fn-nav" aria-label="Main navigation">
						{VIEWS.map((view) => (
							<a key={view} href={`#${view}`} aria-current={activeView === view ? "page" : undefined}>
								{view[0].toUpperCase() + view.slice(1)}
							</a>
						))}
					</nav>
				</header>

				<main className="fn-main">
					{recordState.error && <p className="fn-storage-error" role="alert">{recordState.error}</p>}

					{activeView === "home" && (
						<section className="fn-view" aria-labelledby="fn-home-title">
							<div className="fn-page-heading">
								<div>
									<p className="fn-eyebrow">Your record book</p>
									<h1 id="fn-home-title">A clear view of every entry.</h1>
									<p className="fn-intro">Keep names, dates and details together. Each record is saved as soon as you add it.</p>
								</div>
								<a className="fn-button" href="#records"><span className="fn-plus" aria-hidden="true">+</span> Add a record</a>
							</div>

							<div className="fn-stats" aria-label="Record summary">
								<article className="fn-stat"><p className="fn-stat-label">Total records</p><p className="fn-stat-value">{records.length}</p></article>
								<article className="fn-stat"><p className="fn-stat-label">Added today</p><p className="fn-stat-value">{todaysCount}</p></article>
								<article className="fn-stat"><p className="fn-stat-label">Latest entry</p><p className="fn-stat-value">{records.length ? formatDate(records[0].date) : "--"}</p></article>
							</div>

							<div className="fn-section-heading">
								<h2>Recently added</h2>
								<a className="fn-text-link" href="#records">View all records</a>
							</div>
							<RecordTable records={records.slice(0, 6)} emptyMessage={EMPTY_MESSAGE} />
						</section>
					)}

					{activeView === "records" && (
						<section className="fn-view" aria-labelledby="fn-records-title">
							<div className="fn-page-heading">
								<div>
									<p className="fn-eyebrow">The register</p>
									<h1 id="fn-records-title">Add a record.</h1>
									<p className="fn-intro">Enter the details below. The time is recorded automatically when you save.</p>
								</div>
							</div>
							<div className="fn-panel">
								<form onSubmit={saveRecord}>
									<div className="fn-form-grid">
										<div className="fn-field">
											<label htmlFor="fn-serial">Serial number</label>
											<input id="fn-serial" name="serial" type="text" placeholder="e.g. 001" autoComplete="off" required value={formValues.serial} onChange={updateForm} />
											<p className="fn-field-hint">Must be unique for each record.</p>
										</div>
										<div className="fn-field">
											<label htmlFor="fn-name">Name</label>
											<input id="fn-name" name="name" type="text" placeholder="Full name" autoComplete="name" required value={formValues.name} onChange={updateForm} />
										</div>
										<div className="fn-field">
											<label htmlFor="fn-date">Date of entry</label>
											<input id="fn-date" name="date" type="date" required value={formValues.date} onChange={updateForm} />
										</div>
										<div className="fn-field">
											<label htmlFor="fn-gender">Gender</label>
											<select id="fn-gender" name="gender" required value={formValues.gender} onChange={updateForm}>
												<option value="" disabled>Select gender</option>
												<option>Female</option>
												<option>Male</option>
												<option>Non-binary</option>
												<option>Prefer not to say</option>
												<option>Another identity</option>
											</select>
										</div>
									</div>
									<p className="fn-notice" role="status" aria-live="polite">{notice}</p>
									<div className="fn-form-actions">
										<button className="fn-button" type="submit">Save record</button>
										<a className="fn-quiet-link" href="#home">Cancel</a>
									</div>
								</form>
							</div>
							<div className="fn-records-list">
								<div className="fn-section-heading">
									<h2>All records</h2>
									<a className="fn-text-link" href="#search">Search by serial number</a>
								</div>
								<RecordTable records={records} emptyMessage={EMPTY_MESSAGE} />
							</div>
						</section>
					)}

					{activeView === "search" && (
						<section className="fn-view" aria-labelledby="fn-search-title">
							<div className="fn-page-heading">
								<div>
									<p className="fn-eyebrow">Find an entry</p>
									<h1 id="fn-search-title">Search by serial number.</h1>
									<p className="fn-intro">Look up a record using its exact serial number.</p>
								</div>
							</div>
							<div className="fn-panel fn-search-panel">
								<form className="fn-search-form" onSubmit={findRecord}>
									<input
										type="search"
										placeholder="Enter a serial number"
										aria-label="Serial number to search"
										autoComplete="off"
										required
										value={searchValue}
										onChange={(event) => setSearchValue(event.target.value)}
									/>
									<button className="fn-button" type="submit">Find record</button>
								</form>
								<div className="fn-search-result" aria-live="polite">
									{searchResult && (
										searchResult.notFound ? (
											<p className="fn-result-message not-found">No record found with that serial number.</p>
										) : (
											<div className="fn-search-card">
												{[
													["Serial number", searchResult.serial],
													["Name", searchResult.name],
													["Date of entry", formatDate(searchResult.date)],
													["Gender", searchResult.gender],
													["Time added", searchResult.time],
												].map(([label, value]) => (
													<div className="fn-result-item" key={label}>
														<span>{label}</span>
														<strong>{value}</strong>
													</div>
												))}
											</div>
										)
									)}
								</div>
							</div>
						</section>
					)}
				</main>

				<footer className="fn-footer">
					<span>Fieldnotes · A simple record book</span>
					<span>Records are saved in this browser.</span>
				</footer>
			</div>
		</>
	);
}
