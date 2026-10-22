import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { authAPI } from '../services/api';
import AuthShell, { inputClass } from '../components/auth/AuthShell';

// Must match the backend rule for passwords
const MIN_PASSWORD = 8;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // checking -> form -> done, or invalid at any point the server rejects the link
  const [status, setStatus] = useState(token ? 'checking' : 'invalid');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    authAPI.validateResetToken(token)
      .then(() => setStatus('form'))
      .catch((err) => {
        // Only a rejected token means the link is bad; let them try anyway if we couldn't check
        setStatus(err.response?.status === 400 ? 'invalid' : 'form');
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
      return;
    }
    try {
      setSaving(true);
      await authAPI.resetPassword(token, password);
      setStatus('done');
    } catch (err) {
      const code = err.response?.status;
      if (code === 400 || code === 401) {
        setStatus('invalid');
      } else if (code === 429) {
        setError('Too many attempts. Wait a few minutes, then try again.');
      } else {
        setError("Couldn't update your password. Check your connection and try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (status === 'checking') {
    return (
      <AuthShell title="Reset your password">
        <p className="text-sm text-gray-500">Checking your reset link…</p>
      </AuthShell>
    );
  }

  if (status === 'invalid') {
    return (
      <AuthShell
        title="This link has expired"
        footer={<Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Back to sign in</Link>}
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          Reset links work once and expire after an hour. Request a new one and use the latest email we send.
        </p>
        <Link to="/forgot-password" className="btn-primary mt-6 inline-flex w-full justify-center py-3">
          Send a new link
        </Link>
      </AuthShell>
    );
  }

  if (status === 'done') {
    return (
      <AuthShell title="Password updated">
        <p className="text-sm text-gray-600 leading-relaxed">
          Your new password is set. For your security, you've been signed out on all your devices. Sign in again with your new password.
        </p>
        <Link to="/login" className="btn-primary mt-6 inline-flex w-full justify-center py-3">
          Sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="You'll use it the next time you sign in."
      footer={<Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">New password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={MIN_PASSWORD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={saving}
              autoComplete="new-password"
              aria-describedby="password-hint"
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3.5 flex items-center text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p id="password-hint" className="mt-1.5 text-xs text-gray-500">At least {MIN_PASSWORD} characters.</p>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button type="submit" disabled={saving || !password} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {saving && <Loader className="w-4 h-4 animate-spin" aria-hidden />}
          {saving ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </AuthShell>
  );
}
