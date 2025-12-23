const WEBHOOK_URL = "https://lickerishly-evaporative-whitley.ngrok-free.dev/webhook-test/31fa19ab-7edf-4c5b-8ea7-13656d5b51d6";

const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const conversationsList = document.getElementById('conversationsList');
const newChatButton = document.getElementById('newChatButton');
const themeToggle = document.getElementById('themeToggle');

let currentConversationId = null;
let conversations = {};

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
}
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
}

// Load conversations from localStorage
function loadConversations() {
    const saved = localStorage.getItem('conversations');
    if (saved) {
        conversations = JSON.parse(saved);
    }
}

// Save conversations to localStorage
function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

// Create a new conversation
function createNewConversation() {
    const id = Date.now().toString();
    conversations[id] = {
        id,
        title: 'New Conversation',
        messages: [],
        createdAt: new Date().toISOString()
    };
    
    currentConversationId = id;
    clearChat();
    saveConversations();
    renderConversations();
    messageInput.focus();
}

// Load a conversation
function loadConversation(conversationId) {
    currentConversationId = conversationId;
    clearChat();
    
    if (conversations[conversationId]) {
        const conv = conversations[conversationId];
        conv.messages.forEach(msg => {
            const messageElement = createMessageElement(msg.content, msg.type);
            chatMessages.appendChild(messageElement);
        });
    }
    
    scrollToBottom();
    renderConversations();
    messageInput.focus();
    
    // Close sidebar on mobile after selecting
    if (window.innerWidth <= 768) {
        sidebar.classList.add('hidden');
    }
}

// Render conversations in sidebar
function renderConversations() {
    conversationsList.innerHTML = '';
    
    const sortedIds = Object.keys(conversations).sort((a, b) => {
        return new Date(conversations[b].createdAt) - new Date(conversations[a].createdAt);
    });
    
    sortedIds.forEach(id => {
        const conv = conversations[id];
        const item = document.createElement('button');
        item.className = 'conversation-item';
        if (id === currentConversationId) {
            item.classList.add('active');
        }
        item.textContent = conv.title;
        item.onclick = () => loadConversation(id);
        conversationsList.appendChild(item);
    });
}

// Update conversation title based on first user message
function updateConversationTitle(message) {
    if (currentConversationId && conversations[currentConversationId]) {
        if (conversations[currentConversationId].title === 'New Conversation') {
            conversations[currentConversationId].title = message.substring(0, 40) + 
                (message.length > 40 ? '...' : '');
            saveConversations();
            renderConversations();
        }
    }
}

function clearChat() {
    chatMessages.innerHTML = '';
}

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

    // Save to conversation
    if (currentConversationId && conversations[currentConversationId]) {
        conversations[currentConversationId].messages.push({ content, type });
        saveConversations();
    }
    
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
    updateConversationTitle(message);
    addMessage(message, 'user');
    
    const typingIndicator = addMessage('', 'typing');
    
    setLoading(true);
    
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chatInput: message }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();

	console.log("Backend response:", text);
        
        removeElement(typingIndicator);
        
        if (text && text.trim()) {
            addMessage(text, 'ai');
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
// Sidebar toggle
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
});

// New chat button
newChatButton.addEventListener('click', createNewConversation);

// Theme toggle
themeToggle.addEventListener('click', toggleTheme);

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

// Initialize
initializeTheme();
loadConversations();
if (Object.keys(conversations).length === 0) {
    createNewConversation();
} else {
    const firstConvId = Object.keys(conversations)[0];
    loadConversation(firstConvId);
}
messageInput.focus();
