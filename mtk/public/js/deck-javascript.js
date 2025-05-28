// Algemene modal handler
function initializeModal(modalId, openButtonsSelector) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const closeBtn = modal.querySelector('.close');
    
    // Open modal
    document.querySelectorAll(openButtonsSelector).forEach(btn => {
        btn.addEventListener('click', (e) => {
            const deckCard = e.target.closest('.deck-card');
            if(deckCard) {
                const deckName = deckCard.querySelector('h2').textContent;
                const deckColors = Array.from(deckCard.querySelectorAll('.mana-icon'))
                    .map(icon => icon.alt.charAt(0));
                
                document.getElementById('edit-deck-name').value = deckName;
                setColorCheckboxes(deckColors);
            }
            modal.style.display = 'block';
        });
    });

    // Sluit modal
    const closeModal = () => modal.style.display = 'none';
    
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
    });

    return { modal, closeModal };
}

// Checkbox handler
function setColorCheckboxes(selectedColors) {
    document.querySelectorAll('#edit-deck-modal input[name="colors"]').forEach(checkbox => {
        checkbox.checked = selectedColors.includes(checkbox.value);
    });
}

// Initialisatie
document.addEventListener('DOMContentLoaded', () => {
    // Add Deck Modal
    initializeModal('deck-modal', '#add-deck-button');
    
    // Edit Deck Modal
    initializeModal('edit-deck-modal', '.edit-btn');

    // Globale click handler voor alle modals
    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if(e.target === modal) modal.style.display = 'none';
        });
    });
});