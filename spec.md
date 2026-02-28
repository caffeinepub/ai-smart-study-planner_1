# Specification

## Summary
**Goal:** Add a Cloud Backup & Restore section to the Settings page, allowing premium users to export and import all their app data as a local JSON file.

**Planned changes:**
- Create a `createBackup` utility that collects study plans, tasks, daily progress, streak, companion state, and settings into a `studiora_backup.json` file; use the Web Share API to open the device share sheet if available, otherwise fall back to a direct file download. No data is sent to any backend.
- Create a `restoreBackup` utility that opens a file picker for `.json` files, validates the backup structure, shows a confirmation dialog ("Restoring will replace current data. Continue?"), writes all fields back to localStorage, and refreshes relevant React Query caches. Shows an error toast on invalid files.
- Add a "Backup & Restore" section (☁️ heading) to the Settings page with: a "Last Backup" timestamp (or "Never"), a "Backup to Cloud" button, a "Restore from Backup" button, a privacy notice, and a ~1.5s success animation/message after backup completes.
- Gate the section behind `isPremium`: free-tier users see a 🔒 lock indicator and an upgrade prompt (with disabled/replaced buttons); premium and trial users see the fully functional section. Clicking the upgrade prompt opens the PaywallScreen modal.

**User-visible outcome:** Premium users can back up all their Studiora data to their personal cloud storage (Google Drive, iCloud, Dropbox, etc.) via the device share sheet, and restore it later using a file picker — all from a new "Backup & Restore" card in Settings. Free users see a locked upgrade prompt in its place.
