// Charger automatiquement le menu dans toutes les pages
document.addEventListener("DOMContentLoaded", () => {
		fetch("../../menu.html")
		.then(response => response.text())
		.then(data => {
			document.getElementById("menu-container").innerHTML = data;
		})
		.catch(error => console.error("Erreur de chargement du menu:", error));
});