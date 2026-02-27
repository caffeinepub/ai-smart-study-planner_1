import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGuestMode } from '../hooks/useGuestMode';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, BarChart3, Clock, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const { enterGuestMode } = useGuestMode();
  const navigate = useNavigate();
  const isLoggingIn = loginStatus === 'logging-in';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      // ignore
    }
  };

  const handleGuestMode = () => {
    enterGuestMode();
    navigate({ to: '/dashboard' });
  };

  const features = [
    { icon: BookOpen, label: 'Smart Planning', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { icon: Clock, label: 'Focus Timer', color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
    { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    { icon: Brain, label: 'AI Scheduling', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Gradient hero background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-64 h-64 rounded-full bg-accent/6 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div
          className={`w-full max-w-sm space-y-7 transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Logo & Title */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl scale-110" />
                <img
                  src="/assets/file_0000000068a87208913cc2e62995fbaa.png"
                  alt="Studiora logo"
                  className="relative w-24 h-24 object-contain drop-shadow-lg"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Studiora
              </h1>
              <p className="text-base font-medium text-muted-foreground">
                Study Planner
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                Your intelligent study companion. Plan smarter, study better, achieve more.
              </p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-2.5">
            {features.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-card border border-border shadow-xs"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color.split(' ')[0]}`}>
                  <Icon className={`w-4 h-4 ${color.split(' ').slice(1).join(' ')}`} />
                </div>
                <span className="text-sm font-semibold text-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Premium badge */}
          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-primary/8 border border-primary/15 w-fit mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Premium features available</span>
          </div>

          {/* Auth Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full h-13 px-6 py-3.5 rounded-2xl font-semibold text-base text-white gradient-primary shadow-primary active:scale-[0.98] transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In with Internet Identity
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={handleGuestMode}
              className="w-full h-12 px-6 py-3 rounded-2xl font-medium text-sm text-foreground bg-card border border-border hover:bg-muted/50 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
            >
              Continue as Guest
            </button>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              Guest mode gives you full local access.{' '}
              <span className="text-primary font-medium">Sign in</span> to enable cloud sync.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-5 text-center text-xs text-muted-foreground">
        Built with{' '}
        <span className="text-red-500">♥</span>{' '}
        using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          caffeine.ai
        </a>{' '}
        · © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
