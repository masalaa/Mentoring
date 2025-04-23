document.addEventListener('DOMContentLoaded', () => {
    const mentorLink = document.querySelector('a[href="#mentor"]');
    const signoutBtn = document.querySelector('.signout-btn');
    const profileLink = document.querySelector('.profile-link');
    const authButtons = document.querySelectorAll('.show-when-logged-out');

    // Check login status on page load
    function checkAuthState() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (isLoggedIn) {
            profileLink.style.display = 'flex';
            signoutBtn.style.display = 'flex';
            authButtons.forEach(btn => btn.style.display = 'none');
        } else {
            profileLink.style.display = 'none';
            signoutBtn.style.display = 'none';
            authButtons.forEach(btn => btn.style.display = 'flex');
        }
    }

    checkAuthState();

    // Handle sign out
    signoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        checkAuthState();
        window.location.href = 'index.html';
    });

    // Mentor link functionality
    mentorLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (!localStorage.getItem('isLoggedIn')) {
            alert('Please log in to access mentor features');
            window.location.href = 'login.html';
        } else {
            // Proceed with mentor features
        }
    });
});