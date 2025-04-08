document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('learningChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Learning Hours',
                data: [8, 15, 12, 10],
                borderColor: '#4a69bd',
                backgroundColor: 'rgba(74, 105, 189, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Weekly Learning Progress'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});