export type PremiumFeature =
  | 'smart_study_insights'
  | 'advanced_statistics'
  | 'unlimited_study_plans'
  | 'cloud_backup'
  | 'customizable_themes'
  | 'ad_free_experience'
  | 'advanced_focus_mode';

export interface FeatureConfig {
  displayName: string;
  description: string;
  icon: string;
}

export const PREMIUM_FEATURES: Record<PremiumFeature, FeatureConfig> = {
  smart_study_insights: {
    displayName: 'Smart Study Insights',
    description: 'AI-powered recommendations based on your study patterns to maximize retention.',
    icon: '🧠',
  },
  advanced_statistics: {
    displayName: 'Advanced Statistics',
    description: 'Deep analytics with charts, trends, and subject-level performance breakdowns.',
    icon: '📊',
  },
  unlimited_study_plans: {
    displayName: 'Unlimited Study Plans',
    description: 'Manage all your exams simultaneously with no limits on subjects or topics.',
    icon: '📚',
  },
  cloud_backup: {
    displayName: 'Cloud Backup',
    description: 'Keep your study plans safe and synced across all your devices automatically.',
    icon: '☁️',
  },
  customizable_themes: {
    displayName: 'Customizable Themes',
    description: 'Personalize your app with beautiful color themes that match your style.',
    icon: '🎨',
  },
  ad_free_experience: {
    displayName: 'Ad-Free Experience',
    description: 'Enjoy a clean, distraction-free study environment with no ads.',
    icon: '✨',
  },
  advanced_focus_mode: {
    displayName: 'Advanced Focus Mode',
    description: 'Custom intervals, ambient sounds, and session history for deeper focus.',
    icon: '🎯',
  },
};

export const ALL_PREMIUM_FEATURES: PremiumFeature[] = [
  'smart_study_insights',
  'advanced_statistics',
  'unlimited_study_plans',
  'cloud_backup',
  'customizable_themes',
  'ad_free_experience',
  'advanced_focus_mode',
];

// Keep legacy alias for any code that still references FEATURE_CONFIG
export const FEATURE_CONFIG = PREMIUM_FEATURES;
