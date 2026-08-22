import React, { useState } from 'react';
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ArrowLeft,
  ScanLine,
  Coffee,
  Cloud,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LegalModal, LegalTab } from '../legal/LegalModal';

interface AuthPageProps {
  onBackToLanding?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onBackToLanding }) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('terms');

  const openLegal = (tab: LegalTab) => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password, fullName);
        if (signUpError) {
          setError(signUpError);
        } else {
          setSuccessMessage('Account created! Check your email to confirm your account, then sign in.');
          setIsSignUp(false);
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(googleError);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-10 select-none relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 15% 0%, #e0e7ff 0%, transparent 40%), radial-gradient(ellipse at 85% 12%, #ede9fe 0%, transparent 35%), radial-gradient(ellipse at 10% 42%, #e0e7ff 0%, transparent 40%), radial-gradient(ellipse at 90% 68%, #ede9fe 0%, transparent 35%), #f4f6fc',
        color: '#111827',
      }}
    >
      {/* Top Bar Navigation */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 mb-4 sm:mb-6">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 text-[13px] font-semibold text-slate-700 hover:text-indigo-600 shadow-2xs transition-all hover:scale-102 active:scale-98"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
            <span>Back to Home</span>
          </button>
        )}

        {/* Brand Tag */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              boxShadow: '0 3px 10px -2px rgba(79, 70, 229, 0.4)',
            }}
          >
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-[17px] font-extrabold tracking-tight text-slate-900">SnapSched</span>
        </div>
      </div>

      {/* Main Split Content Area */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center flex-1 my-auto z-10 py-4">
        {/* Left Pane: Interactive Product Preview & Benefits (Hidden on mobile, prominent on desktop) */}
        <div className="lg:col-span-6 space-y-6 hidden lg:block">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Next-Gen Academic Organizer
            </div>
            <h1 className="text-[34px] xl:text-[40px] font-black tracking-tight text-slate-900 leading-[1.15]">
              Say goodbye to messy screenshot albums & spreadsheets.
            </h1>
            <p className="text-slate-600 text-[15px] leading-relaxed max-w-lg">
              One smart timetable for your classes, vacant focus sprints, and routine shifts with real-time cloud sync across all your devices.
            </p>
          </div>

          {/* Floating Timetable Live Widget Preview */}
          <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-xl space-y-3 max-w-lg">
            {/* Widget Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  IT
                </div>
                <div>
                  <div className="font-bold text-[13px] text-slate-900 leading-tight">1st Semester 2026–2027</div>
                  <div className="text-[11px] text-slate-500 font-medium">BS Information Technology</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                In Class Now
              </span>
            </div>

            {/* Class Cards */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                  <div>
                    <div className="font-bold text-slate-900 text-[12.5px]">IT 311 — Web Systems</div>
                    <div className="text-[11px] text-slate-500">CL 304 · 3.0 Units</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-800 text-[11.5px]">07:30 – 09:00</div>
                  <div className="text-[10px] text-slate-400 font-medium">MW</div>
                </div>
              </div>

              {/* Vacant Gap Callout */}
              <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center justify-between text-[11.5px]">
                <div className="flex items-center gap-2 text-amber-900 font-semibold">
                  <Coffee className="w-3.5 h-3.5 text-amber-600" />
                  <span>2.5 hrs Vacant (10:00 AM – 12:30 PM)</span>
                </div>
                <span className="text-amber-700 font-bold text-[11px] bg-amber-100/80 px-2 py-0.5 rounded-md">
                  Focus Sprint
                </span>
              </div>
            </div>
          </div>

          {/* Key Trust Pillars */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>AI COR Scan</span>
            </div>
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Gap Finder</span>
            </div>
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Cloud Sync</span>
            </div>
          </div>
        </div>

        {/* Right Pane: Elevated Tactile Auth Card */}
        <div className="lg:col-span-6 w-full max-w-[430px] mx-auto">
          <div
            className="rounded-3xl p-7 sm:p-9 space-y-6 relative bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-2xl"
            style={{
              boxShadow: '0 20px 50px -12px rgba(79, 70, 229, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            }}
          >
            {/* Top Segmented Mode Switcher */}
            <div className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 grid grid-cols-2 gap-1 text-[13px] font-bold select-none">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-xl transition-all ${
                  !isSignUp
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 rounded-xl transition-all ${
                  isSignUp
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error / Success Banners */}
            {error && (
              <div
                className="px-4 py-3 rounded-xl text-[13px] font-semibold animate-fade-in flex items-center gap-2"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div
                className="px-4 py-3 rounded-xl text-[13px] font-semibold animate-fade-in flex items-center gap-2"
                style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46' }}
              >
                <span>✅</span>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Josh Santos"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[14px] bg-slate-50/80 border border-slate-200 text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@student.edu"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[14px] bg-slate-50/80 border border-slate-200 text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl text-[14px] bg-slate-50/80 border border-slate-200 text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-[14.5px] text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-indigo-500/25 hover:scale-101 active:scale-99 disabled:opacity-60 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                }}
              >
                {loading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Free Account' : 'Sign In to Schedule'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Modern Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200/90" />
              <span className="text-[11.5px] text-slate-400 font-semibold uppercase tracking-wider">or continue with</span>
              <div className="flex-1 h-px bg-slate-200/90" />
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-[13.5px] text-slate-700 bg-white hover:bg-slate-50/90 border border-slate-200/90 shadow-2xs hover:shadow-xs flex items-center justify-center gap-3 transition-all hover:scale-101 active:scale-99 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Terms & Privacy Policy Footer */}
            <div className="pt-1 text-center text-[11.5px] font-medium text-slate-400 leading-normal">
              By continuing, you agree to our{' '}
              <button
                type="button"
                onClick={() => openLegal('terms')}
                className="text-slate-600 font-semibold underline underline-offset-2 hover:text-indigo-600 cursor-pointer transition-colors bg-transparent border-none p-0 inline"
              >
                Terms
              </button>{' '}
              &{' '}
              <button
                type="button"
                onClick={() => openLegal('privacy')}
                className="text-slate-600 font-semibold underline underline-offset-2 hover:text-indigo-600 cursor-pointer transition-colors bg-transparent border-none p-0 inline"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="max-w-6xl w-full mx-auto text-center text-[12px] text-slate-400 pt-4 z-10">
        © {new Date().getFullYear()} SnapSched. All rights reserved.
      </div>

      {/* Interactive Legal Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        initialTab={legalTab}
        onClose={() => setLegalModalOpen(false)}
      />
    </div>
  );
};

