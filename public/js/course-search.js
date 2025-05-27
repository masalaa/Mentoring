const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchSuggestions = document.getElementById('searchSuggestions');
let debounceTimer;

// Live search as user types
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();
    clearTimeout(debounceTimer);
    
    if (searchTerm.length >= 2) {
        debounceTimer = setTimeout(() => {
            fetchSearchResults(searchTerm);
        }, 300);
    } else {
        searchSuggestions.innerHTML = '';
        searchSuggestions.style.display = 'none';
    }
});

// Add form submit handler
const searchForm = document.querySelector('#searchForm');
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length >= 2) {
            fetchSearchResults(searchTerm);
        }
    });
}

// Update fetchSearchResults function
async function fetchSearchResults(searchTerm) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`http://localhost:5000/api/courses/search?term=${encodeURIComponent(searchTerm)}`, {
            headers: {
                'Authorization': `Bearer ${user?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Search request failed');
        }

        const data = await response.json();
        
        // Filter for published courses only
        const publishedCourses = data.courses.filter(course => course.published === true);
        
        displaySearchSuggestions(publishedCourses, searchTerm);
        displaySearchResults(publishedCourses);
        
        // Update URL with search term
        const newUrl = `${window.location.pathname}?term=${encodeURIComponent(searchTerm)}`;
        window.history.pushState({ searchTerm }, '', newUrl);
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle fa-3x"></i>
                <h2>Search failed</h2>
                <p>Please try again later</p>
            </div>`;
    }
}

// Update showCourseDetails function
async function showCourseDetails(courseId) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${user?.token || ''}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch course details');
        }

        const course = await response.json();
        if (course.published) {
            window.location.href = `course-details.html?id=${courseId}`;
        } else {
            throw new Error('Course not available');
        }
    } catch (error) {
        console.error('Error fetching course details:', error);
        alert('Unable to view course details at this time.');
    }
}

function displaySearchSuggestions(courses, searchTerm) {
    if (!courses || courses.length === 0) {
        searchSuggestions.innerHTML = `
            <div class="suggestion-item">
                <p class="no-results">No courses found matching "${searchTerm}"</p>
            </div>`;
    } else {
        searchSuggestions.innerHTML = courses.map(course => `
            <div class="suggestion-item" onclick="showCourseDetails('${course._id}')">
                <img src="${course.image || 'assets/images/default-course.jpg'}" 
                     alt="${course.title}" class="suggestion-image">
                <div class="suggestion-content">
                    <div class="suggestion-info">
                        <h4>${highlightMatch(course.title, searchTerm)}</h4>
                        <span class="suggestion-category">${course.category}</span>
                    </div>
                    <p class="suggestion-description">${highlightMatch(course.description, searchTerm)}</p>
                    <div class="suggestion-footer">
                        <span class="suggestion-price">₹${course.pricing?.basic?.price || 'N/A'}</span>
                        <span class="suggestion-mentor">By ${course.mentorName}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    searchSuggestions.style.display = 'block';
}

function displaySearchResults(courses) {
    if (!courses || courses.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search fa-3x"></i>
                <h2>No courses found</h2>
                <p>Try different search terms</p>
            </div>`;
        return;
    }

    searchResults.innerHTML = courses.map(course => `
        <div class="course-card">
            <div class="course-image-container">
                <img src="${course.image || 'assets/images/default-course.jpg'}" alt="${course.title}" class="course-image">
                <div class="course-overlay">
                    <button class="view-details" onclick="showCourseDetails('${course._id}')">View Details</button>
                </div>
            </div>
            <div class="course-info">
                <h3 class="course-title">${course.title}</h3>
                <p class="course-category"><i class="fas fa-tag text-primary"></i> ${course.category}</p>
                <p class="course-description">${course.description.substring(0, 100)}...</p>
                <div class="course-footer">
                    <p class="course-price">₹${course.pricing?.basic?.price || 'N/A'}</p>
                    <button class="enroll-btn" onclick="showCourseDetails('${course._id}')">View Details</button>
                </div>
            </div>
        </div>
    `).join('');
}

function highlightMatch(text, searchTerm) {
    if (!text) return '';
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!searchSuggestions.contains(e.target) && e.target !== searchInput) {
        searchSuggestions.style.display = 'none';
    }
});

// Initialize search if URL has search term
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('term');
    
    if (searchTerm) {
        searchInput.value = searchTerm;
        fetchSearchResults(searchTerm);
    }
});

document.querySelector('.search-btn').addEventListener('click', async () => {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm.length < 2) {
        showNotification('Please enter at least 2 characters');
        return;
    }

    // Add loading animation
    document.querySelector('.search-container').classList.add('searching');
    
    try {
        const response = await fetch('http://localhost:5000/api/courses/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchTerm })
        });

        const data = await response.json();
        
        // Animate transition
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = `search-results.html?term=${encodeURIComponent(searchTerm)}`;
        }, 500);

    } catch (error) {
        showNotification('Search failed. Please try again.');
    }
});