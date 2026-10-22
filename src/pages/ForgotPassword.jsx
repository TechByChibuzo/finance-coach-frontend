import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { authAPI } from '../services/api';
import AuthShell, { inputClass } from '../components/auth/AuthShell';

const backToSignIn = <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Back to sign in</Link>;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await authAPI.forgotPassword(email.trim());
      setSentTo(email.trim());
    } catch (err) {
      setError(err.response?.status === 429
        ? 'Too many reset requests. Wait a while, then try again.'
        : "Couldn't send the reset link. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <AuthShell title="Check your email" footer={backToSignIn}>
        <p className="text-sm text-gray-600 leading-relaxed">
          If there's an account for <span className="font-semibold text-gray-900">{sentTo}</span>, we've sent a link
          to reset your password. It works for one hour.
        </p>
        <p className="mt-4 text-sm text-gray-600 leading-relaxed">
          Nothing after a few minutes? Check your spam folder, or{' '}
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="font-semibold text-primary-600 hover:text-primary-700"
          >
            try a different email
          </button>.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email you signed up with and we'll send you a reset link."
      footer={backToSignIn}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            className={inputClass}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button type="submit" disabled={loading || !email.trim()} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {loading && <Loader className="w-4 h-4 animate-spin" aria-hidden />}
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthShell>
  );
}
