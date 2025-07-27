# Onboarding API Documentation

## Overview

The Onboarding API provides endpoints for managing the tutor onboarding process. All endpoints require authentication.

## Authentication

All API endpoints require a valid authentication token. The API uses Supabase authentication and reads the user session from cookies.

## Endpoints

### 1. Complete Onboarding Step

Marks a specific onboarding step as completed for the authenticated tutor.

**Endpoint:** `POST /api/onboarding/complete-step`

**Request Body:**
```json
{
  "stepId": "welcome" // One of: welcome, profile_setup, best_practices, ai_tools_intro, first_student_guide
}
```

**Response:**
```json
{
  "success": true,
  "status": {
    "completedSteps": ["welcome"],
    "currentStep": "profile_setup",
    "startedAt": "2024-01-20T10:00:00Z",
    "completedAt": null,
    "totalSteps": 5,
    "percentComplete": 20
  },
  "isComplete": false,
  "message": "Step 'welcome' completed successfully."
}
```

**Error Responses:**
- `400 Bad Request` - Invalid step ID or trying to complete steps out of order
- `401 Unauthorized` - Not authenticated
- `409 Conflict` - Step already completed
- `500 Internal Server Error` - Server error

**Business Rules:**
- Steps must be completed in order
- Cannot complete the same step twice
- Completing the final step awards an onboarding badge and 100 points

### 2. Get Onboarding Status

Retrieves the current onboarding status for a tutor.

**Endpoint:** `GET /api/onboarding/status/:tutorId`

**Path Parameters:**
- `tutorId` - The ID of the tutor (must be the authenticated user's ID unless admin)

**Response:**
```json
{
  "success": true,
  "status": {
    "completedSteps": ["welcome", "profile_setup"],
    "currentStep": "best_practices",
    "startedAt": "2024-01-20T10:00:00Z",
    "completedAt": null,
    "totalSteps": 5,
    "percentComplete": 40
  },
  "isComplete": false,
  "progress": {
    "currentStep": {
      "id": "best_practices",
      "title": "Best Practices Tutorial",
      "description": "Learn proven strategies for successful tutoring",
      "order": 3,
      "isCompleted": false
    },
    "completedSteps": 2,
    "totalSteps": 5,
    "percentComplete": 40,
    "estimatedTimeRemaining": 15
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Trying to access another tutor's status without admin privileges
- `500 Internal Server Error` - Server error

## Usage Examples

### JavaScript/Fetch

```javascript
// Complete a step
const completeStep = async (stepId) => {
  const response = await fetch('/api/onboarding/complete-step', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stepId })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};

// Get status
const getOnboardingStatus = async (tutorId) => {
  const response = await fetch(`/api/onboarding/status/${tutorId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
};
```

### cURL

```bash
# Complete a step
curl -X POST http://localhost:3000/api/onboarding/complete-step \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-auth-cookies>" \
  -d '{"stepId": "welcome"}'

# Get status
curl http://localhost:3000/api/onboarding/status/YOUR_TUTOR_ID \
  -H "Cookie: <your-auth-cookies>"
```

## Testing

Unit tests are available in `route.test.ts`. Run them with:

```bash
npm test app/api/onboarding/route.test.ts
```

For manual testing, use the `test-api.http` file with a REST client extension in VS Code. 