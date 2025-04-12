document.addEventListener("DOMContentLoaded", function () {
    const playIcon = document.getElementById("ftu-play-icon");
    const popup = document.getElementById("ftu-welcome-container");
    const overlay = document.getElementById("overlay");

    playIcon.addEventListener("click", function () {
        popup.style.display = "none";
        overlay.style.display = "none"; // Verberg de blur wanneer popup sluit
    });

    // Zorg ervoor dat de overlay wordt weergegeven bij het laden
    overlay.style.display = "block";
});
