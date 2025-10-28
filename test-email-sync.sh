#!/bin/bash

# Email Sync Testing Script
# This script helps test and diagnose email sync issues

echo "🔍 CV-Express Email Sync Diagnostic Tool"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:5001"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

echo -e "${BLUE}1. Testing Backend Server Connection...${NC}"
if curl -s -f "$API_URL/api/auth/login" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${RED}❌ Backend server is not responding${NC}"
    echo "Please start the backend server with: npm run dev"
    exit 1
fi

echo -e "\n${BLUE}2. Creating Test User...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"Test User\", \"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Test user created successfully${NC}"
elif echo "$REGISTER_RESPONSE" | grep -q "already exists"; then
    echo -e "${YELLOW}⚠️  Test user already exists${NC}"
else
    echo -e "${RED}❌ Failed to create test user: $REGISTER_RESPONSE${NC}"
    exit 1
fi

echo -e "\n${BLUE}3. Logging in to get JWT token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Successfully logged in${NC}"
    echo -e "${BLUE}Token: ${TOKEN:0:50}...${NC}"
else
    echo -e "${RED}❌ Login failed: $LOGIN_RESPONSE${NC}"
    exit 1
fi

echo -e "\n${BLUE}4. Running Email Connection Diagnosis...${NC}"
DIAGNOSIS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/email-oauth/diagnose")

echo -e "${YELLOW}Diagnosis Results:${NC}"
echo "$DIAGNOSIS_RESPONSE" | jq '.' 2>/dev/null || echo "$DIAGNOSIS_RESPONSE"

echo -e "\n${BLUE}5. Testing Email Sync...${NC}"
SYNC_RESPONSE=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" "$API_URL/api/email-oauth/sync")

echo -e "${YELLOW}Sync Response:${NC}"
echo "$SYNC_RESPONSE" | jq '.' 2>/dev/null || echo "$SYNC_RESPONSE"

echo -e "\n${BLUE}6. Environment Check...${NC}"
echo -e "${YELLOW}Checking OAuth configuration:${NC}"

# Check if backend is running and can access env vars
ENV_CHECK=$(curl -s "$API_URL/api/email-oauth/diagnose" -H "Authorization: Bearer $TOKEN")
if echo "$ENV_CHECK" | grep -q "OAuth credentials not configured"; then
    echo -e "${RED}❌ OAuth credentials are not properly configured${NC}"
    echo -e "${YELLOW}Please check your .env file and ensure you have:${NC}"
    echo "  - GOOGLE_CLIENT_ID"
    echo "  - GOOGLE_CLIENT_SECRET" 
    echo "  - MICROSOFT_CLIENT_ID"
    echo "  - MICROSOFT_CLIENT_SECRET"
    echo "  - ENCRYPTION_KEY"
else
    echo -e "${GREEN}✅ OAuth credentials appear to be configured${NC}"
fi

echo -e "\n${BLUE}7. Recommendations:${NC}"
if echo "$DIAGNOSIS_RESPONSE" | grep -q "Email account not connected"; then
    echo -e "${YELLOW}📧 To fix email sync:${NC}"
    echo "  1. Go to http://localhost:3000/onboarding"
    echo "  2. Connect your Gmail or Outlook account"
    echo "  3. Complete the OAuth flow"
    echo "  4. Try syncing again"
fi

if echo "$DIAGNOSIS_RESPONSE" | grep -q "OAuth credentials not configured"; then
    echo -e "${YELLOW}🔑 To configure OAuth:${NC}"
    echo "  1. Follow the guide in EMAIL_OAUTH_SETUP.md"
    echo "  2. Set up Google/Microsoft OAuth applications"
    echo "  3. Update your .env file with real credentials"
    echo "  4. Restart the backend server"
fi

echo -e "\n${GREEN}🎉 Diagnostic complete!${NC}"
echo -e "${BLUE}For more help, see: EMAIL_SYNC_TROUBLESHOOTING.md${NC}"
