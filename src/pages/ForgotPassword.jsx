// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Loader, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      
      // Call forgot password API
      await authAPI.forgotPassword(email);
      
      setEmailSent(true);
      toast.success('Password reset email sent! ✅');
      
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 opacity-90"></div>
      
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
          {/* Back to Login Link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to login</span>
          </Link>

          {!emailSent ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Forgot password?</h2>
                <p className="text-gray-600">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-gray-700">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      autoFocus
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full py-3.5 px-6 
                    bg-linear-to-r from-primary-600 to-primary-700 
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
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
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
                {/* Success Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce-in">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                {/* Success Message */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Check your email! 📧</h2>
                <p className="text-gray-600 mb-2">
                  We've sent password reset instructions to:
                </p>
                <p className="text-primary-600 font-semibold mb-8">{email}</p>
                
                <div className="bg-blue-50 rounded-xl p-5 mb-8 text-left">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Next steps:</strong>
                  </p>
                  <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                    <li>Check your email inbox</li>
                    <li>Click the reset link in the email</li>
                    <li>Create your new password</li>
                  </ol>
                </div>

                <p className="text-sm text-gray-500 mb-8">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                  >
                    try again
                  </button>
                </p>

                {/* Back to Login */}
                <Link
                  to="/login"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-blue-100">
          © 2025 Finance Coach. All rights reserved.
        </p>
      </div>
    </div>
  );
}