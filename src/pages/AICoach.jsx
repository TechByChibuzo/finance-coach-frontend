import { useState, useRef, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { aiCoachAPI } from '../services/api';
import { PaperAirplaneIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AICoach() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI financial coach. I can help you understand your spending, create budgets, and achieve your financial goals. What would you like to know?",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await aiCoachAPI.chat(userMessage);
      
      // Add AI response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.response 
      }]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to get AI response. Please try again.');
      toast.error('Failed to get AI response');
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Analyze my spending', message: 'Can you analyze my spending patterns?', icon: '📊' },
    { label: 'Weekly summary', message: 'Give me a summary of this week', icon: '📅' },
    { label: 'Savings tips', message: 'How can I save more money?', icon: '💰' },
    { label: 'Budget help', message: 'Help me create a budget', icon: '📝' },
  ];

  const handleQuickAction = (message) => {
    setInput(message);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your AI financial coach. I can help you understand your spending, create budgets, and achieve your financial goals. What would you like to know?",
      }
    ]);
    setError(null);
    toast.success('Chat cleared');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <SparklesIcon className="h-8 w-8 text-primary-600 mr-2" />
              AI Financial Coach
            </h1>
            <p className="text-gray-500 mt-1">Ask me anything about your finances</p>
          </div>
          
          {messages.length > 1 && (
            <button
              onClick={clearChat}
              className="btn-secondary text-sm"
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Chat Container */}
        <div className="card p-0 overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
          {/* Messages */}
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-3xl ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-primary-600' 
                      : message.isError
                        ? 'bg-red-500'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    <span className="text-white text-sm font-semibold">
                      {message.role === 'user' ? '👤' : message.isError ? '⚠️' : '🤖'}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : message.isError
                        ? 'bg-red-50 text-red-900 border border-red-200'
                        : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-3xl">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-gray-100">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-purple-50 to-pink-50">
              <p className="text-sm font-medium text-gray-700 mb-3">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.message)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm hover:shadow flex items-center space-x-2"
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form onSubmit={sendMessage} className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your finances..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm hover:shadow"
              >
                <span>{loading ? 'Sending...' : 'Send'}</span>
                <PaperAirplaneIcon className={`h-5 w-5 ${loading ? 'animate-pulse' : ''}`} />
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Tip: Be specific about your financial questions for better advice
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}