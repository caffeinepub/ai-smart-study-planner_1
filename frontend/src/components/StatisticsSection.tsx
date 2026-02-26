import React from 'react';
import { Clock, Target, BarChart2 } from 'lucide-react';
import { useFocusStats } from '../hooks/useFocusStats';
import { useWeeklyActivity } from '../hooks/useWeeklyActivity';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function StatisticsSection() {
  const { formattedTime, focusSessionCount } = useFocusStats();
  const weeklyData = useWeeklyActivity();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-primary" />
        <h2 className="font-bold text-sm text-foreground">Study Statistics</h2>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Focus Time */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-card space-y-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground leading-tight">{formattedTime}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Total Focus Time</p>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="p-4 rounded-2xl bg-card border border-border shadow-card space-y-2">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground leading-tight">{focusSessionCount}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {focusSessionCount === 1 ? 'Session' : 'Sessions'} Completed
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground">Weekly Focus Activity</h3>
          <span className="text-xs text-muted-foreground">minutes / day</span>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.90 0.02 264)"
                opacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: 'oklch(0.52 0.04 264)', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'oklch(0.52 0.04 264)', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(1 0 0)',
                  border: '1px solid oklch(0.90 0.02 264)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  boxShadow: '0 4px 16px rgba(99,102,241,0.12)',
                }}
                formatter={(value: number) => [`${value} min`, 'Focus']}
                cursor={{ fill: 'oklch(0.51 0.22 264 / 0.06)' }}
              />
              <Bar
                dataKey="value"
                fill="oklch(var(--primary))"
                radius={[6, 6, 0, 0]}
                name="Focus Minutes"
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {weeklyData.every((d) => d.value === 0) && (
          <p className="text-xs text-muted-foreground text-center pb-1">
            Complete focus sessions to see your weekly activity here.
          </p>
        )}
      </div>
    </div>
  );
}
