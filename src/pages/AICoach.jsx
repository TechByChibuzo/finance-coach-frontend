import { useEffect, useRef, useState } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { ArrowUp, Sparkles } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { aiCoachAPI } from '../services/api';
import { Markdown } from '../utils/markdown';

const SUGGESTIONS = [
  'How is my spending this month compared with last month?',
  'Where could I cut back without much effort?',
  'Am I on track with my budgets?',
  'Help me plan to save $500 a month',
];

// Explain why a chat request failed, using the backend's status codes
function aiErrorMessage(err) {
  const status = err.response?.status;
  if (status === 429) {
    return "You've used this month's free coach messages. Upgrade to Premium for unlimited coaching.";
  }
  if (status === 403) {
    return err.response?.data?.message || "The coach isn't available on your plan.";
  }
  if (status === 503) {
    return 'The coach is unavailable right now. Try again in a few minutes.';
  }
  if (err.code === 'ECONNABORTED') {
    return 'The coach took too long to answer. Try again, or ask a shorter question.';
  }
  return "Couldn't reach the coach. Check your connection and try again.";
}

const timeLabel = (iso) => {
  if (!iso) return null;
  const date = typeof iso === 'string' ? parseISO(iso) : iso;
  return isToday(date) ? format(date, 'h:mm a') : format(date, 'MMM d, h:mm a');
};

function CoachMessage({ content, at }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-primary-600 flex items-center justify-center" aria-hidden>
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="min-w-0 flex-1 text-[15px] leading-relaxed text-gray-700">
        <Markdown text={content} />
        {at && <p className="mt-2 text-xs text-gray-400">{timeLabel(at)}</p>}
      </div>
    </div>
  );
}

function UserMessage({ content }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary-50 px-4 py-2.5 text-[15px] leading-relaxed text-gray-900 whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}

export default function AICoach() {
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    aiCoachAPI.getConversation()
      .then(({ data }) => setMessages(data.flatMap((turn) => [
        { role: 'user', content: turn.userMessage },
        { role: 'assistant', content: turn.assistantMessage, at: turn.createdAt },
      ])))
      .catch((err) => console.error('Failed to load conversation:', err))
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  // Grow the message box with its content, up to a limit
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const send = async (text) => {
    const message = text.trim();
    if (!message || sending) return;
    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setSending(true);
    try {
      const { data } = await aiCoachAPI.chat(message);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response, at: new Date() }]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(aiErrorMessage(err));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const startOver = async () => {
    try {
      // The coach remembers the conversation server-side; clear that too
      await aiCoachAPI.clearSession();
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Failed to clear conversation:', err);
      setError("Couldn't clear the conversation. Try again.");
    }
  };

  const empty = !loadingHistory && messages.length === 0;

  return (
    <Layout>
      <div className="mx-auto flex max-w-3xl flex-col h-[calc(100dvh-8.5rem)] lg:h-[calc(100dvh-9.5rem)]">
        <header className="flex items-end justify-between gap-4 pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Coach</h1>
          {messages.length > 0 && (
            <button onClick={startOver} className="btn-secondary text-sm">Start over</button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto -mx-4 px-4" aria-live="polite">
          {loadingHistory ? (
            <p className="py-8 text-sm text-gray-500">Loading your conversation…</p>
          ) : empty ? (
            <div className="flex h-full flex-col justify-center py-8">
              <p className="text-xl font-bold text-gray-900">Ask about your money</p>
              <p className="mt-2 text-sm text-gray-500 max-w-md">
                The coach reads your synced transactions and budgets, so it can answer with your real numbers.
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-gray-200 bg-surface px-4 py-3 text-left text-sm font-medium text-gray-700 hover:border-primary-300 hover:bg-primary-50/40 focus-visible:outline-2 focus-visible:outline-primary-600"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {messages.map((m, i) =>
                m.role === 'user'
                  ? <UserMessage key={i} content={m.content} />
                  : <CoachMessage key={i} content={m.content} at={m.at} />
              )}
              {sending && (
                <div className="flex gap-3 items-center text-sm text-gray-500">
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-primary-600 flex items-center justify-center" aria-hidden>
                    <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                  </div>
                  Looking at your numbers…
                </div>
              )}
              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="mt-3 flex items-end gap-2 rounded-2xl border border-gray-200 bg-surface p-2 focus-within:border-primary-400"
        >
          <label htmlFor="coach-input" className="sr-only">Message the coach</label>
          <textarea
            id="coach-input"
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about your spending, budgets or savings"
            className="flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="h-9 w-9 shrink-0 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-40"
            aria-label="Send"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>
      </div>
    </Layout>
  );
}
