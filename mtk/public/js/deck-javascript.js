document.addEventListener("DOMContentLoaded", async () => {
  const createDeckPopup = document.getElementById("create-deck-popup");
  const addDeckButton = document.getElementById("add-deck-button");
  const closePopupButton = document.getElementById("close-popup");
  const createDeckForm = document.getElementById("create-deck-form");
  const deckCollection = document.getElementById("deck-collection");
  const generateDeckButton = document.getElementById("generate-random-deck");

  // Maak een verwijder-popup aan als die nog niet bestaat
  let deletePopup = document.getElementById("delete-deck-popup");
  if (!deletePopup) {
    deletePopup = document.createElement("section");
    deletePopup.id = "delete-deck-popup";
    deletePopup.className = "popup hidden";
    deletePopup.innerHTML = `
      <div class="popup-content-deck">
        <h2>Weet je zeker dat je dit deck wilt verwijderen?</h2>
        <div style="display:flex;gap:1em;">
          <button id="confirm-delete-yes" class="deck-buttons">Ja</button>
          <button id="confirm-delete-no" class="deck-buttons">Nee</button>
        </div>
      </div>
    `;
    document.body.appendChild(deletePopup);
  }

  let deckIdToDelete = null;

  // Pop-up openen
  addDeckButton?.addEventListener("click", () => {
    createDeckPopup?.classList.remove("hidden");
    createDeckPopup?.classList.add("show");
  });

  // Pop-up sluiten
  closePopupButton?.addEventListener("click", () => {
    createDeckPopup?.classList.remove("show");
    setTimeout(() => {
      createDeckPopup?.classList.add("hidden");
    }, 300);
  });

  // Deck aanmaken
  createDeckForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const deckName = document.getElementById("deck-name").value;
    const deckBackground = document.querySelector('input[name="deck-background"]:checked')?.value;
    const res = await fetch("/api/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: deckName, background: deckBackground })
    });
    if (res.ok) {
      createDeckPopup?.classList.remove("show");
      setTimeout(() => {
        createDeckPopup?.classList.add("hidden");
        window.location.reload();
      }, 300);
    }
  });

  // Willekeurig genereren
  generateDeckButton?.addEventListener("click", async () => {
    const deckName = document.getElementById("deck-name").value;
    const deckBackground = document.getElementById("deck-background").value;
    if (!deckName) {
      alert("Vul eerst een decknaam in!");
      return;
    }
    // Haal alle beschikbare kaarten op
    const res = await fetch("/api/cards/all");
    const allCards = await res.json();

    if (!Array.isArray(allCards) || allCards.length === 0) {
      alert("Geen kaarten beschikbaar om een deck te genereren!");
      return;
    }

    // Shuffle en pak maximaal 60 unieke kaarten
    const shuffled = allCards.sort(() => 0.5 - Math.random());
    const chosen = shuffled.slice(0, Math.min(60, allCards.length)).map(card => card.name || card);

    // Maak het deck aan via de backend
    const createRes = await fetch("/api/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: deckName, cards: chosen, background: deckBackground })
    });

    if (createRes.ok) {
      createDeckPopup?.classList.remove("show");
      setTimeout(() => {
        createDeckPopup?.classList.add("hidden");
        window.location.reload();
      }, 300);
    } else {
      alert("Er is iets misgegaan bij het aanmaken van het deck.");
    }
  });

  // Decks ophalen en tonen
  async function loadDecks() {
    const res = await fetch("/api/decks/user");
    const decks = await res.json();
    deckCollection.innerHTML = "";

    decks.forEach(deck => {
      const article = document.createElement("article");
      article.classList.add("deck");
      article.innerHTML = `
        <div class="deck-bg" style="background-image:url('${deck.background || '/assets/default-deck.jpg'}')">
          <img src="${deck.image || '/assets/default-deck.jpg'}" alt="${deck.name}" />
        </div>
        <h2>${deck.name}</h2>
        <button class="edit-deck-btn">Bewerk</button>
        <button class="delete-deck-btn">Verwijder</button>
      `;
      // Bewerk-knop functionaliteit
      article.querySelector(".edit-deck-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = `collection.html?deck=${encodeURIComponent(deck.name)}`;
      });
      // Verwijder-knop functionaliteit
      article.querySelector(".delete-deck-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        deckIdToDelete = deck._id;
        deletePopup.classList.remove("hidden");
        deletePopup.classList.add("show");
      });
      // Klik op het artikel zelf navigeert ook
      article.addEventListener("click", () => {
        window.location.href = `collection.html?deck=${encodeURIComponent(deck.name)}`;
      });
      deckCollection.appendChild(article);
    });
  }

  // Popup knoppen
  deletePopup.querySelector("#confirm-delete-yes").addEventListener("click", async () => {
    if (deckIdToDelete) {
      await fetch(`/api/decks/${deckIdToDelete}`, { method: "DELETE" });
      deckIdToDelete = null;
      deletePopup.classList.remove("show");
      setTimeout(() => {
        deletePopup.classList.add("hidden");
        loadDecks();
      }, 300);
    }
  });

  deletePopup.querySelector("#confirm-delete-no").addEventListener("click", () => {
    deckIdToDelete = null;
    deletePopup.classList.remove("show");
    setTimeout(() => {
      deletePopup.classList.add("hidden");
    }, 300);
  });

  await loadDecks();
});
