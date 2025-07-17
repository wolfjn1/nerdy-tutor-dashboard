# Assembled Chatbot Integration

## Overview

The AI Assistant button in the dashboard header now launches your Assembled chatbot as a widget overlay.

## Implementation Details

### 1. Script Loading
The Assembled script is loaded dynamically when the dashboard loads:
```javascript
script.src = 'https://cal.assembledhq.com/static/js/public-chat.js'
script.setAttribute('data-company-id', 'ec88077a-64ee-44e2-a813-925b45de7908')
script.setAttribute('data-profile-id', '649cf0fd-813f-4464-b8e3-2e23ab04aad6')
```

### 2. Button Changes
- Removed the `xpReward={25}` prop (no more +25 XP message)
- Added `onClick={handleAIAssistantClick}` to launch the widget

### 3. Widget Launch
When clicked, the button calls:
```javascript
window.Assembled.openChat()
```

This opens the Assembled chat widget as an overlay on the current page.

## Location
- File: `app/(dashboard)/layout.tsx`
- Component: `DashboardContent`
- Button location: Header, next to notifications

## Troubleshooting

If the widget doesn't open:
1. Check browser console for errors
2. Verify the script loaded successfully
3. Ensure the company ID and profile ID are correct
4. Check if `window.Assembled` is available

## Customization

To change the widget behavior:
1. Update the company ID or profile ID in the script attributes
2. Consult Assembled documentation for additional configuration options
3. The widget appearance is controlled by your Assembled dashboard settings 