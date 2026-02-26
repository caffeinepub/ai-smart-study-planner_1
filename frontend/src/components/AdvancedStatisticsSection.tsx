import React, { useState } from 'react';
import { BarChart2, TrendingUp, PieChart, Clock, Sparkles } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
} from 'recharts';
import { useConsolidatedPremiumStatus } from '../utils/premiumCheck';
import PaywallScreen from './PaywallScreen';
import type { DailyTask, WeeklyProgressEntry } from '../backend';

interface AdvancedStatisticsSectionProps {
  tasks: DailyTask[];
  weeklyEntries: WeeklyProgressEntry[];
}

const SUBJECT_COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f97316', '#f43f5e', '#3b82f6'];

export default function AdvancedStatisticsSection({ tasks, weeklyEntries }: AdvancedStatisticsSectionProps) {
  const [showPaywall, setShowPaywall] = useState(false);

  const { isPremium, isLoading: premiumLoading } = useConsolidatedPremiumStatus();

  // Compute subject breakdown
  const subjectMap: Record<string, { completed: number; total: number }> = {};
  for (const task of tasks) {
    if (!subjectMap[task.subjectName]) subjectMap[task.subjectName] = { completed: 0, total: 0 };
    subjectMap[task.subjectName].total++;
    if (task.isCompleted) subjectMap[task.subjectName].completed++;
  }
  const subjectData = Object.entries(subjectMap).map(([name, s]) => ({
    name: name.length > 12 ? name.slice(0, 12) + '…' : name,
    fullName: name,
    completed: s.completed,
    total: s.total,
    rate: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0,
  }));

  // Trend data from weekly entries
  const trendData = weeklyEntries.map((e) => ({
    day: e.dayLabel,
    completed: Number(e.completedTasks),
    total: Number(e.totalTasks),
    rate: Number(e.totalTasks) > 0
      ? Math.round((Number(e.completedTasks) / Number(e.totalTasks)) * 100)
      : 0,
  }));

  // Pie data for completion breakdown
  const totalCompleted = tasks.filter((t) => t.isCompleted).length;
  const totalPending = tasks.filter((t) => !t.isCompleted).length;
  const pieData = [
    { name: 'Completed', value: totalCompleted },
    { name: 'Pending', value: totalPending },
  ];

  if (premiumLoading) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold">Advanced Analytics</h3>
            <p className="text-xs text-muted-foreground">Detailed performance insights</p>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground text-xs py-6">
          <span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center gap-3 border-b border-white/10 dark:border-white/6">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold">Advanced Analytics</h3>
              <p className="text-xs text-muted-foreground">Detailed performance insights</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              Premium
            </div>
          </div>

          <div className="relative p-4">
            <div className="absolute inset-0 backdrop-blur-[2px] bg-background/40 z-10 flex flex-col items-center justify-center gap-3 rounded-b-2xl">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-bold">Unlock Advanced Analytics</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Trends, subject breakdowns, and performance heatmaps
                </p>
              </div>
              <button
                onClick={() => setShowPaywall(true)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white active:scale-95 transition-all duration-150"
                style={{ background: 'linear-gradient(135deg, oklch(0.51 0.22 264), oklch(0.62 0.22 290))' }}
              >
                Upgrade to Premium
              </button>
            </div>
            {/* Ghost charts */}
            <div className="space-y-3">
              <div className="h-32 bg-muted/30 rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-muted/30 rounded-xl" />
                <div className="h-24 bg-muted/30 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        <PaywallScreen open={showPaywall} onClose={() => setShowPaywall(false)} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-primary" />
        <h2 className="font-bold text-sm">Advanced Analytics</h2>
        <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-semibold ml-auto">
          <Sparkles className="w-3 h-3" />
          Premium
        </div>
      </div>

      {/* 1. Completion Trend */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completion Trend</h3>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'currentColor' }} />
              <YAxis tick={{ fontSize: 9, fill: 'currentColor' }} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)' }}
                formatter={(v: number) => [`${v}%`, 'Completion']}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#completionGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Subject Breakdown + Pie */}
      <div className="grid grid-cols-2 gap-3">
        {/* Subject bar chart */}
        <div className="glass-card rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">By Subject</h3>
          </div>
          {subjectData.length === 0 ? (
            <p className="text-[10px] text-muted-foreground text-center py-4">No data yet</p>
          ) : (
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} margin={{ top: 2, right: 2, left: -32, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'currentColor' }} />
                  <YAxis tick={{ fontSize: 8, fill: 'currentColor' }} />
                  <Tooltip
                    contentStyle={{ fontSize: 10, borderRadius: 6 }}
                    formatter={(v: number) => [`${v}%`, 'Rate']}
                  />
                  <Bar dataKey="rate" radius={[3, 3, 0, 0]}>
                    {subjectData.map((_, i) => (
                      <Cell key={i} fill={SUBJECT_COLORS[i % SUBJECT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="glass-card rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Overview</h3>
          </div>
          <div className="h-28 flex items-center justify-center">
            {totalCompleted + totalPending === 0 ? (
              <p className="text-[10px] text-muted-foreground">No tasks yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={44}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#6366f1" />
                    <Cell fill="rgba(99,102,241,0.2)" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 10, borderRadius: 6 }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[9px] text-muted-foreground">{totalCompleted} done</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary/20" />
              <span className="text-[9px] text-muted-foreground">{totalPending} left</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Time estimate */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Study Estimate</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-primary">{totalCompleted}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{totalPending}</p>
            <p className="text-[10px] text-muted-foreground">Remaining</p>
          </div>
          <div>
            <p className="text-lg font-bold text-accent">
              {totalCompleted + totalPending > 0
                ? Math.round((totalCompleted / (totalCompleted + totalPending)) * 100)
                : 0}%
            </p>
            <p className="text-[10px] text-muted-foreground">Overall</p>
          </div>
        </div>
      </div>
    </div>
  );
}
