document.addEventListener("DOMContentLoaded", function () {
    const playIcon = document.getElementById("ftu-play-icon");
    const popup = document.getElementById("ftu-welcome-container");
    const overlay = document.getElementById("overlay");

    // Show overlay on page load
    if (overlay) {
        overlay.style.display = "block";
    }

    if (playIcon) {
        playIcon.addEventListener("click", async function (e) {
            e.preventDefault();

            const avatarInput = document.querySelector('input[name="avatar"]:checked');
            const usernameInput = document.querySelector('#ftu-gebruikersnaam input');

            if (!avatarInput || !usernameInput || !usernameInput.value.trim()) {
                alert("Selecteer een avatar en vul een naam in.");
                return;
            }

            const avatar = avatarInput.id + ".png";
            const username = usernameInput.value;

            try {
                const response = await fetch("/setup-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ avatar, username })
                });

                if (response.ok) {
                    window.location.reload(); // Refresh to apply avatar
                } else {
                    const errorText = await response.text();
                    alert("Fout bij opslaan profiel: " + errorText);
                }
            } catch (error) {
                console.error("Serverfout:", error);
                alert("Er is iets misgegaan bij het verzenden.");
            }
        });
    }
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