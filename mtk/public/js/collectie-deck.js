document.addEventListener("DOMContentLoaded", async () => {
    let chosen = [];
    const cardCount = document.getElementById("card-count");
    const chosenCards = document.getElementById("chosen-cards");
    const saveBtn = document.getElementById("save-deck");
  
    // Decknaam ophalen uit URL
    const params = new URLSearchParams(window.location.search);
    const deckName = params.get("deck");
  
    // Laad bestaande kaarten uit het deck
    async function loadDeck() {
      const res = await fetch(`/api/decks/get?name=${encodeURIComponent(deckName)}`);
      const deck = await res.json();
      chosen = deck.cards || [];
      renderChosen();
    }
  
    // Toon gekozen kaarten met verwijderknop
    function renderChosen() {
      chosenCards.innerHTML = "";
      chosen.forEach((card, idx) => {
        const li = document.createElement("li");
        li.textContent = card;
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "x";
        removeBtn.onclick = () => {
          chosen.splice(idx, 1);
          renderChosen();
        };
        li.appendChild(removeBtn);
        chosenCards.appendChild(li);
      });
      cardCount.textContent = chosen.length;
      saveBtn.disabled = chosen.length === 0 || chosen.length > 60;
    }
  
    // Kaart toevoegen (bijvoorbeeld bij klik op kaart)
    function addCard(cardName) {
      if (chosen.length < 60 && !chosen.includes(cardName)) {
        chosen.push(cardName);
        renderChosen();
      }
    }
  
    // Opslaan
    saveBtn.addEventListener("click", async () => {
      await fetch("/api/decks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckName, cards: chosen })
      });
      alert("Deck opgeslagen!");
    });
  
    loadDeck();
  
    // Kaarten klikbaar maken
    document.querySelectorAll("#main-card-container article img").forEach(img => {
      img.addEventListener("click", () => {
        addCard(img.alt || img.getAttribute("data-name"));
      });
    });
  });