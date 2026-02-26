import React, { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Timer, TrendingUp, Settings, BookOpen } from 'lucide-react';

const tabs = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/setup', label: 'Setup', icon: BookOpen },
  { path: '/focus', label: 'Focus', icon: Timer },
  { path: '/progress', label: 'Progress', icon: TrendingUp },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomTabBar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [pressedTab, setPressedTab] = useState<string | null>(null);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-card/98 backdrop-blur-lg border-t border-border shadow-tab rounded-t-2xl">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {tabs.map(({ path, label, icon: Icon }) => {
          const isActive = currentPath === path || (path === '/dashboard' && currentPath === '/');
          return (
            <Link
              key={path}
              to={path}
              onMouseDown={() => setPressedTab(path)}
              onMouseUp={() => setPressedTab(null)}
              onTouchStart={() => setPressedTab(path)}
              onTouchEnd={() => setPressedTab(null)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 select-none
                ${pressedTab === path ? 'scale-90' : 'scale-100'}
                ${isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200
                ${isActive ? 'bg-primary/12' : 'bg-transparent'}`}>
                <Icon
                  size={isActive ? 21 : 20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-all duration-200"
                />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[10px] leading-tight transition-all duration-200 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
