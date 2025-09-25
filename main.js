document.addEventListener("DOMContentLoaded", () => {
	/* ----- MENU ----- */
	const menuTargets = ["../menu.html", "../../menu.html", "menu.html", "/menu.html"];
	(function loadMenu(i = 0) {
		if (i >= menuTargets.length) return console.error("Menu introuvable");
		fetch(menuTargets[i])
			.then(r => r.ok ? r.text() : Promise.reject())
			.then(html => {
				const c = document.getElementById("menu-container");
				if (c) c.innerHTML = html;
			})
			.catch(() => loadMenu(i + 1));
	})();

	/* ----- TYPEWRITER ----- */
	function typeWriter(el, text, speed = 23) {
		let i = 0;
		(function tick() {
			if (i < text.length) {
				const s = document.createElement("span");
				s.textContent = text.charAt(i);
				s.classList.add("typing-char");
				el.appendChild(s);
				setTimeout(() => s.classList.remove("typing-char"), speed * 1.5);
				i++;
				setTimeout(tick, speed);
			}
		})();
	}

	document.querySelectorAll(".typewriter").forEach(el => {
		const text = el.getAttribute("data-text") || el.textContent;
		el.innerHTML = "";
		typeWriter(el, text, 23);
	});

	/* ----- CURSEUR ----- */
	let cursor = document.querySelector(".cursor");
	if (!cursor) {
		cursor = document.createElement("div");
		cursor.className = "cursor";
		document.body.appendChild(cursor);
	}

	let rectMode = false;
	const PAD_X = 6, PAD_Y = 4;
	let lastX = 0, lastY = 0, rafId = null;
	let activeMenuLink = null;

	function setCursorRect(rect, mode = "rect") {
		rectMode = true;
		cursor.className = "cursor " + mode; // applique .rect ou .word-rect
		cursor.style.width = (rect.width + PAD_X * 2) + "px";
		cursor.style.height = (rect.height + PAD_Y * 2) + "px";
		cursor.style.left = (rect.left + rect.width / 2) + "px";
		cursor.style.top = (rect.top + rect.height / 2) + "px";
	}

	function setCursorRound(x, y) {
		if (rectMode) {
			rectMode = false;
			cursor.className = "cursor";
			cursor.style.width = "16px";
			cursor.style.height = "16px";
		}
		cursor.style.left = x + "px";
		cursor.style.top = y + "px";
	}

	// utilitaires pour les citations
	const pointInRect = (x, y, r) =>
		x >= r.left && x <= r.left + r.width && y >= r.top && y <= r.top + r.height;

	const isWordChar = ch => !!ch && /[^\s“”"«»'’.,;:!?()[\]{}]/.test(ch);

	function spanAtPoint(x, y) {
		const el = document.elementFromPoint(x, y);
		if (!el) return null;
		const container = el.closest(".typewriter");
		if (!container) return null;
		const spans = container.querySelectorAll("span");
		for (let s of spans) {
			const r = s.getBoundingClientRect();
			if (pointInRect(x, y, r)) return s;
		}
		return null;
	}

	function wordRectFromSpan(span) {
		if (!span || span.tagName !== "SPAN" || !isWordChar(span.textContent)) return null;
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

	function processMouse() {
		rafId = null;
		const x = lastX, y = lastY;
		const el = document.elementFromPoint(x, y);

		// ---- Menu ----
		const menuLink = el && el.closest("nav.menu a");
		if (menuLink) {
			if (activeMenuLink !== menuLink) {
				if (activeMenuLink) activeMenuLink.classList.remove("is-highlighted");
				activeMenuLink = menuLink;
				activeMenuLink.classList.add("is-highlighted");
			}
			const r = menuLink.getBoundingClientRect();
			setCursorRect(r, "rect"); // halo
			return;
		} else if (activeMenuLink) {
			activeMenuLink.classList.remove("is-highlighted");
			activeMenuLink = null;
		}

		// ---- Citations ----
		const s = spanAtPoint(x, y);
		if (s && s.parentElement && s.parentElement.classList.contains("typewriter")) {
			const wr = wordRectFromSpan(s);
			if (wr && pointInRect(x, y, wr)) {
				setCursorRect(wr, "word-rect"); // contour vert vide
				return;
			}
		}

		// ailleurs → rond
		setCursorRound(x, y);
	}

	document.addEventListener("mousemove", e => {
		lastX = e.clientX; lastY = e.clientY;
		if (!rafId) rafId = requestAnimationFrame(processMouse);
	});

	document.addEventListener("keydown", e => {
		if (e.key === "Escape") {
			rectMode = false;
			cursor.className = "cursor";
			if (activeMenuLink) {
				activeMenuLink.classList.remove("is-highlighted");
				activeMenuLink = null;
			}
		}
	});
});
