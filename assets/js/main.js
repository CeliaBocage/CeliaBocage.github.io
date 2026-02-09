document.getElementById('year').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function() {

    const toggleButton = document.querySelector('.menu-toggle');
    const navList = document.querySelector('nav ul');

    if (toggleButton && navList) {

        toggleButton.addEventListener('click', function() {

            navList.classList.toggle('open');

            if (navList.classList.contains('open')) {
                toggleButton.textContent = "\u2715 Fermer";
            } else {
                toggleButton.textContent = "\u2630 Menu";
            }
        });
    } else {
        console.error("Erreur : Le bouton menu ou la liste n'a pas \u00e9t\u00e9 trouv\u00e9.");
    }
});
