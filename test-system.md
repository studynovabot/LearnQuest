# System Testing Checklist

## 🚀 Testing Guide for NCERT Solutions & Admin Upload System

### ✅ Prerequisites
1. **Firebase Setup**: Ensure Firebase Admin SDK is configured with proper service account key
2. **Environment Variables**: Check that all required env vars are set in Vercel/local
3. **Authentication**: Test user login/register flow works correctly

### 🧪 Testing Steps

#### 1. Test Authentication & Profile Update
- [ ] Register a new user account
- [ ] Login with valid credentials
- [ ] Navigate to Settings page
- [ ] Update profile information (name, class, board)
- [ ] Verify no 401 errors in console
- [ ] Check that changes are saved successfully

#### 2. Test NCERT Solutions Access Control
- [ ] Login as FREE user
- [ ] Navigate to `/ncert-solutions`
- [ ] Verify access denied message with upgrade CTA
- [ ] Logout and login as PRO/GOAT user
- [ ] Navigate to `/ncert-solutions` 
- [ ] Verify solutions are accessible

#### 3. Test Admin PDF Upload Flow (Admin Only)
- [ ] Login as admin user
- [ ] Navigate to Dashboard → Admin tab
- [ ] Click "PDF Upload" to go to `/admin-pdf-upload`
- [ ] Upload a sample PDF file
- [ ] Fill metadata: board, class, subject, chapter
- [ ] Submit and verify processing starts
- [ ] Check console for AI Q&A extraction logs
- [ ] Wait for processing to complete

#### 4. Test Admin PDF Review Flow (Admin Only)
- [ ] Navigate to `/admin-pdf-review`
- [ ] Verify pending reviews list shows uploaded PDF
- [ ] Click "Review" on a processed PDF
- [ ] Edit Q&A pairs in inline editor
- [ ] Approve the content
- [ ] Verify it gets uploaded to Firebase

#### 5. Test NCERT Solutions Content
- [ ] Login as PRO user
- [ ] Navigate to `/ncert-solutions`
- [ ] Search for uploaded content by board/class/subject
- [ ] Click "View Solution" on a solution
- [ ] Verify Q&A pairs display correctly
- [ ] Test "Get AI Help" feature
- [ ] Verify AI response is generated

#### 6. Test API Endpoints
- [ ] Test `/api/ncert-solutions` returns valid JSON
- [ ] Test `/api/ncert-solutions/{id}/content` with auth token
- [ ] Test `/api/user-profile` PUT with valid token
- [ ] Test `/api/admin-pdf-upload` POST with admin token
- [ ] Verify all endpoints return JSON (not HTML) for errors

### 🔧 Common Issues & Fixes

#### NCERT Solutions JSON Parse Error
**Problem**: `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
**Fix**: 
- Check Vercel routing in `vercel.json` points to correct API file
- Ensure API returns JSON for all responses, including errors
- Verify content-type headers are set correctly

#### 401 Authentication Error
**Problem**: `401 Unauthorized` on profile updates
**Fix**:
- Check token is stored in localStorage after login
- Verify Authorization header is sent with requests
- Check JWT token verification in backend APIs

#### Admin Access Issues
**Problem**: Admin functions not visible or accessible
**Fix**:
- Verify user role is set to 'admin' in database
- Check isAdmin logic in useAuth hook
- Ensure AdminRoute component works correctly

### 🛠️ API Testing with curl

Test NCERT Solutions API:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     https://your-vercel-domain.vercel.app/api/ncert-solutions
```

Test Profile Update:
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"displayName":"Test User","className":"10","board":"CBSE"}' \
     https://your-vercel-domain.vercel.app/api/user-profile
```

### 📊 Expected Results

- ✅ All API endpoints return valid JSON
- ✅ Authentication works without 401 errors
- ✅ Free users see upgrade prompts for premium content
- ✅ Pro/Goat users can access NCERT solutions
- ✅ Admin users can upload PDFs and review Q&A pairs
- ✅ Q&A pairs are extracted using AI and stored correctly
- ✅ Frontend displays error messages gracefully
- ✅ No HTML error pages returned from APIs

### 🚨 Red Flags

- ❌ HTML pages returned instead of JSON from APIs
- ❌ 401/403 errors on authenticated requests
- ❌ Admin functions visible to non-admin users
- ❌ PDF processing fails or doesn't extract Q&A
- ❌ Database writes fail or permissions issues
- ❌ AI services return errors or timeout