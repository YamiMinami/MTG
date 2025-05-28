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
    document.getElementById("add-deck-button")
        .addEventListener("click", () => openModal(
            document.getElementById("deck-modal")
        ));

    // 2) View-Cards modals
    document.querySelectorAll(".view-cards-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const m = document.getElementById(btn.dataset.target);
            if (m) openModal(m);
        });
    });
});
