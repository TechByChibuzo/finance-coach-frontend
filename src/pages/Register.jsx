import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import AuthShell, { inputClass } from '../components/auth/AuthShell';

// Must match the backend rule (UserRegistrationRequest: @Size(min = 8))
const MIN_PASSWORD = 8;

export default function Register() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters for your password.`);
      return;
    }
    try {
      setLoading(true);
      await register(formData.email, formData.password, formData.fullName);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setError('Too many sign-up attempts. Wait a few minutes, then try again.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Couldn't create your account. Check your connection and try again.");
        toast.error("Couldn't reach Finance Coach");
      }
    } finally {
      setLoading(false);
    }
  };

  const ready = formData.fullName.trim() && formData.email && formData.password;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to start. Link a bank when you're ready."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1.5">Your name</label>
          <input
            id="fullName"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            disabled={loading}
            autoComplete="name"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              minLength={MIN_PASSWORD}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
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

        <button type="submit" disabled={loading || !ready} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
          {loading && <Loader className="w-4 h-4 animate-spin" aria-hidden />}
          {loading ? 'Creating your account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
