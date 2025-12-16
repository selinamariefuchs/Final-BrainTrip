import React, { useState } from 'react';
import { Button } from './Button';
import { Mail, Lock, User as UserIcon, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { Logo } from './Logo';

interface AuthProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all fields.");
      return;
    }

    // Simulated Authentication Logic
    const storedUsersStr = localStorage.getItem('braintrip_users');
    const storedUsers: any[] = storedUsersStr ? JSON.parse(storedUsersStr) : [];

    if (isLogin) {
      // Login Logic
      const foundUser = storedUsers.find(u => u.email === email && u.password === password);
      if (foundUser) {
        onLogin({ name: foundUser.name, email: foundUser.email });
      } else {
        setError("Invalid email or password.");
      }
    } else {
      // Signup Logic
      if (storedUsers.find(u => u.email === email)) {
        setError("Account already exists with this email.");
        return;
      }
      
      const newUser = { name, email, password };
      localStorage.setItem('braintrip_users', JSON.stringify([...storedUsers, newUser]));
      
      // Auto-login after signup
      onLogin({ name, email });
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setSuccessMsg("Reset link sent! Check your inbox.");
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-b-[3rem] z-0 shadow-lg"></div>

      <div className="z-10 px-6 pt-8 pb-4">
        <button 
          onClick={onBack}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 -mt-10 overflow-y-auto">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 space-y-6 animate-fade-in-up">
          <div className="text-center flex flex-col items-center">
             <Logo size="md" variant="full" theme="dark" className="mb-4" />
             <h2 className="text-2xl font-bold text-slate-800">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
             <p className="text-slate-500 mt-2 text-sm">
               {isLogin ? 'Enter your details to access your passport.' : 'Start your journey with BrainTrip.'}
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isLogin && (
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="text-green-600 text-sm text-center font-medium bg-green-50 p-2 rounded-lg flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {successMsg}
              </div>
            )}

            <Button type="submit" fullWidth className="mt-2">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};