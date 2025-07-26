#!/bin/bash

echo "Checking Netlify deployment status..."
echo ""

# Check if the site is responding
echo "1. Testing site availability:"
curl -s -o /dev/null -w "%{http_code}" https://nerdy-tutor-dashboard.netlify.app/
echo ""

# Check API endpoints
echo "2. Testing API endpoints:"
echo "   - Simple check: $(curl -s https://nerdy-tutor-dashboard.netlify.app/api/simple-check | jq -r '.hasUrl, .hasKey' 2>/dev/null | tr '\n' ' ')"
echo ""

# Check for the error
echo "3. Testing for 'document is not defined' error:"
curl -s https://nerdy-tutor-dashboard.netlify.app/ | grep -q "document is not defined"
if [ $? -eq 0 ]; then
    echo "   ❌ ERROR STILL PRESENT - Cache not cleared"
else
    echo "   ✅ Error not found - Cache might be cleared"
fi
echo ""

# Test login
echo "4. Testing login endpoint:"
response=$(curl -s -X POST https://nerdy-tutor-dashboard.netlify.app/api/test-auth-flow \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah_chen@hotmail.com","password":"demo123"}')
echo "   Response: $(echo $response | jq -r '.success' 2>/dev/null || echo 'Failed')"
echo ""

echo "Deploy should be ready in ~2-3 minutes after push."
echo "Check: https://app.netlify.com/sites/nerdy-tutor-dashboard/deploys" 