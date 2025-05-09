document.addEventListener('DOMContentLoaded', () => {
    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dashboard-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            link.classList.add('active');
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Initialize calendar
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            selectable: true,
            select: handleDateSelect
        });
        calendar.render();
    }

    // Initialize video meeting
    let jitsiApi = null;

    function initializeJitsiMeet(roomName) {
        const domain = 'meet.jit.si';
        const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: document.querySelector('#meetingRoom'),
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop',
                    'fullscreen', 'fodeviceselection', 'hangup', 'chat',
                ]
            }
        };

        jitsiApi = new JitsiMeetExternalAPI(domain, options);
        setupMeetingControls(jitsiApi);
    }

    // Meeting controls
    function setupMeetingControls(api) {
        document.getElementById('toggleAudio').onclick = () => api.executeCommand('toggleAudio');
        document.getElementById('toggleVideo').onclick = () => api.executeCommand('toggleVideo');
        document.getElementById('toggleScreen').onclick = () => api.executeCommand('toggleShareScreen');
        document.getElementById('endCall').onclick = () => {
            api.executeCommand('hangup');
            api.dispose();
        };
    }

    // Load user data and initialize components
    loadUserData();
    loadUpcomingSessions();
    loadEnrolledCourses();
    loadAvailableMentors();
});

// Add the necessary fetch functions for data loading...