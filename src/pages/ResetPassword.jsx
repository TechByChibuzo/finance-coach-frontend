import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, Loader, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Logo = () => (
  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 2L4 6.8V14.5C4 21.2 8.8 27.4 15 29C21.2 27.4 26 21.2 26 14.5V6.8L15 2Z"
        fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeLinejoin="round"
      />
      <line x1="15" y1="9" x2="15" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M18 12C18 10.9 16.7 10 15 10C13.3 10 12 10.9 12 12C12 13.1 13.3 13.8 15 14C16.7 14.2 18 15 18 16.2C18 17.4 16.7 18.2 15 18.2C13.3 18.2 12 17.3 12 16.2"
        stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"
      />
    </svg>
  </div>
);

const PageShell = ({ children }) => (
  <div className="relative min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
    <div className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-700 opacity-10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-sky-700 opacity-10 blur-3xl" />

    <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
      <Logo />
      <h1 className="text-2xl font-bold text-white tracking-tight">Finance Coach</h1>
      <p className="mt-1 text-sm text-slate-400">Your AI-powered financial advisor</p>
    </div>

    <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/70 ring-1 ring-gray-900/5 px-8 py-10">
        {children}
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>256-bit SSL encrypted · Bank-level security</span>
      </div>

      <p className="text-center mt-3 text-xs text-slate-600">
        © 2025 Finance Coach. All rights reserved.
      </p>
    </div>
  </div>
);

const getPasswordStrength = (password) => {
  if (password.length === 0) return { text: '', color: '', width: '0%' };
  if (password.length < 6) return { text: 'Weak', color: 'bg-red-500', width: '33%' };
  if (password.length < 10) return { text: 'Medium', color: 'bg-yellow-500', width: '66%' };
  return { text: 'Strong', color: 'bg-green-500', width: '100%' };
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('Invalid reset link');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await authAPI.resetPassword(token, formData.password);
      setResetSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      if (error.response?.status === 400 || error.response?.status === 401) {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  if (!tokenValid) {
    return (
      <PageShell>
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid reset link</h2>
          <p className="text-sm text-gray-500 mb-8">
            This link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 py-2.5 px-5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <span>Request new link</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </PageShell>
    );
  }

  if (resetSuccess) {
    return (
      <PageShell>
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Password reset!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your password has been updated. Redirecting you to login...
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span>Go to login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Reset your password</h2>
        <p className="mt-1 text-sm text-gray-500">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              disabled={loading}
              autoComplete="new-password"
              className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 text-gray-900 transition-all hover:border-gray-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password strength */}
          {formData.password && (
            <div className="mt-2 space-y-1">
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }} />
              </div>
              <p className={`text-xs font-medium ${
                strength.text === 'Strong' ? 'text-green-600' :
                strength.text === 'Medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {strength.text}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
              className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 text-gray-900 transition-all hover:border-gray-300"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordsMatch && <p className="mt-1.5 text-xs text-green-600 font-medium">Passwords match</p>}
          {passwordsMismatch && <p className="mt-1.5 text-xs text-red-600 font-medium">Passwords do not match</p>}
        </div>

        {/* Requirement hint */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3.5">
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className={formData.password.length >= 8 ? 'text-green-600 font-bold' : 'text-gray-300'}>
              {formData.password.length >= 8 ? '✓' : '○'}
            </span>
            At least 8 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Resetting...</span>
            </>
          ) : (
            <>
              <span>Reset password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </PageShell>
  );
}
