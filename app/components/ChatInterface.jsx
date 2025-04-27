"use client";
import { useState, useRef, useEffect } from 'react';
import Message from './Message';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Show welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Hello! I am your AI Health Assistant. How can I help you today?\n\n⚠️ Remember: I cannot diagnose conditions. For serious symptoms, consult a doctor immediately.'
      }]);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage = { role: 'user', content: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].filter(msg => msg.role === 'user')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Request failed');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.content 
      }]);

    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: getErrorMessage(error)
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (error.message.includes('Failed to fetch')) {
      return "Network error. Please check your connection.";
    }
    return "I'm having trouble responding. Please try again.";
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto bg-gray-50 rounded-lg shadow-md overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((message, index) => (
          <Message key={index} role={message.role} content={message.content} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}