import React from 'react';
import PremiumGate from './PremiumGate';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';

interface WeeklyEntry {
  dayLabel: string;
  completedTasks: number;
  totalTasks: number;
}

interface AdvancedStatisticsSectionProps {
  weeklyEntries: WeeklyEntry[];
  totalCompleted: number;
  totalPending: number;
}

function AdvancedStatisticsContent({ weeklyEntries, totalCompleted, totalPending }: AdvancedStatisticsSectionProps) {
  const maxTasks = Math.max(...weeklyEntries.map((e) => e.totalTasks), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-primary">{totalCompleted}</p>
          <p className="text-xs text-muted-foreground mt-1">Tasks Completed</p>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-foreground">{totalPending}</p>
          <p className="text-xs text-muted-foreground mt-1">Tasks Pending</p>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl">
        <p className="text-sm font-semibold text-foreground mb-3">Weekly Activity</p>
        <div className="flex items-end gap-1.5 h-24">
          {weeklyEntries.map((entry) => {
            const height = entry.totalTasks > 0
              ? Math.max((entry.completedTasks / maxTasks) * 100, 4)
              : 4;
            const completion = entry.totalTasks > 0
              ? Math.round((entry.completedTasks / entry.totalTasks) * 100)
              : 0;
            return (
              <div key={entry.dayLabel} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <div
                    className="w-full rounded-t-sm bg-primary/70 transition-all"
                    style={{ height: `${height}%` }}
                    title={`${entry.completedTasks}/${entry.totalTasks} (${completion}%)`}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                  {entry.dayLabel.replace('Day-', 'D-')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl">
        <p className="text-sm font-semibold text-foreground mb-3">Completion Rate</p>
        <div className="space-y-2">
          {weeklyEntries.slice(-3).map((entry) => {
            const rate = entry.totalTasks > 0
              ? Math.round((entry.completedTasks / entry.totalTasks) * 100)
              : 0;
            return (
              <div key={entry.dayLabel} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16 shrink-0">{entry.dayLabel}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-8 text-right">{rate}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdvancedStatisticsSection(props: AdvancedStatisticsSectionProps) {
  const { isLoading } = useConsolidatedPremiumStatus();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-muted/40 rounded-xl animate-pulse" />
        <div className="h-32 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <PremiumGate featureName="Advanced Statistics" showPreview>
      <AdvancedStatisticsContent {...props} />
    </PremiumGate>
  );
}
