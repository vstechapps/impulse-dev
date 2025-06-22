function handleGoogleLogin() {
    if (window.Firebase && typeof Firebase.loginWithGoogle === 'function') {
        Firebase.loginWithGoogle()
            .then(user => {
                // Optionally redirect or show a message
                console.log('Google login successful:', user);
                window.location.href = '/'; // Redirect to home or dashboard
            })
            .catch(err => {
                alert('Google login failed.');
                console.error(err);
            });
    } else {
        alert('Google login is not available.');
    }
}

// Traditional login form handler (optional, for completeness)
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            // Implement traditional login logic here
            console.log('Login attempt:', { email, password, remember });
        });
    }
});
