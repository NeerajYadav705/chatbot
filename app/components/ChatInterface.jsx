// ChatInterface.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, 
  FiPlus, 
  FiMessageSquare, 
  FiArrowUp,
  FiClock,
  FiTrash2,
  FiEdit,
  FiSave,
  FiSettings
} from 'react-icons/fi';
import { RiMentalHealthLine } from 'react-icons/ri';
import Message from "./Message";
import { MdCircle } from "react-icons/md";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0 && !activeChat) {
      setMessages([{
        role: "assistant",
        content: "Hello! I am your AI Health Assistant. How can I help you today?\n\n⚠️ Remember: I cannot diagnose conditions. For serious symptoms, consult a doctor immediately.",
      }]);
    }
  }, [activeChat]);

  useEffect(() => {
    const savedChats = localStorage.getItem('chatHistory');
    if (savedChats) setChatHistory(JSON.parse(savedChats));
  }, []);

  const saveChat = (messages) => {
    const newChat = {
      id: Date.now(),
      title: messages.find(m => m.role === 'user')?.content.substring(0, 30) || 'New Chat',
      messages,
      createdAt: new Date().toISOString()
    };
    
    const updatedHistory = [...chatHistory, newChat];
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    return newChat.id;
  };

  const startNewChat = () => {
    if (messages.length > 1) saveChat(messages);
    setMessages([]);
    setActiveChat(null);
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setActiveChat(chatId);
    }
  };

  const deleteChat = (chatId) => {
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    if (activeChat === chatId) {
      setMessages([]);
      setActiveChat(null);
    }
  };

  const handleRenameChat = (chatId, newTitle) => {
    const updatedHistory = chatHistory.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    );
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    setEditingChatId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage = { role: "user", content: trimmedInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages.filter(msg => msg.role === "user") }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Request failed");

      const assistantMessage = { role: "assistant", content: data.content };
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      if (!activeChat) {
        const newChatId = saveChat(finalMessages);
        setActiveChat(newChatId);
      } else {
        const updatedHistory = chatHistory.map(chat => 
          chat.id === activeChat ? { ...chat, messages: finalMessages } : chat
        );
        setChatHistory(updatedHistory);
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: error.message.includes("Failed to fetch") 
          ? "Network error. Please check your connection."
          : "I'm having trouble responding. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <motion.div 
        className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="p-4">
          <motion.button 
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-md transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus className="text-xl" />
            New Chat
          </motion.button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 text-sm font-medium text-gray-500 flex items-center">
            <FiMessageSquare className="mr-2" />
            Chat History
          </div>
          <div className="px-2 space-y-1">
            <AnimatePresence>
              {chatHistory.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group relative"
                >
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => deleteChat(chat.id)}
                      className="p-1 hover:bg-red-50 rounded-full ml-1"
                      whileHover={{ scale: 1.1 }}
                    >
                      <FiTrash2 className="text-red-400 text-sm" />
                    </motion.button>

                    <button
                      onClick={() => loadChat(chat.id)}
                      className={`flex-1 text-left px-2 py-2 rounded-lg text-sm flex items-center justify-between ${
                        activeChat === chat.id 
                          ? 'bg-blue-50 text-blue-800' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {editingChatId === chat.id ? (
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onBlur={() => handleRenameChat(chat.id, editedTitle)}
                          onKeyPress={(e) => e.key === 'Enter' && handleRenameChat(chat.id, editedTitle)}
                          className="bg-transparent outline-none w-full"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate" onClick={() => {
                            setEditingChatId(chat.id);
                            setEditedTitle(chat.title);
                          }}>
                            {chat.title}
                          </span>
                          <FiClock className="text-gray-400 text-xs ml-2" />
                        </div>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.header 
          className="border-b border-gray-200 p-4 flex justify-between items-center bg-white"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <div className="flex items-center gap-2">
            <RiMentalHealthLine className="text-3xl text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">HealthAI Pro</h1>
              <p className="text-sm text-gray-600">Advanced Medical Intelligence Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button 
              className="p-2 hover:bg-gray-100 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <FiSettings className="text-gray-600" />
            </motion.button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white">
              <FiUser className="text-xl" />
            </div>
          </div>
        </motion.header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-8 space-y-6 px-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <Message key={index} role={message.role} content={message.content} />
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              className="flex justify-start px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-white shadow-sm rounded-xl px-4 py-3 flex items-center gap-2">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    transition: { repeat: Infinity, duration: 1.5 }
                  }}
                >
                  <MdCircle className="text-blue-600 text-xs" />
                </motion.div>
                <span className="text-gray-600 text-sm">Analyzing your query...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-16" />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
          <motion.div 
            className="flex gap-2 max-w-4xl mx-auto relative"
            whileHover={{ scale: 1.005 }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe symptoms or ask a health question..."
              className="flex-1 p-4 pr-14 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-800 shadow-sm"
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={isLoading || !input.trim()}
            >
              <FiArrowUp className="text-lg" />
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}