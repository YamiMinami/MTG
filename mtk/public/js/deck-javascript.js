document.addEventListener("DOMContentLoaded", () => {
    const openModal = modal => modal.classList.replace("hidden", "show");
    const closeModal = modal => modal.classList.replace("show", "hidden");

    // Sluit modals via close-btn of backdrop
    document.querySelectorAll(".modal-close, .close").forEach(btn => {
        btn.addEventListener("click", () => {
            const modal = btn.closest(".modal-overlay");
            if (modal) closeModal(modal);
        });
    });
    document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.addEventListener("click", e => {
            if (e.target === modal) closeModal(modal);
        });
    });

    // 1) Nieuw Deck
    const newModalBtn = document.getElementById("add-deck-button");
    const deckModal = document.getElementById("deck-modal");
    newModalBtn.addEventListener("click", () => openModal(deckModal));

    // 2) Edit Deck
    const editModal = document.getElementById("edit-deck-modal");
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const cardElem = btn.closest(".deck-card");
            if (!cardElem) return;

            // Vul naam
            document.getElementById("edit-deck-name").value =
                cardElem.querySelector("h2").textContent.trim();

            // Vul kleuren
            const selected = Array.from(cardElem.querySelectorAll(".mana-icon"))
                .map(img => img.alt.charAt(0));
            document.querySelectorAll(
                "#edit-color-options input[name='colors']"
            ).forEach(cb => cb.checked = selected.includes(cb.value));

            // Update form-action
            document.getElementById("edit-deck-form")
                .action = `/deck/${cardElem.dataset.deckId}?_method=PUT`;

            openModal(editModal);
        });
    });

    // 3) View Cards
    document.querySelectorAll(".view-cards-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const modal = document.getElementById(btn.dataset.target);
            if (modal) openModal(modal);
        });
    });
});
