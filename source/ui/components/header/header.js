function toggleMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const menu = document.getElementById('sideMenu');
    menuBtn.classList.toggle("d-none");
    menu.classList.toggle('open');
  }