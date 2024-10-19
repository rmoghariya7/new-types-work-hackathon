import chatData from '../data/chat_data.json';

document.addEventListener('DOMContentLoaded', () => {
    const openChatBtn = document.getElementById('openChatBtn');
    const chatModal = document.getElementById('chatModal');
    const closeBtn = document.querySelector('.close-btn');
    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');
    const suggestionContainer = document.getElementById('suggestionContainer');

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

    // Handle input changes for suggestions
    userInput.addEventListener('input', showSuggestions);

    function sendMessage() {
        const question = userInput.value.trim();
        if (question) {
            addMessage('You', question, 'user-message');
            const answer = findAnswer(question);
            addMessage('Bot', answer, 'bot-message');
            userInput.value = '';
            suggestionContainer.style.display = 'none';
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

    // Show suggestions based on user input
    function showSuggestions() {
        const userText = userInput.value.toLowerCase();
        if (userText.length > 0) {
            const suggestions = chatData.questions
                .filter(q => q.question.toLowerCase().includes(userText))
                .slice(0, 3); // Limit to 3 suggestions

            if (suggestions.length > 0) {
                suggestionContainer.innerHTML = '';
                suggestions.forEach(suggestion => {
                    const suggestionElement = document.createElement('div');
                    suggestionElement.classList.add('suggestion');
                    suggestionElement.textContent = suggestion.question;
                    suggestionElement.addEventListener('click', () => {
                        userInput.value = suggestion.question;
                        suggestionContainer.style.display = 'none';
                    });
                    suggestionContainer.appendChild(suggestionElement);
                });
                suggestionContainer.style.display = 'block';
            } else {
                suggestionContainer.style.display = 'none';
            }
        } else {
            suggestionContainer.style.display = 'none';
        }
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

        if (e.target.closest('.chat-header')) {
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
