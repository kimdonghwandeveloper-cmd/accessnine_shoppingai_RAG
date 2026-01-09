import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Sparkles, ChevronDown, ChevronUp, Box } from 'lucide-react';
import './index.css';

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요! AccessNine AI 영업 사원입니다. \n현장에 필요한 자재가 있으신가요?',
      thought: null,
      related_tags: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: text
      });

      const data = response.data;
      const botMessage = {
        role: 'assistant',
        content: data.answer,
        thought: data.thought,
        related_tags: data.related_tags
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        thought: null,
        related_tags: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      {/* Sidebar (Optional context or nav) */}
      <div className="w-64 glass-panel border-r border-[#1e293b] hidden md:flex flex-col p-4 z-10">
        <div className="flex items-center gap-2 mb-8">
          <Box className="text-blue-500 w-8 h-8" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            AccessNine
          </h1>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider text-xs font-semibold">Context Info</p>
          <div className="p-3 glass rounded-lg text-sm text-gray-300">
            <p className="mb-2">📋 <strong>Mock DB Loaded</strong></p>
            <ul className="list-disc pl-4 space-y-1 text-xs text-gray-400">
              <li>강력 콘크리트 보수제</li>
              <li>전문가용 미장 흙손</li>
              <li>다목적 수성 프라이머</li>
              <li>고강도 반생</li>
            </ul>
          </div>
        </div>
        <div className="text-xs text-gray-500 text-center">
          Powered by Gemini 2.0 Flash
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-purple-900/10 pointer-events-none" />

        {/* Header (Mobile only) */}
        <div className="md:hidden p-4 glass-panel flex items-center gap-2 border-b border-[#1e293b]">
          <Box className="text-blue-500 w-6 h-6" />
          <span className="font-bold">AccessNine AI</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} onTagClick={sendMessage} />
          ))}
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                <Bot size={16} className="text-blue-400" />
              </div>
              <div className="glass px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 pb-6">
          <div className="glass-panel p-2 rounded-xl flex items-end gap-2 relative max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="필요한 자재를 말씀해주세요..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[50px] p-3 text-white placeholder-gray-500"
              rows={1}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white mb-0.5"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, onTagClick }) {
  const isUser = message.role === 'user';
  const [showThought, setShowThought] = useState(false);

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 
        ${isUser
          ? 'bg-purple-600/20 border-purple-500/30'
          : 'bg-blue-600/20 border-blue-500/30'
        }`}
      >
        {isUser ? <User size={16} className="text-purple-400" /> : <Bot size={16} className="text-blue-400" />}
      </div>

      <div className={`flex flex-col gap-2 max-w-[80%] md:max-w-[70%]`}>
        {/* Thought Process (Collapsible) */}
        {!isUser && message.thought && (
          <div className="mb-1">
            <button
              onClick={() => setShowThought(!showThought)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition-colors mb-1"
            >
              <Sparkles size={12} />
              <span>AI 사고 과정 {showThought ? '숨기기' : '보기'}</span>
              {showThought ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showThought && (
              <div className="glass p-3 rounded-lg text-xs text-gray-300 border-l-2 border-blue-500/50 italic mb-2">
                {message.thought}
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`px-5 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-lg
          ${isUser
            ? 'bg-purple-600 text-white rounded-tr-none'
            : 'glass text-gray-100 rounded-tl-none border-blue-500/10'
          }`}
        >
          {message.content}
        </div>

        {/* Tags */}
        {!isUser && message.related_tags && message.related_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.related_tags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => onTagClick(tag)}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[#1e293b] hover:bg-blue-600/30 border border-blue-500/20 text-blue-300 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
