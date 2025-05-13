let addButtondeck = document.getElementById("add-deck-button");
let popup = document.querySelector(".add-to-deckcollection");
let closeButton = document.getElementById("close-button");

if (addButtondeck && popup) {
  addButtondeck.addEventListener("click", () => {
    popup.classList.add("show");
  });

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      popup.classList.remove("show");
    });
  }

  document.addEventListener("click", (event) => {
    if (!popup.contains(event.target) && event.target !== addButtondeck) {
      popup.classList.remove("show");
    }
  });
}

console.log("Mana button script geladen");

document.querySelectorAll('.deck-type').forEach(button => {
  button.addEventListener('click', () => {
    const manaColor = button.id;
    console.log(`Button clicked: ${manaColor}`);
    const params = new URLSearchParams(window.location.search);
    params.set('mana', manaColor);
    window.location.search = params.toString(); // force reload
  });
});

