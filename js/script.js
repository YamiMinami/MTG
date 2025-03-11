document.addEventListener("DOMContentLoaded", function () {
    var mainCarousel = new Flickity('.main-carousel', {
      contain: true,
      wrapAround: true,
      pageDots: false,
      prevNextButtons: false,
      autoPlay: 5000,
      draggable: true,
      selectedAttraction: 0.01,
      friction: 0.25,
    });
  
    var navCarousel = new Flickity('.carousel-nav', {
      asNavFor: '.main-carousel', 
      contain: true,
      pageDots: false,
      prevNextButtons: false,
      cellAlign: 'center',
      draggable: false,
      selectedAttraction: 0.01,
      friction: 0.25,
    });
});
// let addButtondeck = document.getElementById("add-deck-button")

// addButtondeck.addEventListener("click", (e) => {
//   let popup = document.getElementById("add-to-deckcollection");
//   popup.classList.add("show");
//   })
let addButtondeck = document.getElementById("add-deck-button");

if (addButtondeck) {
  addButtondeck.addEventListener("click", () => {
    let popup = document.getElementById("add-to-deckcollection");
    if (popup) {
      popup.classList.toggle("show");
    }
  });
}


  