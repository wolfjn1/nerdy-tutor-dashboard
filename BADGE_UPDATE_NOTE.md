# Sidebar Badge Updates

## Current Status
Updated sidebar badges to show correct counts:
- **Students**: Changed from "16" to "15" (showing active students only)
- **Sessions**: Changed from "3" to "4" (showing today's sessions)

## Issue
The badges are still hardcoded in two places:
1. `components/layout/Sidebar.tsx` - Not currently used by dashboard
2. `app/(dashboard)/layout.tsx` - The actual sidebar being used

## Future Improvements
These badges should be dynamic, fetching real-time data:
- Students badge: Query active student count
- Sessions badge: Query today's session count
- Could also add badges for:
  - Unread messages
  - Pending tasks
  - New opportunities

## Current Implementation
For now, the badges show the correct static values based on Sarah's data:
- 15 active students
- 4 sessions today

This provides a better user experience than the incorrect values, but should be made dynamic in the future. 