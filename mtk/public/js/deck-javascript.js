 // Modal functionaliteit
        const modal = document.getElementById('deck-modal');
        const span = document.getElementsByClassName('close')[0];

        document.getElementById('add-deck-button').onclick = () => {
            modal.style.display = 'block';
        }

        span.onclick = () => {
            modal.style.display = 'none';
        }

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        }