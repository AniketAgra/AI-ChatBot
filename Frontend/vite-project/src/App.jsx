import { useState, useEffect} from 'react';
import './App.css';
import { io } from "socket.io-client";

// Component to format messages with markdown-like styling
const FormattedMessage = ({ text }) => {
  const formatText = (text) => {
    // Convert **bold** to <strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert bullet points
    formatted = formatted.replace(/^\* (.*$)/gim, '<li>$1</li>');
    
    // Wrap consecutive list items in <ul>
    formatted = formatted.replace(/(<li>.*<\/li>\s*)+/gs, (match) => {
      return `<ul>${match}</ul>`;
    });
    
    // Convert line breaks to <br>
    formatted = formatted.replace(/\n/g, '<br/>');
    
    return formatted;
  };

  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: formatText(text) 
      }} 
    />
  );
};

function App() {
  const [socket, setSocket] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [conversation, setConversation] = useState([]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newUserMessage = { 
      text: inputValue, 
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const newConversation = [...conversation, newUserMessage];

    // Simulate a bot response
    // setTimeout(() => {
    //   const botResponse = { 
    //     text: `I received your message: "${inputValue}". How can I help you today?`, 
    //     sender: 'bot',
    //     timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    //   };
    //   setConversation([...newConversation, botResponse]);
    // }, 1000);

    setConversation(newConversation);
    
    socket.emit("ai-message", inputValue);
    
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    const socketInstance = io("http://localhost:3000");
    setSocket(socketInstance);

    socketInstance.on("ai-response-message", (response) => {
      const botResponse = { 
        id: Date.now() + 1, 
        text: response.response, 
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversation(prev => [...prev, botResponse]);
    });
  },[]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="bot-avatar">🤖</div>
        <div className="chat-title">
          <h3>AI Assistant</h3>
          <span className="status">Online</span>
        </div>
      </div>
      <div className="message-history">
        {conversation.length === 0 && (
          <div className="welcome-message">
            <div className="bot-avatar-large">🤖</div>
            <p>Welcome! I'm your AI assistant. How can I help you today?</p>
          </div>
        )}
        {conversation.map((message, index) => (
          <div key={index} className={`message-wrapper ${message.sender}`}>
            <div className={`message ${message.sender}-message`}>
              {message.sender === 'bot' ? (
                <FormattedMessage text={message.text} />
              ) : (
                <p>{message.text}</p>
              )}
              <span className="timestamp">{message.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          style={{ color: '#767171ff' }}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} disabled={!inputValue.trim()}>
          <span>📤</span>
        </button>
      </div>
    </div>
  );
}

export default App;
