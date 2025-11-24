import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, MessageRole } from '../types';
import { IconSend } from './Icons';

interface ChatPanelProps {
  title: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  placeholder?: string;
  modelName?: string;
  position: 'left' | 'right';
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  title, 
  messages, 
  onSendMessage, 
  isTyping, 
  placeholder = "Ask AI...",
  modelName,
  position
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className={`flex flex-col h-full bg-game-panel border-${position === 'left' ? 'r' : 'l'} border-game-border`}>
      {/* Header */}
      <div className="p-3 border-b border-game-border bg-game-dark flex justify-between items-center">
        <div>
            <h2 className="text-sm font-bold text-gray-100">{title}</h2>
            {modelName && <span className="text-xs text-gray-500">{modelName}</span>}
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[90%] rounded-lg p-3 text-sm whitespace-pre-wrap ${
                msg.role === MessageRole.USER 
                  ? 'bg-accent-600 text-white' 
                  : 'bg-game-input text-gray-300 border border-game-border'
              }`}
            >
              {msg.text}
            </div>
            {msg.images && msg.images.length > 0 && (
                <div className="mt-2">
                    {msg.images.map((img, idx) => (
                        <img key={idx} src={img} alt="Generated asset" className="w-full max-w-[200px] rounded border border-game-border" />
                    ))}
                </div>
            )}
            <span className="text-[10px] text-gray-500 mt-1">
              {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start">
             <div className="bg-game-input text-gray-400 text-xs p-2 rounded-lg border border-game-border animate-pulse">
               AI is thinking...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-game-border bg-game-dark">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-game-input text-gray-200 rounded pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500 border border-game-border"
          />
          <button 
            type="submit" 
            disabled={isTyping || !input.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-accent-500 disabled:text-gray-600"
          >
            <IconSend className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;