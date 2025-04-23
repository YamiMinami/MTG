document.addEventListener("DOMContentLoaded", function () {
    var mainCarousel = new Flickity('#main-carousel', {
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
      asNavFor: '#main-carousel', 
      contain: true,
      pageDots: false,
      prevNextButtons: false,
      cellAlign: 'center',
      draggable: false,
      selectedAttraction: 0.01,
      friction: 0.25,
    });
});



  