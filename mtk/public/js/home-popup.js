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

document.addEventListener('DOMContentLoaded', () => {
  const rarityColors = {
    common:    '#737373',  // gray
    uncommon:  '#1d833f',  // green
    rare:      '#1a65c0',  // blue
    mythic:    '#d97706'   // orange
  };

    document.querySelectorAll('.collection-cards').forEach(card => {
    const rarity = el.getAttribute('data-rarity');
    const color  = rarityColors[rarity] || 'transparent';
    card.style.border = `4px solid ${color}`;
    card.style.borderRadius = '8px';
  });
});