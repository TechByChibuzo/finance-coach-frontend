// src/pages/Login.jsx - FIXED TO USE AUTH CONTEXT
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // GET LOGIN FROM CONTEXT
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      // USE CONTEXT LOGIN (this updates user state properly)
      await login(formData.email, formData.password);
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      }
      
      toast.success('Welcome back! 🎉');
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Invalid email or password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'alice@example.com',
      password: 'password123',
    });
    toast.success('Demo credentials filled!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-90"></div>
      
      {/* Animated Circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Logo & Title - keeping as-is per your request */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform duration-300">
            <span className="text-3xl">💎</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Finance Coach</h1>
          <p className="text-blue-100 text-lg">Your AI-powered financial advisor</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 backdrop-blur-lg animate-slide-up">
          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome back! 👋</h2>
            <p className="text-gray-600">Sign in to continue to your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="
                    w-full pl-12 pr-4 py-3.5 
                    border-2 border-gray-200 
                    rounded-xl 
                    focus:border-primary-500 focus:ring-4 focus:ring-primary-100 
                    transition-all duration-200
                    placeholder-gray-400
                    text-gray-900
                  "
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="
                    w-full pl-12 pr-12 py-3.5 
                    border-2 border-gray-200 
                    rounded-xl 
                    focus:border-primary-500 focus:ring-4 focus:ring-primary-100 
                    transition-all duration-200
                    placeholder-gray-400
                    text-gray-900
                  "
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                  disabled={loading}
                />
                <span className="ml-2 text-gray-700 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3.5 px-6 
                bg-gradient-to-r from-primary-600 to-primary-700 
                hover:from-primary-700 hover:to-primary-800
                text-white font-semibold rounded-xl 
                shadow-lg hover:shadow-xl
                transform hover:-translate-y-0.5
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                disabled:transform-none
                flex items-center justify-center gap-2.5
                group
              "
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-8 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mb-8">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">Demo Account</p>
                <p className="text-xs text-blue-700 mb-2">
                  alice@example.com / password123
                </p>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  disabled={loading}
                >
                  Click to fill credentials →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-blue-100">
          © 2025 Finance Coach. All rights reserved.
        </p>
      </div>
    </div>
  );
}