import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, ArrowLeft, BrainCircuit, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

export const LoginPage: React.FC = () => {
  const { setPage } = useApp();
  const { login, loginWithEmail, signupWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const mapFirebaseError = (code: string, defaultMsg: string): string => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email already exists';
      case 'auth/user-not-found':
        return 'No account found';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-email':
        return 'Invalid email';
      case 'auth/weak-password':
        return 'Password must contain at least 6 characters';
      case 'auth/invalid-credential':
        return 'Incorrect password or no account found';
      case 'auth/operation-not-allowed':
        return 'Email/Password provider is disabled in Firebase console.';
      default:
        return defaultMsg;
    }
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Email is invalid';
    
    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters';

    if (isSignUp && !name) {
      tempErrors.name = 'Full name is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      if (isSignUp) {
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      setPage('onboarding');
    } catch (err: any) {
      console.error(err);
      const errorCode = err?.code || '';
      const errorMessage = err?.message || 'Authentication failed. Please try again.';
      const uiMessage = mapFirebaseError(errorCode, errorMessage);
      setErrors({ submit: uiMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrors({});
    try {
      await login();
      setPage('onboarding');
    } catch (err: any) {
      console.error(err);
      setErrors({ submit: err.message || 'Google sign-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-black bg-grid-pattern relative flex flex-col justify-center items-center px-4 py-12 overflow-hidden text-vanilla-custard">
      {/* Animated background highlights using palette */}
      <div className="absolute top-[20%] left-[15%] w-72 h-72 rounded-full bg-dark-cyan/15 blur-[80px] animate-float pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[15%] w-80 h-80 rounded-full bg-golden-orange/15 blur-[90px] animate-float pointer-events-none" style={{ animationDelay: '-3s' }}></div>

      {/* Back to Home CTA */}
      <button 
        onClick={() => setPage('landing')}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-pearl-aqua/80 hover:text-pearl-aqua transition-all cursor-pointer group bg-transparent border-0"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      {/* Auth Card */}
      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-pearl-aqua/20 shadow-2xl relative z-10">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-dark-cyan to-golden-orange flex items-center justify-center shadow-lg shadow-dark-cyan/20">
            <BrainCircuit className="w-7 h-7 text-ink-black" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mt-4 mb-1">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-pearl-aqua/80 text-sm">
            {isSignUp ? 'Start building your dream career today' : 'Continue your AI-mentored career journey'}
          </p>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3.5 bg-oxidized-iron/20 border border-oxidized-iron/40 text-rusty-spice rounded-xl text-xs text-left">
            {errors.submit}
          </div>
        )}

        {/* Google Authentication Button */}
        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl glass-card border border-pearl-aqua/20 hover:border-dark-cyan text-vanilla-custard hover:text-white font-medium text-sm flex items-center justify-center gap-3 transition-all hover:bg-dark-teal/30 active:scale-[0.98] cursor-pointer mb-6"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-pearl-aqua/20"></div>
          <span className="text-pearl-aqua/60 text-xs font-semibold uppercase tracking-wider">or email</span>
          <div className="flex-1 h-px bg-pearl-aqua/20"></div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {isSignUp && (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-pearl-aqua uppercase tracking-wide">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-pearl-aqua/60" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={`w-full pl-11 pr-4 py-3 bg-dark-teal/20 border ${errors.name ? 'border-oxidized-iron' : 'border-pearl-aqua/30 focus:border-dark-cyan'} rounded-xl text-white placeholder-pearl-aqua/40 focus:outline-none transition-all text-sm`}
                />
              </div>
              {errors.name && <span className="text-rusty-spice text-xs mt-1">{errors.name}</span>}
            </div>
          )}

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-pearl-aqua uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-pearl-aqua/60" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className={`w-full pl-11 pr-4 py-3 bg-dark-teal/20 border ${errors.email ? 'border-oxidized-iron' : 'border-pearl-aqua/30 focus:border-dark-cyan'} rounded-xl text-white placeholder-pearl-aqua/40 focus:outline-none transition-all text-sm`}
              />
            </div>
            {errors.email && <span className="text-rusty-spice text-xs mt-1">{errors.email}</span>}
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-pearl-aqua uppercase tracking-wide">Password</label>
              {!isSignUp && (
                <button 
                  type="button"
                  onClick={() => alert('Password reset verification link requested.')}
                  className="text-xs text-golden-orange hover:text-vanilla-custard transition-all bg-transparent border-0 cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-pearl-aqua/60" />
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-11 pr-11 py-3 bg-dark-teal/20 border ${errors.password ? 'border-oxidized-iron' : 'border-pearl-aqua/30 focus:border-dark-cyan'} rounded-xl text-white placeholder-pearl-aqua/40 focus:outline-none transition-all text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pearl-aqua/60 hover:text-white transition-colors border-0 bg-transparent cursor-pointer p-0.5 flex items-center justify-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-golden-orange" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-rusty-spice text-xs mt-1">{errors.password}</span>}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 mt-2 rounded-xl bg-gradient-to-r from-dark-cyan via-golden-orange to-burnt-caramel text-ink-black font-extrabold text-sm shadow-lg shadow-dark-cyan/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-ink-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Bottom Options toggle */}
        <div className="mt-8 text-center text-sm text-pearl-aqua/70">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button 
                onClick={() => { setIsSignUp(false); setErrors({}); }} 
                className="text-golden-orange hover:text-white font-bold bg-transparent border-0 cursor-pointer transition-all"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button 
                onClick={() => { setIsSignUp(true); setErrors({}); }} 
                className="text-golden-orange hover:text-white font-bold bg-transparent border-0 cursor-pointer transition-all"
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
