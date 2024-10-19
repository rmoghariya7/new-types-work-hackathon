document.addEventListener('DOMContentLoaded', () => {
    const openChatBtn = document.getElementById('openChatBtn');
    const chatModal = document.getElementById('chatModal');
    const closeBtn = document.querySelector('.close-btn');
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');

    let chatData;

    // Load chat data
    fetch('data/chat_data.json')
        .then(response => response.json())
        .then(data => {
            chatData = data;
        });

    // Open chat modal
    openChatBtn.addEventListener('click', () => {
        chatModal.style.display = 'block';
        openChatBtn.style.display = 'none';
    });

    // Close chat modal
    closeBtn.addEventListener('click', () => {
        chatModal.style.display = 'none';
        openChatBtn.style.display = 'block';
    });

    // Send message
    sendBtn.addEventListener('click', sendMessage);

    // Handle Enter key press
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const question = userInput.value.trim();
        if (question) {
            addMessage('You', question, 'user-message');
            const answer = findAnswer(question);
            addMessage('Bot', answer, 'bot-message');
            userInput.value = '';
        }
    }

    // Add message to chat
    function addMessage(sender, message, className) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', className);
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Find answer from chat data
    function findAnswer(question) {
        const lowercaseQuestion = question.toLowerCase();
        const matchedQuestion = chatData.questions.find(q =>
            q.question.toLowerCase().includes(lowercaseQuestion)
        );
        return matchedQuestion ? matchedQuestion.answer : "I'm sorry, I don't have an answer for that question.";
    }

    // Make the modal draggable
    const chatHeader = document.querySelector('.chat-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    chatHeader.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === chatHeader) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, chatModal);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;

        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
});
