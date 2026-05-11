import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Loader, CheckCircle, ShieldCheck } from 'lucide-react';
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
      await authAPI.forgotPassword(email);
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">

      {/* Background depth orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-700 opacity-10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-sky-700 opacity-10 blur-3xl" />

      {/* Logo + branding */}
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Logo />
        <h1 className="text-2xl font-bold text-white tracking-tight">Finance Coach</h1>
        <p className="mt-1 text-sm text-slate-400">Your AI-powered financial advisor</p>
      </div>

      {/* Card */}
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/70 ring-1 ring-gray-900/5 px-8 py-10">

          {/* Back to login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to login</span>
          </Link>

          {!emailSent ? (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900">Forgot your password?</h2>
                <p className="mt-1 text-sm text-gray-500">
                  No worries — enter your email and we'll send reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={loading}
                      autoComplete="email"
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400 text-gray-900 transition-all hover:border-gray-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send reset link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-gray-500 mb-1">We sent reset instructions to:</p>
              <p className="text-sm font-semibold text-primary-600 mb-8">{email}</p>

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-left mb-8">
                <p className="text-xs font-semibold text-gray-700 mb-2">Next steps</p>
                <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the reset link in the email</li>
                  <li>Create your new password</li>
                </ol>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Didn't receive it? Check spam or{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  try again
                </button>
              </p>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          )}
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
