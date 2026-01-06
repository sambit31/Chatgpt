import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Plus,
  Menu,
  Sun,
  Moon,
  MessageSquare,
  User,
  Edit
} from 'lucide-react';

import '../styles/chat.css';
import '../styles/navigation.css';
import '../styles/base.css';

const Chat = () => {
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState('');

  const [chats, setChats] = useState([
    { id: 1, title: 'Chat about AI', messages: [] },
    { id: 2, title: 'React help', messages: [] }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: 'New Chat',
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChat(newChat);
    setMessage('');
    // focus the input so user can start typing
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    let activeChat = currentChat;

    if (!activeChat) {
      const newChat = {
        id: Date.now(),
        title: message.slice(0, 30),
        messages: []
      };
      setChats([newChat, ...chats]);
      activeChat = newChat;
      setCurrentChat(newChat);
    }

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updatedMessages = [...activeChat.messages, userMessage];

    setChats(chats.map(chat =>
      chat.id === activeChat.id
        ? { ...chat, messages: updatedMessages }
        : chat
    ));

    setCurrentChat({ ...activeChat, messages: updatedMessages });
    setMessage('');

    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        text: "I'm here to help! This is a simulated AI response.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      const newMessages = [...updatedMessages, aiMessage];

      setChats(chats.map(chat =>
        chat.id === activeChat.id
          ? { ...chat, messages: newMessages }
          : chat
      ));

      setCurrentChat({ ...activeChat, messages: newMessages });
    }, 1000);
  };

  const startEditing = (chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const saveEditing = (id) => {
    const title = editingTitle.trim() || 'New Chat';
    setChats(prev => prev.map(c => c.id === id ? { ...c, title } : c));
    if (currentChat?.id === id) setCurrentChat(prev => prev ? { ...prev, title } : prev);
    setEditingChatId(null);
    setEditingTitle('');
  };

  const cancelEditing = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditing(id);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className={`app ${theme}`}>
      {/* Top Controls */}
      <div style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu />
        </button>

        <button onClick={toggleTheme}>
          {theme === 'light' ? <Moon /> : <Sun />}
        </button>
      </div>

      {/* Chat Layout */}
      <div className="chat-layout">
        {/* Sidebar */}
        <aside className={`chat-sidebar ${!sidebarOpen ? 'closed' : ''}`}>
          <div className="sidebar-header">
            <button className="new-chat-btn" onClick={createNewChat}>
              <Plus size={18} />
              New Chat
            </button>
          </div>

          <div className="sidebar-content">
            <div className="sidebar-title">Recent Chats</div>
            {chats.map(chat => (
              <div
                key={chat.id}
                className={`chat-list-item ${currentChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => setCurrentChat(chat)}
              >
                <MessageSquare size={16} />
                {editingChatId === chat.id ? (
                  <input
                    ref={editInputRef}
                    className="chat-edit-input"
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                    onBlur={() => saveEditing(chat.id)}
                    onKeyDown={e => handleEditKeyDown(e, chat.id)}
                  />
                ) : (
                  <>
                    <span className="chat-title">{chat.title}</span>
                    <button
                      className="edit-chat-btn"
                      onClick={e => { e.stopPropagation(); startEditing(chat); }}
                    >
                      <Edit size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
           </div>
        </aside>

        {/* Main Chat */}
        <main className="chat-main">
          <div className="chat-messages">
            <div className="chat-messages-container">
              {!currentChat || currentChat.messages.length === 0 ? (
                <div className="empty-state">
                  <MessageSquare className="empty-state-icon" />
                  <h2>Start a Conversation</h2>
                  <p>Send a message to begin chatting</p>
                </div>
              ) : (
                <>
                  {currentChat.messages.map(msg => (
                    <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                      <div className={`message-avatar ${msg.sender}`}>
                        {msg.sender === 'ai' ? 'AI' : <User size={18} />}
                      </div>
                      <div className="message-content">
                        <div className="message-bubble">{msg.text}</div>
                        <div className="message-time">{msg.timestamp}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <div className="input-container">
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder="Type your message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;
