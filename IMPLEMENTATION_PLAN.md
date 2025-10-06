# React Native Authentication System Implementation Plan

## Overview
Recreate the secure multi-step authentication system from `lustless-admin` in `lustless-rn` (React Native/Expo). This includes a two-factor login flow and a three-step signup process with identity verification.

---

## Phase 1: Core Infrastructure Setup

### 1.1 API Service Layer (`src/services/api/`)
- **Base HTTP client** with token refresh logic
- **Type definitions** for all API requests/responses
- **Service hooks** for each endpoint:
  - `useAuthInitiateLogin`, `useAuthVerifyLogin`
  - `useAuthSignupStep1`, `useAuthIdentityVerify`
  - `useAuthPhoneInitiate`, `useAuthPhoneVerify`
  - `useAuthMe`, `useAuthVerificationStatus`
  - `useFileUpload`
- **Error handling** with HTTP status codes
- **Token storage** using `@react-native-async-storage/async-storage`

### 1.2 Auth Context Provider (`src/contexts/AuthContext.tsx`)
- **State management**: user, tokens, verification status
- **Actions**: setUser, logout, refreshVerificationStatus
- **Token refresh** on app launch and when expired
- **Auto-redirect** based on verification status

### 1.3 Type System (`src/types/`)
- User, Tokens, VerificationStatus types
- API request/response interfaces
- Verification step enum: EMAIL_VERIFIED, IDENTITY_VERIFIED, FULLY_VERIFIED

---

## Phase 2: Authentication Screens

### 2.1 Sign-In Screen (`app/(auth)/sign-in.tsx`)
**Flow**: Credentials → OTP (if verified) → Dashboard

**Components**:
1. **Credentials Form**
   - Email input (validated)
   - Password input (min 6 chars)
   - "Forgot Password" link
   - Submit button

2. **OTP Input Screen** (if user is fully verified)
   - Custom 6-digit OTP component
   - Auto-submit on completion
   - Resend OTP button
   - Back button

**Logic**:
- Call `initiateLogin` with email/password
- If `skipOtp === true`: redirect to continue signup
- If OTP required: show OTP screen, then call `verifyLogin`
- Store tokens and user in context
- Navigate based on verification status

### 2.2 Sign-Up Flow (`app/(auth)/sign-up/`)
**Structure**: Multi-step wizard with progress indicator

#### Step 1: Account Creation (`step1.tsx`)
- Email input (unique validation)
- Password input (min 6 chars)
- Privacy policy checkbox
- Call `/v1/auth/signup/step1`
- Store tokens, navigate to Step 2

#### Step 2: Identity Verification (`step2.tsx`)
- **ID Document Upload**
  - Camera capture or photo library
  - Image compression
  - Upload to `/v1/files` → get file ID

- **Selfie Upload**
  - Camera-only capture
  - Face detection preview (optional)
  - Circular crop/guide
  - Upload to `/v1/files` → get file ID

- **Verification**
  - Call `/v1/auth/identity/verify` with both file IDs
  - Show similarity score and extracted name
  - Handle 3 attempt limit
  - Navigate to Step 3 on success

#### Step 3: Phone Verification (`step3.tsx`)
- Phone number input (+1XXXXXXXXXX format)
- Call `/v1/auth/phone/initiate`
- 6-digit OTP input
- Call `/v1/auth/phone/verify`
- Redirect to dashboard on success

### 2.3 Onboarding Wrapper (`app/(auth)/sign-up/_layout.tsx`)
- **Progress Bar** (1/3, 2/3, 3/3)
- **Step Labels** (Account, Identity, Phone)
- **Resume Logic**: Check `verificationStatus` to start at correct step
- **Navigation Guards**: Prevent skipping steps

---

## Phase 3: Reusable Components

### 3.1 OTP Input (`src/components/OTPInput.tsx`)
- 6 individual boxes styled with focus states
- Auto-focus next box on digit entry
- Backspace to previous box
- Paste support (auto-fill all boxes)
- Error state styling
- Auto-submit callback when complete

