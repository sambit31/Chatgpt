import React, { useState, useRef, useEffect } from 'react';
import { io } from "socket.io-client";
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
import axios from 'axios';

const Chat = () => {
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState('');

  const [chats, setChats] = useState([]);


  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef(null);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const modalInputRef = useRef(null);
  const [socket, setsocket] = useState(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  useEffect(() => {
    if (showTitleModal) {
      setTimeout(() => modalInputRef.current?.focus(), 0);
    }
  }, [showTitleModal]);

const createNewChat = async (title) => {
  const chatTitle = (title && title.trim()) ? title.trim() : 'New Chat';
  try {
    const response = await axios.post(
      "http://localhost:5000/api/chat/",
      { title: chatTitle },
      { withCredentials: true }
    );

    const chat = response.data.chat;

    const newChat = {
      id: chat.id || chat._id || Date.now(),
      title: chat.title || chatTitle,
      messages: []
    };

    setChats(prev => [newChat, ...prev]);
    setCurrentChat(newChat);

    setEditingChatId(newChat.id);
    setEditingTitle(newChat.title);

    setShowTitleModal(false);
    setNewChatTitle('');

    setTimeout(() => editInputRef.current?.focus(), 0);
    console.log("Chat created:", chat);
  } catch (err) {
    console.error("Create chat failed:", err.response?.data || err.message);
  }
};


const handleCreateWithTitle = () => {
  if (!newChatTitle.trim()) return;
  createNewChat(newChatTitle);
};



  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  

useEffect(() => {
  const fetchChats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/chat/",
        { withCredentials: true }
      );

      setChats(response.data.chats);

      const tempSocket = io("http://localhost:5000", { withCredentials: true });

      tempSocket.on("ai-response", (message) => {
        console.log("AI Response received:", message);
      });

      setsocket(tempSocket);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    }
  };

  fetchChats();
}, []); // ✅ run once on page load




const handleSendMessage = () => {
  if (!message.trim()) return;
  if (!socket || !currentChat) return;
  
  socket.emit("ai-message", {
    chat: currentChat.id,
    content: message
  });


    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
let activeChat = currentChat;
    const updatedMessages = [
  ...(activeChat.messages || []),
  userMessage
];


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
            <button className="new-chat-btn" onClick={() => setShowTitleModal(true)}>
              <Plus size={18} />
              New Chat
            </button>

            {showTitleModal && (
              <div
                className="modal-overlay"
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}
                onMouseDown={() => { setShowTitleModal(false); setNewChatTitle(''); }}
              >
                <div
                  className="modal"
                  style={{
                    background: theme === 'light' ? '#fff' : '#222',
                    color: theme === 'light' ? '#000' : '#fff',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
                    minWidth: '300px',
                    maxWidth: '90%'
                  }}
                  onMouseDown={e => e.stopPropagation()}
                >
                  <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>New Chat</h3>
                  <input
                    ref={modalInputRef}
                    className="chat-title-input"
                    value={newChatTitle}
                    onChange={e => setNewChatTitle(e.target.value)}
                    placeholder="Enter chat title"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateWithTitle();
                      } else if (e.key === 'Escape') {
                        setShowTitleModal(false);
                        setNewChatTitle('');
                      }
                    }}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button onClick={() => { setShowTitleModal(false); setNewChatTitle(''); }}>Cancel</button>
                    <button onClick={handleCreateWithTitle} disabled={!newChatTitle.trim()}>OK</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="sidebar-content">
            <div className="sidebar-title">Recent Chats</div>
            {chats.map(chat => (
              <div
                key={chat.id || chat._id}
                className={`chat-list-item ${currentChat?.id === chat.id ? 'active' : ''}`}
                onClick={() =>
                setCurrentChat({...chat,messages: chat.messages || []})}
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
              {!currentChat || !currentChat.messages || currentChat.messages.length === 0 ? (
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
