const socket = io('http://localhost:5000');

function initializeChat(userId, sessionId) {
    socket.emit('join_chat', { userId, sessionId });

    socket.on('message_received', (message) => {
        displayMessage(message);
    });
}

function sendMessage(message) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const messageData = {
        sessionId: currentSessionId,
        senderId: user._id,
        senderName: user.name,
        content: message,
        timestamp: new Date()
    };

    socket.emit('send_message', messageData);
    displayMessage(messageData);
}

function displayMessage(message) {
    const chatContainer = document.querySelector('.chat-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="sender">${message.senderName}</span>
            <span class="time">${new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="message-content">${message.content}</div>
    `;
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}