### 3.2 Image Picker (`src/components/ImagePicker.tsx`)
- **Modes**: Camera only, Library only, Both
- **Props**: aspectRatio, quality, allowsEditing
- Uses `expo-image-picker`
- Upload to API and return FileEntity
- Loading state with progress
- Error handling

### 3.3 Image Cropper (`src/components/ImageCropper.tsx`)
- Circular crop for selfie (1:1 aspect ratio)
- Rectangular crop for ID document
- Uses `react-native-image-crop-picker` or built-in editing
- Preview with crop overlay

### 3.4 Form Components
- `TextInput` with validation
- `PhoneInput` with country code (+1 only)
- `PasswordInput` with show/hide toggle
- `Checkbox` for privacy policy

---

## Phase 4: Navigation & Guards

### 4.1 Auth Stack (`app/(auth)/_layout.tsx`)
- Sign-in, Sign-up (steps 1-3)
- Forgot Password, Reset Password
- No header, custom back buttons

### 4.2 Protected Routes
- **requireAuth HOC**: Check tokens exist
- **requireVerified HOC**: Check FULLY_VERIFIED status
- **requireGuest HOC**: Redirect if authenticated

### 4.3 Deep Linking
- Handle OTP from SMS (auto-fill)
- Email confirmation links
- Password reset links

---

## Phase 5: Polish & Features

### 5.1 Verification Status Badge
- Show current step in profile/settings
- Visual indicator (email ✓, ID ✓, phone ✓)

### 5.2 Error Handling
- Network errors with retry
- Validation errors inline
- Server errors with user-friendly messages
- Rate limiting for OTP resend (60s cooldown)

### 5.3 Loading States
- Skeleton screens for auth check
- Button loading spinners
- Upload progress bars
- Blur/dim during async operations

### 5.4 Accessibility
- Screen reader labels
- Keyboard navigation
- Focus management
- High contrast support

---

## Phase 6: Testing Strategy

### 6.1 API Integration Tests
- Mock API responses
- Test token refresh logic
- Test error scenarios

### 6.2 Component Tests
- OTP input behavior
- Form validation
- Navigation flow

### 6.3 E2E Tests
- Complete signup flow (+19546141057)
- Login with OTP (admin@example.com / secret)
- Resume partial signup

---

## Key Dependencies
```json
{
  "@react-native-async-storage/async-storage": "^1.x",
  "expo-image-picker": "~15.x",
  "react-hook-form": "^7.x",
  "axios": "^1.x",
  "@tanstack/react-query": "^5.x",
  "react-native-keyboard-aware-scroll-view": "^0.9.x"
}
```

---

## File Structure
```
lustless-rn/
├── app/
│   ├── (auth)/
│   │   ├── sign-in.tsx
│   │   ├── sign-up/
│   │   │   ├── _layout.tsx
│   │   │   ├── step1.tsx
│   │   │   ├── step2.tsx
│   │   │   └── step3.tsx
│   ├── (tabs)/           # Protected routes
│   └── _layout.tsx       # Root with AuthProvider
├── src/
│   ├── components/
│   │   ├── OTPInput.tsx
│   │   ├── ImagePicker.tsx
│   │   ├── ImageCropper.tsx
│   │   └── forms/
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── api/
│   │       ├── client.ts
│   │       ├── auth.ts
│   │       └── files.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── tokens.ts
│   │   └── api.ts
│   └── utils/
│       ├── storage.ts
│       └── validation.ts
```

---

## Implementation Order
1. ✅ API client + auth services
2. ✅ Auth context + token storage
3. ✅ Sign-in screen (credentials only)
4. ✅ OTP input component
5. ✅ Sign-in OTP flow
6. ✅ Signup step 1 (email/password)
7. ✅ Image picker component
8. ✅ Signup step 2 (identity verification)
9. ✅ Signup step 3 (phone verification)
10. ✅ Navigation guards
11. ✅ Polish + error handling

---

## Backend Integration Details

### Base URL
```
https://lustless-server.nomadsoft.us
```

