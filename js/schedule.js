const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const API_KEY = 'YOUR_GOOGLE_API_KEY';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

let tokenClient;
let gapiInited = false;
let gisInited = false;

function initializeGoogleCalendar() {
    gapi.load('client', initializeGapiClient);
    google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleAuthClick,
    });
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
}

async function scheduleSession(mentorId, sessionDetails) {
    try {
        const event = {
            summary: `Mentoring Session with ${sessionDetails.mentorName}`,
            description: sessionDetails.description,
            start: {
                dateTime: sessionDetails.startTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
                dateTime: sessionDetails.endTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            attendees: [
                { email: sessionDetails.menteeEmail },
                { email: sessionDetails.mentorEmail }
            ],
            conferenceData: {
                createRequest: {
                    requestId: Date.now().toString(),
                    conferenceSolutionKey: { type: "hangoutsMeet" }
                }
            }
        };

        const response = await gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
            sendNotifications: true
        });

        return response.result;
    } catch (error) {
        console.error('Error scheduling session:', error);
        throw error;
    }
}
