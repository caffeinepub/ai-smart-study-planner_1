import React from 'react';
import BottomTabBar from './BottomTabBar';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-5 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs shrink-0">
            <img
              src="/assets/file_0000000068a87208913cc2e62995fbaa.png"
              alt="Studiora logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight tracking-tight">Studiora</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">Study Planner</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto tab-safe-bottom">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <BottomTabBar />
    </div>
  );
}
