document.addEventListener("DOMContentLoaded", async () => {
  const createDeckPopup = document.getElementById("create-deck-popup");
  const addDeckButton = document.getElementById("add-deck-button");
  const closePopupButton = document.getElementById("close-popup");
  const createDeckForm = document.getElementById("create-deck-form");
  const deckCollection = document.getElementById("deck-collection");

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
    const res = await fetch("/api/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: deckName })
    });
    if (res.ok) {
      createDeckPopup?.classList.remove("show");
      setTimeout(() => {
        createDeckPopup?.classList.add("hidden");
        window.location.reload();
      }, 300);
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
        <img src="${deck.image || '/assets/default-deck.jpg'}" alt="${deck.name}" />
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
