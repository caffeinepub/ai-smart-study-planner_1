export type PremiumFeature =
  | 'ai-schedule-optimization'
  | 'advanced-analytics'
  | 'advanced-progress-analytics'
  | 'unlimited-exams'
  | 'cloud-sync'
  | 'advanced-focus-mode';

export interface FeatureConfig {
  displayName: string;
  description: string;
  icon: string;
}

export const FEATURE_CONFIG: Record<PremiumFeature, FeatureConfig> = {
  'ai-schedule-optimization': {
    displayName: 'AI Schedule Optimization',
    description: 'Let AI analyze your learning patterns and automatically build the perfect study schedule for you.',
    icon: '🤖',
  },
  'advanced-analytics': {
    displayName: 'Advanced Progress Analytics',
    description: 'Deep insights into your study habits, performance trends, and personalized improvement tips.',
    icon: '📊',
  },
  'advanced-progress-analytics': {
    displayName: 'Advanced Progress Analytics',
    description: 'Get personalized insights from your study activity to improve your learning outcomes.',
    icon: '📈',
  },
  'unlimited-exams': {
    displayName: 'Unlimited Exams & Subjects',
    description: 'Manage all your exams simultaneously with no limits on subjects or topics.',
    icon: '📚',
  },
  'cloud-sync': {
    displayName: 'Cloud Backup & Sync',
    description: 'Keep your study plans safe and synced across all your devices automatically.',
    icon: '☁️',
  },
  'advanced-focus-mode': {
    displayName: 'Advanced Focus Mode',
    description: 'Custom session lengths, smart break reminders, and distraction-blocking features.',
    icon: '🎯',
  },
};

export const ALL_PREMIUM_FEATURES: PremiumFeature[] = [
  'ai-schedule-optimization',
  'advanced-analytics',
  'advanced-progress-analytics',
  'unlimited-exams',
  'cloud-sync',
  'advanced-focus-mode',
];
