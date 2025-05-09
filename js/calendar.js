export const initializeCalendar = (elementId, options = {}) => {
    const calendarEl = document.getElementById(elementId);
    if (!calendarEl) return null;

    const defaultOptions = {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        selectable: true
    };

    const calendar = new FullCalendar.Calendar(
        calendarEl, 
        { ...defaultOptions, ...options }
    );
    
    calendar.render();
    return calendar;
};