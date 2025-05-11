import { Decks } from "../../interfaces";
document.addEventListener("DOMContentLoaded", () => {
  const createDeckPopup = document.getElementById("create-deck-popup");
  const addDeckButton = document.getElementById("add-deck-button");
  const closePopupButton = document.getElementById("close-popup");

  // Open de pop-up wanneer op de "add-deck-button" wordt geklikt
  addDeckButton?.addEventListener("click", () => {
    createDeckPopup?.classList.remove("hidden");
  });

  // Sluit de pop-up wanneer op de "close-popup" knop wordt geklikt
  closePopupButton?.addEventListener("click", () => {
    createDeckPopup?.classList.add("hidden");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const createDeckPopup = document.getElementById("create-deck-popup") as HTMLElement;
  const closePopupButton = document.getElementById("close-popup") as HTMLElement;
  const saveDeckButton = document.getElementById("save-deck-button") as HTMLElement;
  const createDeckForm = document.getElementById("create-deck-form") as HTMLFormElement;

  document.getElementById("add-deck-button")?.addEventListener("click", () => {
    createDeckPopup.classList.remove("hidden");
  });

  closePopupButton.addEventListener("click", () => {
    createDeckPopup.classList.add("hidden");
  });

  createDeckForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const deckName = (document.getElementById("deck-name") as HTMLInputElement).value;
    const deckImage = (document.querySelector('input[name="deck-image"]:checked') as HTMLInputElement).value;

    const decks: Decks[] = JSON.parse(localStorage.getItem("decks") || "[]");
    const newDeck: Decks = {
      id: crypto.randomUUID(),
      name: deckName,
      cards: [], 
    };

    decks.push(newDeck);
    localStorage.setItem("decks", JSON.stringify(decks));
    window.location.href = "collection.html";
  });
});
