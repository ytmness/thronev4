// Script para menú lateral móvil

document.addEventListener('DOMContentLoaded', function() {
    const openMenuBtn = document.getElementById('openMenu');
    const sideMenu = document.querySelector('.side-menu');
    const closeMenuBtn = document.getElementById('closeMenu');
    const sideMenuOverlay = document.querySelector('.side-menu-overlay');

    if (openMenuBtn && sideMenu) {
        openMenuBtn.addEventListener('click', function() {
            sideMenu.classList.add('active');
            if (sideMenuOverlay) sideMenuOverlay.classList.add('active');
        });
    }

    if (closeMenuBtn && sideMenu) {
        closeMenuBtn.addEventListener('click', function() {
            sideMenu.classList.remove('active');
            if (sideMenuOverlay) sideMenuOverlay.classList.remove('active');
        });
    }

    if (sideMenuOverlay && sideMenu) {
        sideMenuOverlay.addEventListener('click', function() {
            sideMenu.classList.remove('active');
            sideMenuOverlay.classList.remove('active');
        });
    }
}); 