document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo');
    const searchBtn = document.querySelector('.search-btn');
    const authBtns = document.querySelectorAll('.auth-btn');
    const profileLink = document.querySelector('.profile-link');
    const authButtons = document.querySelectorAll('.show-when-logged-out');
    const signoutBtn = document.querySelector('.signout-btn');
    const coursesSection = document.querySelector('.courses-section');
    
    // Logo rotation on scroll
    let lastScrollPosition = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const rotation = (currentScroll - lastScrollPosition) / 2;
        logo.style.transform = `rotateY(${rotation}deg)`;
        lastScrollPosition = currentScroll;
    });
    
    // Add scroll event listener for logo rotation
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    

    
    // Search functionality
    searchBtn.addEventListener('click', () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (!isLoggedIn) {
            showError('Please log in to search for mentors');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
    });

    // Mock login functionality
    function login() {
        localStorage.setItem('isLoggedIn', 'true');
        authBtns.forEach(btn => btn.style.display = 'none');
        signoutBtn.style.display = 'inline-block';
        coursesSection.style.display = 'block';
    }

    // Mock logout functionality
    signoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        checkAuthState();
        window.location.href = 'index.html';
    });

    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    // Check login status on page load
    if (localStorage.getItem('isLoggedIn')) {
        login();
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const profileLink = document.querySelector('.profile-link');
    const authButtons = document.querySelectorAll('.show-when-logged-out');
    const signoutBtn = document.querySelector('.signout-btn');

    // Check if user is logged in
    function checkAuthState() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (isLoggedIn) {
            // Show profile and sign out, hide login/signup
            profileLink.style.display = 'flex';
            signoutBtn.style.display = 'flex';
            authButtons.forEach(btn => btn.style.display = 'none');
        } else {
            // Hide profile and sign out, show login/signup
            profileLink.style.display = 'none';
            signoutBtn.style.display = 'none';
            authButtons.forEach(btn => btn.style.display = 'flex');
        }
    }

    // Initial check
    checkAuthState();

    // Handle sign out
    signoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        checkAuthState();
        window.location.href = 'index.html';
    });
});


// Check authentication state on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
});

function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.querySelector('a[href="login.html"]');
    const signupBtn = document.querySelector('a[href="signup.html"]');
    const signoutBtn = document.querySelector('.signout-btn');
    const profileLink = document.querySelector('.profile-link');

    if (user) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (signoutBtn) signoutBtn.style.display = 'inline-block';
        if (profileLink) profileLink.style.display = 'flex';
    } else {
        // User is logged out
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (signoutBtn) signoutBtn.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';
    }
}

// Handle sign out
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    
    const signoutBtn = document.querySelector('.signout-btn');
    if (signoutBtn) {
        signoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            updateAuthUI();
            window.location.href = 'index.html';
        });
    }
});

// Add this to your existing main.js
document.addEventListener('DOMContentLoaded', () => {
    const mentorLink = document.querySelector('a[href="#mentor"]');
    
    mentorLink.addEventListener('click', (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user) {
            showLoginAlert();
            return;
        }
        
        showMentorMenu();
    });
});

function showLoginAlert() {
    const alertBox = document.createElement('div');
    alertBox.className = 'alert-box';
    alertBox.innerHTML = `
        <div class="alert-content">
            <h3>Please Login First</h3>
            <p>You need to be logged in to access mentor features.</p>
            <button onclick="window.location.href='login.html'">Login Now</button>
        </div>
    `;
    document.body.appendChild(alertBox);
    
    setTimeout(() => {
        alertBox.classList.add('show');
    }, 100);

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

function showMentorMenu() {
    const mentorMenu = document.createElement('div');
    mentorMenu.className = 'mentor-menu';
    mentorMenu.innerHTML = `
        <div class="mentor-menu-content">
            <h3>Mentor Services</h3>
            <div class="menu-items">
                <a href="#schedule" class="menu-item">
                    <i class="fas fa-calendar"></i>
                    Schedule Meeting
                </a>
                <a href="#chat" class="menu-item">
                    <i class="fas fa-comments"></i>
                    Chat with Mentor
                </a>
                <a href="#timing" class="menu-item">
                    <i class="fas fa-clock"></i>
                    Available Timings
                </a>
            </div>
            <button class="close-menu">Close</button>
        </div>
    `;
    document.body.appendChild(mentorMenu);
    
    setTimeout(() => {
        mentorMenu.classList.add('show');
    }, 100);

    mentorMenu.querySelector('.close-menu').addEventListener('click', () => {
        mentorMenu.classList.remove('show');
        setTimeout(() => {
            mentorMenu.remove();
        }, 300);
    });
}