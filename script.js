const WEBHOOK_URL = "https://your-n8n-webhook-url-here";

const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

function createMessageElement(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    if (type === 'typing') {
        messageDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
    } else {
        messageDiv.textContent = content;
    }
    
    return messageDiv;
}

function addMessage(content, type) {
    const messageElement = createMessageElement(content, type);
    chatMessages.appendChild(messageElement);
    scrollToBottom();
    return messageElement;
}

function scrollToBottom() {
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

function removeElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function setLoading(isLoading) {
    sendButton.disabled = isLoading;
    messageInput.disabled = isLoading;
}

async function sendMessage(message) {
    addMessage(message, 'user');
    
    const typingIndicator = addMessage('', 'typing');
    
    setLoading(true);
    
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        removeElement(typingIndicator);
        
        if (data.reply) {
            addMessage(data.reply, 'ai');
        } else {
            addMessage('Received an empty response from AI.', 'error');
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        removeElement(typingIndicator);
        
        addMessage('Failed to get a response. Please check your connection and try again.', 'error');
    } finally {
        setLoading(false);
        messageInput.focus();
    }
}

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    
    if (!message) {
        return;
    }
    
    messageInput.value = '';
    
    sendMessage(message);
});

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

messageInput.focus();
