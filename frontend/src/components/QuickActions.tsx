import React from 'react';
import { Plus, Play, TrendingUp } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  iconBgClass: string;
  iconColorClass: string;
}

function QuickActionButton({ icon, label, onClick, iconBgClass, iconColorClass }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 flex-1 py-3.5 px-2 rounded-2xl glass-card active:scale-95 transition-all duration-150 hover:brightness-[1.03]"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBgClass}`}>
        <span className={iconColorClass}>{icon}</span>
      </div>
      <span className="text-foreground text-[11px] font-semibold leading-tight text-center">{label}</span>
    </button>
  );
}

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3">
      <QuickActionButton
        icon={<Plus className="w-4 h-4" />}
        label="Add Task"
        onClick={() => navigate({ to: '/setup' })}
        iconBgClass="bg-primary/12 dark:bg-primary/20"
        iconColorClass="text-primary"
      />
      <QuickActionButton
        icon={<Play className="w-4 h-4" />}
        label="Start Focus"
        onClick={() => navigate({ to: '/focus' })}
        iconBgClass="bg-accent/12 dark:bg-accent/20"
        iconColorClass="text-accent"
      />
      <QuickActionButton
        icon={<TrendingUp className="w-4 h-4" />}
        label="Progress"
        onClick={() => navigate({ to: '/progress' })}
        iconBgClass="bg-emerald-500/12 dark:bg-emerald-400/15"
        iconColorClass="text-emerald-600 dark:text-emerald-400"
      />
    </div>
  );
}
