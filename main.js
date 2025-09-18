// Charger automatiquement le menu + effet machine à écrire
document.addEventListener("DOMContentLoaded", () => {
	// Charger le menu
	fetch("../menu.html")
		.then(response => response.text())
		.then(data => {
			document.getElementById("menu-container").innerHTML = data;
		})
		.catch(error => console.error("Erreur de chargement du menu:", error));

	// Fonction d'écriture
	function typeWriter(element, text, speed = 10) {
		let i = 0;
		function typing() {
			if (i < text.length) {
				const span = document.createElement("span");
				span.textContent = text.charAt(i);
				span.classList.add("typing-char");
				element.appendChild(span);

				setTimeout(() => {
					span.classList.remove("typing-char");
				}, 150);

				i++;
				setTimeout(typing, speed);
			}
		}
		typing();
	}

	// Appliquer l'effet sur tous les éléments .typewriter
	document.querySelectorAll(".typewriter").forEach(el => {
		const text = el.getAttribute("data-text");
		el.innerHTML = "";
		typeWriter(el, text, 80);
	});
});
