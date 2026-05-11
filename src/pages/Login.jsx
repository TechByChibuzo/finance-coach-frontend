import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      await login(formData.email, formData.password);
      if (staySignedIn) localStorage.setItem('rememberedEmail', formData.email);
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Invalid email or password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({ email: 'alice@example.com', password: 'password123' });
    toast.success('Demo credentials filled!');
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">

      {/* Background depth orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-700 opacity-10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-sky-700 opacity-10 blur-3xl" />

      {/* Logo + branding */}
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 2L4 6.8V14.5C4 21.2 8.8 27.4 15 29C21.2 27.4 26 21.2 26 14.5V6.8L15 2Z"
              fill="white"
              fillOpacity="0.15"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <line x1="15" y1="9" x2="15" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <path
              d="M18 12C18 10.9 16.7 10 15 10C13.3 10 12 10.9 12 12C12 13.1 13.3 13.8 15 14C16.7 14.2 18 15 18 16.2C18 17.4 16.7 18.2 15 18.2C13.3 18.2 12 17.3 12 16.2"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Finance Coach</h1>
        <p className="mt-1 text-sm text-slate-400">Your AI-powered financial advisor</p>
      </div>

      {/* Card */}
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/70 ring-1 ring-gray-900/5 px-8 py-10">

          {/* Card header row */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sign in</h2>
              <p className="mt-0.5 text-sm text-gray-500">Welcome back!</p>
            </div>
            {/* Stay signed in toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 select-none">Stay signed in</span>
              <button
                type="button"
                onClick={() => setStaySignedIn(!staySignedIn)}
                disabled={loading}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                  staySignedIn ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                aria-checked={staySignedIn}
                role="switch"
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    staySignedIn ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 text-gray-900 transition-all hover:border-gray-300"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t border-gray-100" />
            <span className="text-xs text-gray-400 select-none">or</span>
            <div className="flex-1 border-t border-gray-100" />
          </div>

          {/* Sign up */}
          <p className="text-center text-sm text-gray-600 mb-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Sign up free
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-0.5">Demo account</p>
                <p className="text-xs text-gray-400">alice@example.com · password123</p>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                disabled={loading}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap ml-3 mt-0.5"
              >
                Fill in →
              </button>
            </div>
          </div>
        </div>

        {/* Security trust badge */}
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
}
