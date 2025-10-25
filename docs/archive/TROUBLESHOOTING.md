# Troubleshooting Guide

## Issue: Getting 500 Errors

### Common Causes

1. **Duplicate Files**: Files with names like `+server 2.ts` (with spaces)
2. **Missing Authentication**: Trying to access protected routes without login
3. **Database Issues**: Database not initialized or wrong path
4. **Port Conflicts**: Port 5173 already in use

---

## Solutions

### 1. Remove Duplicate Files

**Problem**: You see error "Files prefixed with + are reserved (saw src/routes/api/pages/+server 2.ts)"

**Solution**:
```bash
# Find duplicate files
find src/routes -name "* 2.ts" -o -name "*2.ts"

# Remove them
rm "src/routes/api/pages/+server 2.ts"
```

✅ **FIXED** - This duplicate file has been removed!

---

### 2. Authentication Errors (401/500)

**Problem**: Getting 401 or 500 errors when accessing `/api/pages` or `/api/media`

**Cause**: These endpoints require authentication but you're not logged in.

**Solution**:

**Option A: Login via Admin Panel**
1. Visit: `http://localhost:5174/admin/login`
2. Login with: `admin@linebasis.com` / `admin123`
3. The admin panel stores the token in localStorage
4. Now API calls from the admin panel will work

**Option B: Get Token via API**
```bash
# Login and get token
curl -X POST http://localhost:5174/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@linebasis.com","password":"admin123"}'

# Response will include accessToken
# Use it in subsequent requests:

curl http://localhost:5174/api/pages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 3. Database Not Found

**Problem**: "Cannot find database" or "ENOENT: no such file or directory"

**Solution**:
```bash
# Re-run setup
npm run setup

# Or manually:
npx prisma migrate dev
npx prisma generate
npx tsx scripts/setup-admin.ts
```

---

### 4. Port Already in Use

**Problem**: "Port 5173 is in use"

**Solution**:
```bash
# Find process using port 5173
lsof -ti:5173

# Kill it (optional)
kill $(lsof -ti:5173)

# Or just use the alternate port Vite assigns (e.g., 5174)
```

Current server is running on: **http://localhost:5174**

---

## Testing the Setup

### 1. Test Public Routes (Should Work)

```bash
# Designer homepage (should load)
curl http://localhost:5174/

# Login page (should load)
curl http://localhost:5174/admin/login
```

### 2. Test Auth (Should Work)

```bash
# Register new user
curl -X POST http://localhost:5174/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:5174/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@linebasis.com",
    "password": "admin123"
  }'
```

### 3. Test Protected Routes (Requires Token)

```bash
# First, login and save token
TOKEN=$(curl -s -X POST http://localhost:5174/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@linebasis.com","password":"admin123"}' \
  | grep -o '"accessToken":"[^"]*' \
  | cut -d'"' -f4)

# Test protected endpoint
curl http://localhost:5174/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# List pages
curl http://localhost:5174/api/pages \
  -H "Authorization: Bearer $TOKEN"
```

---

## Understanding 500 vs 401 Errors

### 401 Unauthorized
- **Cause**: No token provided or invalid token
- **Solution**: Login and use the access token

### 500 Internal Server Error
- **Possible causes**:
  1. Database connection issue
  2. Missing environment variables
  3. Code error (check server logs)
  4. Duplicate route files

### How to Debug

**Check server logs**:
```bash
# The dev server shows logs in the terminal
# Look for error messages after the "ready" message
```

**Check database connection**:
```bash
npx prisma studio
# Opens at http://localhost:5555
# You should see User, Page, Media, Session, etc.
```

**Check environment**:
```bash
cat .env
# Should have DATABASE_URL and JWT_SECRET
```

---

## Current Status

✅ **Duplicate file removed** - No more "+server 2.ts" error
✅ **Database created** - prisma/dev.db exists (124KB)
✅ **Admin user created** - admin@linebasis.com exists
✅ **Server running** - http://localhost:5174
✅ **All tests passing** - 44/44 tests pass

---

## Quick Fix Checklist

- [ ] Removed duplicate files (✅ DONE)
- [ ] Database exists and has admin user (✅ DONE)
- [ ] .env file configured (✅ DONE)
- [ ] Server is running (✅ DONE on port 5174)
- [ ] Login via admin panel works
- [ ] Can access protected routes with token

---

## If Still Getting Errors

1. **Stop the dev server** (Ctrl+C)
2. **Check for any error messages** in the terminal
3. **Restart the server**: `npm run dev`
4. **Try logging in** via admin panel: http://localhost:5174/admin/login
5. **Check browser console** for JavaScript errors
6. **Check network tab** to see the actual error response

---

## Contact / Debug Info

If you're still having issues, share:
1. The exact error message
2. Which URL you're accessing
3. Server terminal output
4. Browser console errors (if accessing via browser)

---

## Working URLs

✅ **Public Routes** (no auth needed):
- http://localhost:5174/ - Designer homepage
- http://localhost:5174/admin/login - Login page

✅ **Auth Routes** (no prior auth needed):
- POST http://localhost:5174/api/auth/login
- POST http://localhost:5174/api/auth/register

🔒 **Protected Routes** (need token):
- GET http://localhost:5174/api/auth/me
- GET http://localhost:5174/api/pages
- POST http://localhost:5174/api/pages
- POST http://localhost:5174/api/media/upload
- GET http://localhost:5174/api/media
- http://localhost:5174/admin - Admin dashboard

---

**Last Updated**: Phase 1.5 Complete
**Server Port**: 5174 (5173 was in use)
**Database**: SQLite at prisma/dev.db
**Admin**: admin@linebasis.com / admin123
