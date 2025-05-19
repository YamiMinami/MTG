document.addEventListener("DOMContentLoaded", () => {
  const createDeckPopup = document.getElementById("create-deck-popup");
  const addDeckButton = document.getElementById("add-deck-button");
  const closePopupButton = document.getElementById("close-popup");

  
  addDeckButton?.addEventListener("click", () => {
    createDeckPopup?.classList.remove("hidden");
    createDeckPopup?.classList.add("show");
  });

  
  closePopupButton?.addEventListener("click", () => {
    createDeckPopup?.classList.remove("show");
    setTimeout(() => {
      createDeckPopup?.classList.add("hidden");
    }, 300); 
  });
});
