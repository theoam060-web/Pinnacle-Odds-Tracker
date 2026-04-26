# Google Sign-In Production Verification Report

**Date:** April 26, 2026  
**Production URL:** https://pinnacle-odds-tracker--theoam060.replit.app/app/  
**Task:** #39 — Manually verify Google sign-in works in production

---

## Verification Checklist

| Criterion | Status | Evidence |
|-----------|--------|---------|
| Auth screen renders at /app/ with "Continue with Google" | ✅ PASS | Screenshot: `attached_assets/screenshots/pinnacle-odds-tracker--theoam060_replit_app_app.png` |
| Clicking "Continue with Google" reaches Google OAuth | ✅ PASS | Curl confirmed 302 → `accounts.google.com/o/oauth2/v2/auth` with correct `client_id` and scopes |
| Google consent screen shows "SharpTracker" as app name | ❌ FAIL | Error 400: `redirect_uri_mismatch` before consent screen is ever shown |
| After authorizing, user redirected back to /app/ | ❌ BLOCKED | Cannot be tested — blocked by the above error |
| User lands on main feed or subscription gate | ❌ BLOCKED | Cannot be tested — blocked by the above error |
| No errors in production logs after OAuth redirect | ❌ BLOCKED | Cannot be tested — blocked by the above error |

---

## Critical Bug: `redirect_uri_mismatch` (Error 400)

**What happens:** When a user clicks "Continue with Google", they reach Google's OAuth page but see:
> "Access blocked: This app's request is invalid — Error 400: redirect_uri_mismatch"

**Screenshot:** `attached_assets/screenshots/google-oauth-error-redirect_uri_mismatch.jpeg`

**Root cause:** The OAuth callback URL being sent to Google:
```
https://pinnacle-odds-tracker--theoam060.replit.app/api/auth/google/callback
```
is **not registered** in the Google Cloud Console OAuth 2.0 credentials as an Authorized Redirect URI.

**Code reference:** `artifacts/api-server/src/routes/auth.ts` — `getCallbackUrl()` derives the URL from `REPLIT_DOMAINS` when `GOOGLE_CALLBACK_URL` is not set. The derived URL is correct but Google hasn't been told to allow it.

---

## Required Fix (Google Cloud Console — manual step)

1. Log in to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services → Credentials**
3. Open the **OAuth 2.0 Client ID** used by SharpTracker
4. Under **Authorized redirect URIs**, add:
   ```
   https://pinnacle-odds-tracker--theoam060.replit.app/api/auth/google/callback
   ```
5. Click **Save**

After saving, Google sign-in will work immediately — no code changes needed.

---

## Environment Verification

| Variable | Status |
|----------|--------|
| `GOOGLE_CLIENT_ID` | ✅ Configured (secret) |
| `GOOGLE_CLIENT_SECRET` | ✅ Configured (secret) |
| `SESSION_SECRET` | ✅ Configured (secret) |
| `GOOGLE_CALLBACK_URL` | Not set — derived dynamically from `REPLIT_DOMAINS` |

The OAuth flow code in `artifacts/api-server/src/routes/auth.ts` is correct. The only issue is the Google Cloud Console configuration.
