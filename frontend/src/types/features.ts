export type PremiumFeature =
  | 'smart_study_insights'
  | 'advanced_statistics'
  | 'unlimited_study_plans'
  | 'cloud_backup'
  | 'customizable_themes'
  | 'advanced_focus_mode';

export interface FeatureConfig {
  name: string;
  description: string;
  icon: string;
}

export const FEATURE_CONFIG: Record<PremiumFeature, FeatureConfig> = {
  smart_study_insights: {
    name: 'Smart Study Insights',
    description: 'AI-powered analysis of your study patterns and personalized recommendations.',
    icon: '🧠',
  },
  advanced_statistics: {
    name: 'Advanced Statistics',
    description: 'Detailed analytics and progress charts to track your performance over time.',
    icon: '📊',
  },
  unlimited_study_plans: {
    name: 'Unlimited Study Plans',
    description: 'Create and manage multiple exam study plans simultaneously.',
    icon: '📚',
  },
  cloud_backup: {
    name: 'Cloud Backup',
    description: 'Securely back up and restore your study data across devices.',
    icon: '☁️',
  },
  customizable_themes: {
    name: 'Customizable Themes',
    description: 'Personalize your study environment with beautiful color themes.',
    icon: '🎨',
  },
  advanced_focus_mode: {
    name: 'Advanced Focus Mode',
    description: 'Ambient sounds, extended sessions, and distraction-free study environment.',
    icon: '🎯',
  },
};

export const PREMIUM_FEATURES: PremiumFeature[] = [
  'smart_study_insights',
  'advanced_statistics',
  'unlimited_study_plans',
  'cloud_backup',
  'customizable_themes',
  'advanced_focus_mode',
];
