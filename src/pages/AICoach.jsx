import { useState, useRef, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { aiCoachAPI } from '../services/api';
import {
  Send,
  Sparkles,
  AlertTriangle,
  User,
  X,
  BarChart3,
  Calendar,
  PiggyBank,
  FileText,
  Bot,
  Lightbulb,
} from 'lucide-react';
import toast from 'react-hot-toast';

const quickActions = [
  {
    label: 'Analyze my spending',
    message: 'Can you analyze my spending patterns?',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'hover:bg-blue-50',
    borderColor: 'hover:border-blue-300',
  },
  {
    label: 'Weekly summary',
    message: 'Give me a summary of this week',
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'hover:bg-purple-50',
    borderColor: 'hover:border-purple-300',
  },
  {
    label: 'Savings tips',
    message: 'How can I save more money?',
    icon: PiggyBank,
    color: 'text-green-600',
    bgColor: 'hover:bg-green-50',
    borderColor: 'hover:border-green-300',
  },
  {
    label: 'Budget help',
    message: 'Help me create a budget',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'hover:bg-orange-50',
    borderColor: 'hover:border-orange-300',
  },
];

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hi! I'm your AI financial coach. I can help you understand your spending, create budgets, and achieve your financial goals. What would you like to know?",
};

export default function AICoach() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await aiCoachAPI.chat(userMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response
      }]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to get AI response. Please try again.');
      toast.error('Failed to get AI response');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (message) => {
    setInput(message);
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
    toast.success('Chat cleared');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-600" />
              AI Financial Coach
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Ask me anything about your finances</p>
          </div>

          {messages.length > 1 && (
            <button onClick={clearChat} className="btn-secondary text-sm">
              Clear Chat
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="card p-0 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2.5 max-w-3xl ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-linear-to-br from-blue-500 to-blue-600'
                      : message.isError
                        ? 'bg-red-500'
                        : 'bg-linear-to-br from-purple-500 to-pink-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : message.isError ? (
                      <AlertTriangle className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : message.isError
                        ? 'bg-red-50 text-red-900 border border-red-200'
                        : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className="text-xs mt-1 opacity-60">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-linear-to-br from-purple-500 to-pink-500">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-gray-100">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="border-t border-gray-100 p-4 bg-linear-to-r from-purple-50 to-pink-50">
              <p className="text-xs font-medium text-gray-500 mb-3">Quick actions</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.message)}
                      className={`px-3.5 py-2 bg-white border border-gray-200 rounded-full text-sm ${action.bgColor} ${action.borderColor} transition-colors shadow-sm flex items-center gap-2`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${action.color}`} />
                      <span className="text-gray-700">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 p-4 bg-white">
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your finances..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <span>{loading ? 'Sending...' : 'Send'}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-center mt-2.5 gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-xs text-gray-400">
                Be specific about your financial questions for better advice
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
