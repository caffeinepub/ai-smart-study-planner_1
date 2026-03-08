# Specification

## Summary
**Goal:** Implement Free/Premium monetization for Studiora using a simulated Google Play Billing layer, with two subscription tiers, a redesigned paywall, soft upgrade prompts, and backend premium status storage.

**Planned changes:**
- Create `frontend/src/utils/googlePlayBilling.ts` with a simulated Google Play Billing API (`initBillingClient`, `launchBillingFlow`, `acknowledgePurchase`, `queryPurchases`) using localStorage for purchase persistence
- Update `useSubscription.ts` hook to define Free and Premium tiers with product IDs `studiora_monthly` ($3.99/month) and `studiora_yearly` ($29.99/year), exposing `isPremium`, `subscribeToPlan`, `restorePurchases`, and `cancelSubscription`
- Update `SubscriptionContext.tsx` to integrate the billing utility, auto-restore purchases on mount, and expose the full subscription API to consumers
- Redesign `PaywallScreen.tsx` to show "Upgrade to Studiora Premium" title, 7 premium feature benefits with icons, Monthly/Yearly plan selection cards (Yearly with "Best Value" badge), "Continue with Google Play" CTA, "Restore Purchases" button, success toast "Premium unlocked. Stay focused.", and inline failure message "Payment cancelled or failed."
- Update `PremiumGate.tsx` and `UpgradePrompt.tsx` to show a soft, non-blocking prompt "Available in Premium to enhance your study experience." that opens the PaywallScreen
- Gate only advanced analytics (`AdvancedStatisticsSection`), AI insights (`AIInsightsPanel`, `SmartStudyInsightsCard`), advanced focus settings (`AdvancedFocusSettings`), themes beyond the first 3 (`ThemeSelectorSection`), and export reports behind premium; all free-tier features remain fully accessible
- Update `backend/main.mo` to add `storePremiumStatus(isPremium: Bool)` and `getPremiumStatus()` per-user functions, defaulting to false for new users

**User-visible outcome:** Free users can use all core features (study plans, tasks, schedule, basic timer, progress summary) without restriction. Premium features show a gentle upgrade prompt. Users can subscribe via a redesigned paywall with monthly or yearly Google Play billing options, and premium status is restored automatically on app launch.
