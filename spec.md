# Specification

## Summary
**Goal:** Replace the existing Studiora logo with the user's uploaded custom image (open book with green sprout and blue/purple circular background).

**Planned changes:**
- Save the uploaded image as the Studiora logo asset (`frontend/public/assets/generated/studiora-logo.png`)
- Update `Layout.tsx` to display the new logo image in the sticky header, replacing any prior logo element
- Update `LoginPage.tsx` to display the new logo image on the login/landing page, replacing any prior logo element
- Apply appropriate display sizes (e.g., h-8 or h-10 in the header, larger on the login page) and alt text ("Studiora logo")

**User-visible outcome:** The app header and login page both show the custom uploaded logo (open book with green sprout) instead of the previously generated or SVG-based logo.
