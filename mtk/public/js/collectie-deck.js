document.addEventListener("DOMContentLoaded", async () => {
    let chosen = []; // [{name: "Kaartnaam", count: 2}, ...]
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
      // deck.cards: ["Kaart1", "Kaart2", "Kaart1", ...]
      // Zet om naar [{name, count}]
      const cardMap = {};
      (deck.cards || []).forEach(card => {
        cardMap[card] = (cardMap[card] || 0) + 1;
      });
      chosen = Object.entries(cardMap).map(([name, count]) => ({ name, count }));
      renderChosen();
    }

    // Toon gekozen kaarten met + en - knoppen
    function renderChosen() {
      chosenCards.innerHTML = "";
      let total = chosen.reduce((sum, c) => sum + c.count, 0);
      chosen.forEach((cardObj, idx) => {
        const li = document.createElement("li");
        li.textContent = `${cardObj.name} (${cardObj.count})`;

        // Verlaag knop
        const minusBtn = document.createElement("button");
        minusBtn.textContent = "-";
        minusBtn.onclick = () => {
          if (cardObj.count > 1) {
            cardObj.count--;
          } else {
            chosen.splice(idx, 1);
          }
          renderChosen();
        };
        li.appendChild(minusBtn);

        // Verhoog knop
        const plusBtn = document.createElement("button");
        plusBtn.textContent = "+";
        plusBtn.onclick = () => {
          let total = chosen.reduce((sum, c) => sum + c.count, 0);
          if (cardObj.count < 4 && total < 60) {
            cardObj.count++;
            renderChosen();
          }
        };
        li.appendChild(plusBtn);

        chosenCards.appendChild(li);
      });
      cardCount.textContent = chosen.reduce((sum, c) => sum + c.count, 0);
      saveBtn.disabled = chosen.length === 0 || chosen.reduce((sum, c) => sum + c.count, 0) > 60;
    }

    // Kaart toevoegen (bijvoorbeeld bij klik op kaart)
    function addCard(cardName) {
      let total = chosen.reduce((sum, c) => sum + c.count, 0);
      let cardObj = chosen.find(c => c.name === cardName);
      if (total < 60) {
        if (cardObj) {
          if (cardObj.count < 4) {
            cardObj.count++;
          }
        } else {
          chosen.push({ name: cardName, count: 1 });
        }
        renderChosen();
      }
    }

    // Opslaan
    saveBtn.addEventListener("click", async () => {
      // Zet om naar array van kaartnamen
      const cards = chosen.flatMap(cardObj => Array(cardObj.count).fill(cardObj.name));
      await fetch("/api/decks/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckName, cards })
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