# Specification

## Summary
**Goal:** Fix two bugs: the theme colour selector not applying changes, and the revision day screen showing a generic motivational quote instead of actual revision tasks.

**Planned changes:**
- Fix the theme colour selector in Settings so that selecting a preset immediately applies its CSS custom properties to the document root, persists the selection to localStorage, and visually highlights the active theme in the selector grid.
- Fix the revision day screen to display the user's actual revision tasks/subjects scheduled for that day instead of a generic motivational quote. Show an appropriate empty state if no tasks are scheduled.

**User-visible outcome:** Users can select a colour theme in Settings and see it applied instantly and preserved on reload. On revision days, users see their actual scheduled revision topics instead of a generic motivational quote.
