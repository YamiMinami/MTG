const dropdowns = document.querySelectorAll('.dropdown');
dropdowns.forEach(dropdown => {
    const select = dropdown.querySelector('.select');
    const caret = dropdown.querySelector('.caret');
    const menu = dropdown.querySelector('.menu');
    const options = dropdown.querySelectorAll('.menu li');
    const selected = dropdown.querySelector('.selected');

    select.addEventListener('click', () => {
        caret.classList.toggle('caret-rotate');
        menu.classList.toggle('menu-open');
    });
    options.forEach(option => {
        option.addEventListener('click', () => {
            selected.innerText = option.innerText;
            caret.classList.remove('caret-rotate');
            menu.classList.remove('menu-open');
            options.forEach(option => {
                option.classList.remove('active');
            });
            option.classList.add('active');
        });
    });
});

// Trong Werkt hieraan 

document.addEventListener('DOMContentLoaded', () => {
  const rarityColors = {
    common:    '#737373',  
    uncommon:  '#1d833f',  
    rare:      '#1a65c0',  
    mythic:    '#d97706'   
  };

    document.querySelectorAll('.collection-cards').forEach(card => {
    const rarity = card.getAttribute('data-rarity');
    const color  = rarityColors[rarity] || 'transparent';
    card.style.border = `4px solid ${color}`;
    card.style.borderRadius = '20px';
  });
});