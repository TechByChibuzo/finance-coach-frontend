// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    // Verify token is present
    if (!token) {
      setTokenValid(false);
      toast.error('Invalid reset link');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = () => {
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    try {
      setLoading(true);
      
      // Call reset password API
      await authAPI.resetPassword(token, formData.password);
      
      setResetSuccess(true);
      toast.success('Password reset successfully! 🎉');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
      
      if (error.response?.status === 400 || error.response?.status === 401) {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { text: '', color: '', width: '0%' };
    if (password.length < 6) return { text: 'Weak', color: 'bg-red-500', width: '33%' };
    if (password.length < 10) return { text: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { text: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = getPasswordStrength();

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-90"></div>
        
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
              <span className="text-3xl">💎</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Finance Coach</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            
            <Link to="/forgot-password" className="btn-primary inline-flex items-center gap-2">
              <span>Request New Link</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-90"></div>
      
      {/* Animated Circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform duration-300">
            <span className="text-3xl">💎</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Finance Coach</h1>
          <p className="text-blue-100 text-lg">Your AI-powered financial advisor</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 backdrop-blur-lg animate-slide-up">
          {!resetSuccess ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Reset your password 🔐</h2>
                <p className="text-gray-600">
                  Choose a strong password for your account.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Input */}
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">New Password</label>
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
                        w-full pl-12 pr-12 py-3 
                        border-2 border-gray-200 
                        rounded-xl 
                        focus:border-primary-500 focus:ring-4 focus:ring-primary-100 
                        transition-all duration-200
                        placeholder-gray-400
                        text-gray-900
                      "
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={loading}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Password strength:</span>
                        <span className={`font-medium ${
                          strength.text === 'Strong' ? 'text-green-600' :
                          strength.text === 'Medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {strength.text}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: strength.width }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="
                        w-full pl-12 pr-12 py-3 
                        border-2 border-gray-200 
                        rounded-xl 
                        focus:border-primary-500 focus:ring-4 focus:ring-primary-100 
                        transition-all duration-200
                        placeholder-gray-400
                        text-gray-900
                      "
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={loading}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Match Indicator */}
                  {formData.confirmPassword && (
                    <p className={`text-xs ${
                      formData.password === formData.confirmPassword 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {formData.password === formData.confirmPassword 
                        ? '✓ Passwords match' 
                        : '✗ Passwords do not match'
                      }
                    </p>
                  )}
                </div>

                {/* Requirements */}
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-2">Password requirements:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                        {formData.password.length >= 8 ? '✓' : '○'}
                      </span>
                      At least 8 characters
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
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
                    flex items-center justify-center gap-2
                    group
                  "
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce-in">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3">Password Reset! 🎉</h2>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully reset. You can now login with your new password.
                </p>

                <p className="text-sm text-gray-500 mb-6">
                  Redirecting to login page...
                </p>

                <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                  <span>Go to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-blue-100">
          © 2025 Finance Coach. All rights reserved.
        </p>
      </div>
    </div>
  );
}