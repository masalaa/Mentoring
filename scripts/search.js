const searchInput = document.getElementById('searchInput');
const searchSuggestions = document.getElementById('searchSuggestions');
const searchResults = document.getElementById('searchResults');
const searchSubmit = document.getElementById('searchSubmit');
let allCourses = [];

async function fetchCourses() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/courses', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data.courses;
    } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
}

async function searchCourses(searchTerm) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/courses/search?term=${encodeURIComponent(searchTerm)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data.courses;
    } catch (error) {
        console.error('Error searching courses:', error);
        return [];
    }
}

function filterCourses(courses, searchTerm) {
    const term = searchTerm.toLowerCase();
    return courses.filter(course => 
        (course.title.toLowerCase().includes(term) ||
        course.category.toLowerCase().includes(term) ||
        (course.description && course.description.toLowerCase().includes(term))) &&
        course.type !== 'mentor'
    );
}

function showSuggestions(courses, searchTerm) {
    if (!searchTerm) {
        searchSuggestions.style.display = 'none';
        return;
    }

    searchSuggestions.innerHTML = courses.map(course => `
        <div class="suggestion-item" onclick="showCourseDetails('${course._id}')">
            <div class="suggestion-title">
                <i class="fas fa-book-open text-primary"></i> ${course.title}
            </div>
            <div class="suggestion-details">
                <span class="suggestion-category">
                    <i class="fas fa-tag"></i> ${course.category}
                </span>
                <span class="suggestion-price">₹${course.pricing.basic.price}</span>
            </div>
        </div>
    `).join('');

    searchSuggestions.style.display = courses.length ? 'block' : 'none';
}

function displayCourses(courses) {
    if (courses.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search fa-3x text-primary"></i>
                <h2>No courses found</h2>
                <p>Try different search terms or browse all courses</p>
            </div>
        `;
        return;
    }

    searchResults.innerHTML = courses.map(course => `
        <div class="course-card" onclick="showCourseDetails('${course._id}')">
            <div class="course-image-container">
                <img src="${course.image}" alt="${course.title}" class="course-image">
            </div>
            <div class="course-info">
                <h3 class="course-title">${course.title}</h3>
                <p class="course-category"><i class="fas fa-tag text-primary"></i> ${course.category}</p>
                <p class="course-description">${course.description.substring(0, 100)}...</p>
                <div class="course-footer">
                    <p class="course-price">₹${course.pricing.basic.price}</p>
                    <button class="view-details-btn">View Details</button>
                </div>
            </div>
        </div>
    `).join('');
}

async function showCourseDetails(courseId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const course = await response.json();
        
        const modal = document.getElementById('courseModal');
        const detailsContainer = document.getElementById('courseDetails');
        
        detailsContainer.innerHTML = `
            <div class="course-detail-header">
                <img src="${course.image}" alt="${course.title}" class="detail-image">
                <h2>${course.title}</h2>
                <p class="mentor-name">By ${course.mentorName}</p>
            </div>
            
            <div class="course-tabs">
                <button class="tab-btn active" data-tab="overview">Overview</button>
                <button class="tab-btn" data-tab="pricing">Pricing</button>
                <button class="tab-btn" data-tab="gallery">Gallery</button>
            </div>
            
            <div class="tab-content" id="overview">
                <h3>Course Description</h3>
                <p>${course.description}</p>
                <h3>What you'll learn</h3>
                <ul>
                    ${course.learningOutcomes.map(outcome => `<li>${outcome}</li>`).join('')}
                </ul>
            </div>
            
            <div class="tab-content" id="pricing" style="display: none;">
                <div class="pricing-plans">
                    ${Object.entries(course.pricing).map(([plan, details]) => `
                        <div class="pricing-card">
                            <h3>${plan.charAt(0).toUpperCase() + plan.slice(1)}</h3>
                            <p class="price">₹${details.price}</p>
                            <ul>
                                ${details.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                            <button class="enroll-btn">Enroll Now</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="tab-content" id="gallery" style="display: none;">
                <div class="gallery-grid">
                    ${course.gallery.map(img => `
                        <div class="gallery-item">
                            <img src="${img}" alt="Course image">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Show modal
        modal.style.display = 'block';
        
        // Tab functionality
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Hide all content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                // Show selected content
                document.getElementById(tab.dataset.tab).style.display = 'block';
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
        
    } catch (error) {
        console.error('Error fetching course details:', error);
    }
}

// Close modal when clicking the close button or outside
document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('courseModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('courseModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

let debounceTimer;

async function searchCourses(searchTerm) {
    try {
        const response = await fetch(`http://localhost:5000/api/courses/search?term=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        return data.courses;
    } catch (error) {
        console.error('Error searching courses:', error);
        return [];
    }
}

function debounceSearch(searchTerm) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        const courses = await searchCourses(searchTerm);
        displayCourses(courses);
        showSuggestions(courses, searchTerm);
    }, 300);
}

// Update the performSearch function
async function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm.length < 2) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search fa-3x"></i>
                <h2>Please enter at least 2 characters</h2>
            </div>
        `;
        return;
    }

    try {
        searchSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // First try to filter from existing courses
        let filteredCourses = filterCourses(allCourses, searchTerm);
        
        if (filteredCourses.length === 0) {
            // If no local results, try API search
            const response = await fetch(`http://localhost:5000/api/courses/search?term=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            filteredCourses = data.courses || [];
        }
        
        displayCourses(filteredCourses);
        searchSuggestions.style.display = 'none';
        
    } catch (error) {
        console.error('Search failed:', error);
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle fa-3x"></i>
                <h2>Search failed</h2>
                <p>Please try again later</p>
            </div>
        `;
    } finally {
        searchSubmit.innerHTML = '<i class="fas fa-arrow-right"></i>';
    }
}

// Initialize search functionality
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        
        allCourses = await fetchCourses();
        if (allCourses) {
            displayCourses(allCourses);
        }
    } catch (error) {
        if (error.status === 401) {
            window.location.href = '/login';
        } else {
            console.error('Failed to fetch initial courses:', error);
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-circle fa-3x"></i>
                    <h2>Failed to load courses</h2>
                    <p>Please refresh the page</p>
                </div>
            `;
        }
    }
});

// Remove the existing input handler and replace with this
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();
    if (searchTerm.length >= 2) {
        const filteredCourses = filterCourses(allCourses, searchTerm);
        showSuggestions(filteredCourses, searchTerm);
    } else {
        searchSuggestions.style.display = 'none';
    }
});

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!searchSuggestions.contains(e.target) && e.target !== searchInput) {
        searchSuggestions.style.display = 'none';
    }
});