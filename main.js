document.addEventListener("DOMContentLoaded", () => {
	/* ----- MENU ----- */
	fetch("../menu.html")
		.then(r => r.text())
		.then(html => { document.getElementById("menu-container").innerHTML = html; })
		.catch(err => console.error("Erreur de chargement du menu:", err));

	/* ----- TYPEWRITER (lettre lumineuse) ----- */
	function typeWriter(el, text, speed = 23) {
		let i = 0;
		(function tick() {
			if (i < text.length) {
				const s = document.createElement("span");
				s.textContent = text.charAt(i);
				s.classList.add("typing-char");
				el.appendChild(s);
				setTimeout(() => s.classList.remove("typing-char"), speed * 1.5);
				i++; setTimeout(tick, speed);
			}
		})();
	}
	document.querySelectorAll(".typewriter").forEach(el => {
		const text = el.getAttribute("data-text") || el.textContent;
		el.innerHTML = "";
		typeWriter(el, text, 23);
	});

	/* ----- CURSEUR CUSTOM ----- */

	let cursor = document.querySelector(".cursor");
	if (!cursor) {
		cursor = document.createElement("div");
		cursor.className = "cursor";
		document.body.appendChild(cursor);
	}

	let rectMode = false;
	const PAD_X = 6, PAD_Y = 4;

	// utilitaires pour détecter le caractère/texte sous la souris
	function nodeFromPoint(x, y) {
		if (document.caretPositionFromPoint) {
			const pos = document.caretPositionFromPoint(x, y);
			return pos && pos.offsetNode;
		}
		if (document.caretRangeFromPoint) {
			const range = document.caretRangeFromPoint(x, y);
			return range && range.startContainer;
		}
		return null;
	}
	const isWordChar = ch => !!ch && /[^\s“”"«»'’.,;:!?()[\]{}]/.test(ch);

	// construit un rect englobant tout le mot formé par les <span> du typewriter
	function wordRectFromSpan(span) {
		if (!span || span.tagName !== "SPAN") return null;
		if (!isWordChar(span.textContent)) return null;

		let start = span, end = span;
		while (start.previousSibling && start.previousSibling.nodeType === 1 &&
			start.previousSibling.tagName === "SPAN" && isWordChar(start.previousSibling.textContent)) {
			start = start.previousSibling;
		}
		while (end.nextSibling && end.nextSibling.nodeType === 1 &&
			end.nextSibling.tagName === "SPAN" && isWordChar(end.nextSibling.textContent)) {
			end = end.nextSibling;
		}
		const r1 = start.getBoundingClientRect();
		const r2 = end.getBoundingClientRect();
		const top = Math.min(r1.top, r2.top);
		const bottom = Math.max(r1.bottom, r2.bottom);
		const left = Math.min(r1.left, r2.left);
		const right = Math.max(r1.right, r2.right);
		return { left, top, width: right - left, height: bottom - top };
	}

	function setCursorRect(rect) {
		rectMode = true;
		cursor.classList.add("rect");
		cursor.classList.remove("small");
		cursor.style.width = (rect.width + PAD_X * 2) + "px";
		cursor.style.height = (rect.height + PAD_Y * 2) + "px";
		cursor.style.left = (rect.left + rect.width / 2) + "px";
		cursor.style.top = (rect.top + rect.height / 2) + "px";
	}
	function setCursorRound(x, y) {
		if (rectMode) {
			rectMode = false;
			cursor.classList.remove("rect");
			cursor.style.width = "16px";
			cursor.style.height = "16px";
		}
		cursor.style.left = x + "px";
		cursor.style.top = y + "px";
	}

	// boucle souris principale
	document.addEventListener("mousemove", e => {
		const x = e.clientX, y = e.clientY;
		const el = document.elementFromPoint(x, y);
		const overMenu = el && el.closest("nav.menu");

		// si on est au-dessus du menu
		if (overMenu) {
			if (!rectMode) cursor.classList.add("small");
			setCursorRound(x, y);
			return;
		} else {
			cursor.classList.remove("small");
		}

		// 1) encadrer un lien (hors menu)
		const link = el && el.closest("a, .card");
		if (link) {
			const r = link.getBoundingClientRect();
			setCursorRect(r);
			return;
		}

		// 2) encadrer un MOT d'une citation
		const n = nodeFromPoint(x, y);
		if (n && n.nodeType === 3) {
			const span = n.parentElement;
			if (span && span.parentElement && span.parentElement.classList.contains("typewriter")) {
				const wr = wordRectFromSpan(span);
				if (wr) {
					// ⚡ correction anti-blocage : vérifier que la souris est bien dans la zone du mot
					if (
						x >= wr.left && x <= wr.left + wr.width &&
						y >= wr.top && y <= wr.top + wr.height
					) {
						setCursorRect(wr);
						return;
					}
				}
			}
		}

		// sinon → mode rond libre
		setCursorRound(x, y);
	});

	document.addEventListener("keydown", e => {
		if (e.key === "Escape") {
			rectMode = false;
			cursor.classList.remove("rect");
		}
	});
});