### Key Endpoints
- POST `/v1/auth/email/login/initiate` - Start login, get OTP
- POST `/v1/auth/email/login/verify` - Verify OTP, get tokens
- POST `/v1/auth/signup/step1` - Create account with email/password
- GET `/v1/auth/verification/status` - Check current verification step
- POST `/v1/auth/identity/verify` - Submit ID + selfie for verification
- POST `/v1/auth/phone/initiate` - Send phone OTP
- POST `/v1/auth/phone/verify` - Verify phone OTP
- GET `/v1/auth/me` - Get current user
- POST `/v1/auth/refresh` - Refresh access token
- POST `/v1/files` - Upload files (multipart/form-data)

### Authentication Flow

#### Login Flow (Fully Verified Users)
1. User enters email/password
2. Call `initiateLogin` → receives `temporaryToken`
3. OTP sent via SMS to user's phone
4. User enters 6-digit OTP
5. Call `verifyLogin` → receives JWT tokens + user object
6. Store tokens, navigate to dashboard

#### Login Flow (Partially Verified Users)
1. User enters email/password
2. Call `initiateLogin` → receives `skipOtp: true` + full login tokens
3. Store tokens, navigate to sign-up flow to complete verification
4. User completes remaining steps (identity/phone)

#### Signup Flow
1. **Step 1**: Email/password → Creates account, returns tokens
   - User status: `EMAIL_VERIFIED`
   - Can now make authenticated requests

2. **Step 2**: ID document + selfie → AWS Rekognition/Textract
   - Face similarity must be ≥95%
   - Extracts first/last name from ID
   - Maximum 3 attempts
   - User status: `IDENTITY_VERIFIED`

3. **Step 3**: Phone verification → SMS OTP
   - 6-digit code sent via Twilio
   - 20-minute expiration
   - 60-second cooldown between resends
   - User status: `FULLY_VERIFIED` + `ACTIVE`

### Token Management
- **Access Token**: JWT, expires in 15 minutes
- **Refresh Token**: JWT, expires in 7 days
- **Storage**: AsyncStorage with secure flag
- **Refresh Strategy**: Auto-refresh when access token expires
- **Logout**: Clear tokens + invalidate session on server

### Verification Steps Enum
```typescript
enum VerificationStepEnum {
  EMAIL_VERIFIED = 'email_verified',
  IDENTITY_VERIFIED = 'identity_verified',
  FULLY_VERIFIED = 'fully_verified'
}
```

### Error Codes
- `422 UNPROCESSABLE_ENTITY`: Validation errors (see `errors` object)
- `401 UNAUTHORIZED`: Invalid/expired token
- `404 NOT_FOUND`: Resource not found
- `429 TOO_MANY_REQUESTS`: Rate limit exceeded

### Test Credentials
- **Admin Account**: `admin@example.com` / `secret`
- **Test Phone**: `+19546141057`
- **API Docs**: `https://lustless-server.nomadsoft.us/docs`
- **API JSON**: `https://lustless-server.nomadsoft.us/docs-json`

---

## Security Considerations

### OTP Security
- 6-digit numeric code (100,000 to 999,999)
- Hashed with bcrypt before storage
- 20-minute expiration
- Single-use (marked as `used` after verification)
- Rate limiting: 60-second cooldown between requests

### Token Security
- JWTs signed with HS256
- Access token includes: userId, roleId, sessionId
- Refresh token includes: sessionId, hash
- Session hash rotates on every refresh
- All user sessions invalidated on password change

### Identity Verification Security
- Files uploaded to AWS S3 with presigned URLs
- Face comparison via AWS Rekognition (95% threshold)
- Document parsing via AWS Textract
- 3-attempt limit per user
- Documents stored as FileEntity references on User model

### HTTPS Only
- All API calls must use HTTPS
- Certificate pinning recommended for production

---

## Notes
- Backend runs at `https://lustless-server.nomadsoft.us/`
- Production backend is live - no local setup needed
- Swagger docs available at `/docs`
- OTP codes expire in 20 minutes
- Identity verification requires 95%+ face match
- Maximum 3 identity verification attempts
- Phone verification uses Twilio SMS
- Images uploaded to AWS S3
- Face verification uses AWS Rekognition
- ID parsing uses AWS Textract
