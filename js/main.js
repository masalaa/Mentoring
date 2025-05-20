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
        const searchTerm = document.querySelector('.search-bar').value.trim();
        if (searchTerm.length >= 2) {
            window.location.href = `course-search.html?term=${encodeURIComponent(searchTerm)}`;
        } else {
            showError('Please enter at least 2 characters to search');
        }
    });

    // Mock login functionality
    function login() {
        localStorage.setItem('isLoggedIn', 'true'); // Store login state
        authBtns.forEach(btn => btn.style.display = 'none');
        signoutBtn.style.display = 'inline-block';
        coursesSection.style.display = 'block';
    }

    // Mock logout functionality
    signoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn'); // Clear login state
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
        login(); // Restore login state
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
            profileLink.style.display = 'flex';
            signoutBtn.style.display = 'flex';
            authButtons.forEach(btn => btn.style.display = 'none');
        } else {
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
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (signoutBtn) signoutBtn.style.display = 'inline-block';
        if (profileLink) profileLink.style.display = 'flex';
    } else {
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
    const user = JSON.parse(localStorage.getItem('user'));
    const scheduleLink = document.querySelector('.schedule-link');
    
    if (user) {
        // Show schedule link when logged in
        if (scheduleLink) scheduleLink.style.display = 'inline-block';
    }
    const authNav = document.querySelector('.auth-nav');
    const profileLink = document.querySelector('.profile-link');
    const menteeDashboard = document.querySelector('.mentee-dashboard');
    const mentorDashboard = document.querySelector('.mentor-dashboard');
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const signoutBtn = document.querySelector('.signout-btn');

    if (user) {
        // Hide login/signup buttons
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        
        // Show profile and logout
        profileLink.style.display = 'inline-block';
        signoutBtn.style.display = 'inline-block';

        // Show appropriate dashboard link
        if (user.role === 'mentee') {
            menteeDashboard.style.display = 'inline-block';
        } else if (user.role === 'mentor') {
            mentorDashboard.style.display = 'inline-block';
        }
    }

    // Handle sign out
    signoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // Handle enrollment buttons
    const enrollBtns = document.querySelectorAll('.enroll-btn');
    enrollBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!user) {
                window.location.href = 'login.html';
            } else if (user.role === 'mentee') {
                const courseCard = btn.closest('.enrollment-card');
                const courseName = courseCard.querySelector('h3').textContent;
                window.location.href = `mentee-dashboard.html#courses?enroll=${encodeURIComponent(courseName)}`;
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const mentorLink = document.querySelector('a[href="#mentor"]');
    const dashboardLink = document.querySelector('.dashboard-link');
    const profileLink = document.querySelector('.profile-link');

    // Handle mentor link click
    if (mentorLink) {
        mentorLink.addEventListener('click', (e) => {
            e.preventDefault();
            const user = localStorage.getItem('user');
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            if (!user && !isLoggedIn) {
                showLoginAlert();
                return;
            }
        });
    }

    // Handle dashboard link click
    if (dashboardLink) {
        dashboardLink.addEventListener('click', (e) => {
            const user = localStorage.getItem('user');
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            if (!user && !isLoggedIn) {
                e.preventDefault();
                showLoginAlert();
                return;
            }
        });
    }

    // Handle profile link click
    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('user'));
            const isLoggedIn = localStorage.getItem('isLoggedIn');
    
            if (!user && !isLoggedIn) {
                showLoginAlert();
                return;
            }
    
            // If logged in, fetch and display user profile
            if (user) {
                if (user.role === 'mentee') {
                    window.location.href = `mentee-profile.html?id=${user.id}`;
                } else if (user.role === 'mentor') {
                    window.location.href = `mentor-profile.html?id=${user.id}`;
                }
            }
        });
    }
});

function showLoginAlert() {
    const alertBox = document.createElement('div');
    alertBox.className = 'alert-box';
    alertBox.innerHTML = `
        <div class="alert-content">
            <h3>Please Login First</h3>
            <p>You need to be logged in to access this feature.</p>
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

// Add after existing DOMContentLoaded events
document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            buttonText: {
                today: 'Today',
                month: 'Month',
                week: 'Week'
            },
            height: 'auto',
            selectable: true,
            select: function(info) {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user) {
                    showLoginAlert();
                    return;
                }
                if (user.role === 'mentee') {
                    window.location.href = `mentee-dashboard.html#schedule?date=${info.startStr}`;
                }
            }
        });
        calendar.render();
    }
});

// Contact form handling
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Here you can add code to handle the form submission
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});

window.addEventListener('load', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const authNav = document.querySelector('.auth-nav');
    const dashboardLink = document.querySelector('.dashboard-link');
    const profileLink = document.querySelector('.profile-link');
    const signoutBtn = document.querySelector('.signout-btn');
    const loginBtn = document.querySelectorAll('.auth-btn');

    if (isLoggedIn === 'true') {
        // Show logged in state
        loginBtn.forEach(btn => btn.style.display = 'none');
        if (dashboardLink) dashboardLink.style.display = 'inline-block';
        if (profileLink) profileLink.style.display = 'inline-block';
        if (signoutBtn) signoutBtn.style.display = 'inline-block';
    }

    // Handle sign out
    if (signoutBtn) {
        signoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            window.location.href = 'index.html';
        });
    }
});
