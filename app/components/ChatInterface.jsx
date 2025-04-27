// ChatInterface.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import Message from "./Message";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0 && !activeChat) {
      setMessages([
        {
          role: "assistant",
          content:
            "Hello! I am your AI Health Assistant. How can I help you today?\n\n⚠️ Remember: I cannot diagnose conditions. For serious symptoms, consult a doctor immediately.",
        },
      ]);
    }
  }, [activeChat]);

  // Save chats to localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('chatHistory');
    if (savedChats) {
      setChatHistory(JSON.parse(savedChats));
    }
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
    if (messages.length > 1) {
      saveChat(messages);
    }
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
        body: JSON.stringify({
          messages: updatedMessages.filter(msg => msg.role === "user"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Request failed");
      }

      const assistantMessage = { role: "assistant", content: data.content };
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Save chat if it's a new conversation
      if (!activeChat) {
        const newChatId = saveChat(finalMessages);
        setActiveChat(newChatId);
      } else {
        // Update existing chat
        const updatedHistory = chatHistory.map(chat => 
          chat.id === activeChat ? {...chat, messages: finalMessages} : chat
        );
        setChatHistory(updatedHistory);
        localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: getErrorMessage(error),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (error.message.includes("Failed to fetch")) {
      return "Network error. Please check your connection.";
    }
    return "I'm having trouble responding. Please try again.";
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-gray-50">
        <div className="p-4">
          <button 
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent Chats
          </div>
          <div className="space-y-1 px-2">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => loadChat(chat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate ${
                  activeChat === chat.id 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {chat.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 p-4 flex justify-between items-center bg-white">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">HealthAI Assistant</h1>
            <p className="text-sm text-gray-600">Powered by WHO Standards & Medical Research</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <Message key={index} role={message.role} content={message.content} />
          ))}
          {isLoading && (
            <div className="flex justify-start px-4">
              <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-16" />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-800"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending
                </span>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}