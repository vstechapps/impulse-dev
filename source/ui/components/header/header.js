function toggleMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const menu = document.getElementById('sideMenu');
    menuBtn.classList.toggle("d-none");
    menu.classList.toggle('open');
}

function updateMenuForUser() {
    const user = window.Firebase && typeof Firebase.getUser === 'function' ? Firebase.getUser() : null;
    const userInfo = document.getElementById('userInfo');
    const userImage = document.getElementById('userImage');
    const userName = document.getElementById('userName');
    const loginMenuItem = document.getElementById('loginMenuItem');
    const logoutMenuItem = document.getElementById('logoutMenuItem');
    if (user && user.email) {
        if (userInfo) userInfo.style.display = 'flex';
        if (userImage) userImage.src = user.image || '';
        if (userName) userName.textContent = user.name || user.email;
        if (loginMenuItem) loginMenuItem.style.display = 'none';
        if (logoutMenuItem) logoutMenuItem.style.display = 'flex';
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (loginMenuItem) loginMenuItem.style.display = '';
        if (logoutMenuItem) logoutMenuItem.style.display = 'none';
    }
}

// Logout handler
function handleLogout() {
    if (window.Firebase && Firebase.auth) {
        Firebase.auth.signOut().then(() => {
            updateMenuForUser();
            window.location.href = '/';
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateMenuForUser();
    const logoutMenuItem = document.getElementById('logoutMenuItem');
    if (logoutMenuItem) {
        logoutMenuItem.onclick = handleLogout;
    }
    // Listen for auth state changes to update menu
    if (window.Firebase && Firebase.auth) {
        Firebase.auth.onAuthStateChanged(() => {
            updateMenuForUser();
        });
    }
});