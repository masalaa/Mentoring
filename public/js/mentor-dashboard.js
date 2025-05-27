// Fetch and display enrollment requests
async function loadEnrollmentRequests() {
    const mentorId = JSON.parse(localStorage.getItem('user'))._id;
    try {
        const response = await fetch(`http://localhost:5000/api/mentor/enrollment-requests/${mentorId}`);
        const data = await response.json();

        if (data.success) {
            const requestCards = document.getElementById('requestCards');
            requestCards.innerHTML = data.requests.map(request => `
                <div class="request-card" data-request-id="${request._id}">
                    <h4>${request.courseId.overview.title}</h4>
                    <p>Mentee: ${request.userId.name}</p>
                    <button class="accept-btn">Accept</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading enrollment requests:', error);
    }
}

// Handle accept button click
document.addEventListener('DOMContentLoaded', () => {
    const requestCards = document.getElementById('requestCards');
    requestCards.addEventListener('click', async (event) => {
        if (event.target.classList.contains('accept-btn')) {
            const requestId = event.target.closest('.request-card').getAttribute('data-request-id');
            try {
                const response = await fetch(`http://localhost:5000/api/mentor/accept-request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ requestId })
                });

                const data = await response.json();
                if (data.success) {
                    alert('Request accepted successfully!');
                    loadEnrollmentRequests(); // Refresh requests
                } else {
                    alert('Failed to accept request. Please try again.');
                }
            } catch (error) {
                console.error('Error accepting request:', error);
            }
        }
    });
});

// Load requests when page loads
window.addEventListener('load', loadEnrollmentRequests);