document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Function to check authentication status
    function isAuthenticated() {
        return user && user._id;
    }
    
    // Handle mentor-only pages
    const currentPath = window.location.pathname;
    const isMentorPage = 
        currentPath.includes('create-course.html') || 
        currentPath.includes('mentor.html');
    
    if (isAuthenticated() && isMentorPage && user.role !== 'mentor') {
        alert('Only mentors can access this page');
        window.location.href = 'index.html';
        return;
    }
    
    // Handle navigation buttons with auth checks
    document.querySelectorAll('a[data-requires-auth="true"]').forEach(link => {
        link.addEventListener('click', function(e) {
            if (!isAuthenticated()) {
                e.preventDefault();
                localStorage.setItem('redirectUrl', this.getAttribute('href'));
                window.location.href = 'login.html';
            }
        });
    });
    
    // Handle start course button clicks
    document.querySelectorAll('.start-course-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!isAuthenticated()) {
                e.preventDefault();
                localStorage.setItem('redirectUrl', 'create-course.html');
                window.location.href = 'login.html';
                return;
            }
            
            if (user.role !== 'mentor') {
                alert('Only mentors can create courses');
                return;
            }
            
            window.location.href = 'create-course.html';
        });
    });
    
    // Handle enroll button clicks
    document.querySelectorAll('.enroll-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!isAuthenticated()) {
                e.preventDefault();
                const courseId = this.getAttribute('data-course-id') || 'ml';
                localStorage.setItem('redirectUrl', `course-${courseId}.html`);
                window.location.href = 'login.html';
                return;
            }
            
            const courseId = this.getAttribute('data-course-id') || 'ml';
            window.location.href = `course-${courseId}.html`;
        });
    });
    
    // Update UI based on auth status
    function updateUIForAuthStatus() {
        const authElements = document.querySelectorAll('[data-auth-display]');
        
        authElements.forEach(el => {
            const showWhen = el.getAttribute('data-auth-display');
            
            if (showWhen === 'authenticated' && isAuthenticated()) {
                el.style.display = 'block';
            } else if (showWhen === 'unauthenticated' && !isAuthenticated()) {
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
    }
    
    // Call UI update on page load
    updateUIForAuthStatus();
});
