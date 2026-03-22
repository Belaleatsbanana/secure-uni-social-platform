# SafeCampus Frontend Security Tests

## 1. Route protection
- Try opening `/home` without login
- Expected: redirected to `/`

## 2. Back navigation after logout
- Login, then logout
- Press browser back button
- Expected: user cannot access protected page

## 3. Unauthorized API response
- Simulate invalid token
- Expected: user is logged out automatically

## 4. Blank post blocking
- Try posting only spaces
- Expected: post is not submitted

## 5. Post sanitization
- Try posting text containing `<script>` or angle brackets
- Expected: dangerous characters are removed before sending

## 6. Large image blocking
- Try uploading an image larger than 5MB
- Expected: upload is rejected with alert

## 7. Role-based ad control
- Login as normal user
- Expected: "Create Ad" is hidden
- Login as admin
- Expected: "Create Ad" is visible

## 8. Owner-only post controls
- View your own post
- Expected: edit/delete icons are visible
- View another user's post
- Expected: edit/delete icons are hidden

## 9. Strong password validation
- Try weak password like `123456`
- Expected: rejected
- Try strong password like `Campus123A`
- Expected: accepted