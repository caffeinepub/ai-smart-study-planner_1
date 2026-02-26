# Specification

## Summary
**Goal:** Fix a runtime crash caused by `SubscriptionProvider` not wrapping the full application component tree, which breaks the guest flow.

**Planned changes:**
- Move `SubscriptionProvider` to `App.tsx` (or the highest root-level file above all routes) so it wraps the entire component tree
- Ensure all routes — including the guest flow triggered by "Continue as Guest" — have access to the subscription context

**User-visible outcome:** Clicking "Continue as Guest" no longer crashes the app with "useSubscriptionContext must be used within SubscriptionProvider", and all routes work correctly for both guest and authenticated users.
