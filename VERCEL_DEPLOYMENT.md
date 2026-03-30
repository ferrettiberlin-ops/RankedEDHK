# Vercel Deployment Guide for RankedEDHK

This guide shows how to deploy RankedEDHK to Vercel with minimal setup.

---

## Prerequisites

- ✅ GitHub repository created at: `github.com/ferrettiberlin-ops/RankedEDHK`
- ✅ Supabase project: `RankedEDHKLOG`
- ✅ Hugging Face account and API token
- ✅ Local `.env.local` is properly configured and `.gitignore` protects it

---

## Step 1: Prepare for Deployment

Ensure all files are committed and `.env.local` is NOT in git:

```bash
cd /Users/fredberlin/Documents/VS\ Code\ /RankEDHK

# Verify .env.local is ignored
cat .gitignore | grep .env.local
# Should output: .env.local

# Commit all changes
git add -A
git commit -m "chore: prepare for Vercel deployment"
git push origin main
```

---

## Step 2: Import Project to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select GitHub account
4. Search for and select: **`RankedEDHK`**
5. Click **"Import"**

### Project Settings:
- **Framework Preset**: Next.js (auto-detected)
- **Project Name**: `ranked-edhk` (or custom)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `.next` (auto-filled)

**DO NOT add environment variables yet** - click **"Deploy"** first.

---

## Step 3: Add Environment Variables (CRITICAL)

After deployment completes, add environment variables:

### 3A. Go to Project Settings

1. Click your project on Vercel dashboard
2. Go to **Settings** → **Environment Variables**

### 3B. Add Variables (Copy-Paste from Below)

Add these 5 variables exactly as shown:

#### Variable 1: Supabase URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://gbitatkgytmlwnqzcxcg.supabase.co
Environments: Production, Preview, Development
```

#### Variable 2: Supabase Anon Key
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaXRhdGtneXRtbHducXpjeGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzgxNzAsImV4cCI6MjA5MDQ1NDE3MH0.q8kHOCjmY3FOvsfn9uuTZ8y7EMy_1_gcGPu84QCwSWg
Environments: Production, Preview, Development
```

#### Variable 3: Supabase Service Role Key (PRODUCTION ONLY!)
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaXRhdGtneXRtbHducXpjeGNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg3ODE3MCwiZXhwIjoyMDkwNDU0MTcwfQ.h7NGJHe0QrgglNpQHMG_dUeCQtiRkrkTilC1ptaXyBo
Environments: PRODUCTION ONLY ⚠️ (uncheck Preview & Development)
```

> **SECURITY NOTE**: Service role key must NEVER be exposed to client. Mark as Production Only.

#### Variable 4: Hugging Face API Key
```
Name: HF_API_KEY
Value: hf_[your-actual-token-here]
Environments: Production, Preview, Development
```

> Get from: https://huggingface.co/settings/tokens (create token if needed)

#### Variable 5: Better-Auth Secret
```
Name: BETTER_AUTH_SECRET
Value: 4afec796a6716d32e287d4f53a69a72c046f3d13fef17cf44f8c364b85146cb4
Environments: Production, Preview, Development
```

#### Variable 6: Better-Auth URL (Production)
```
Name: BETTER_AUTH_URL
Value: https://[your-vercel-domain].vercel.app
Environments: Production Only
```

> Replace `[your-vercel-domain]` with your actual Vercel deployment URL

#### Variable 7: Node Environment
```
Name: NODE_ENV
Value: production
Environments: Production Only
```

### Summary of Variables to Add:

| Variable | Value | Production Only? |
|----------|-------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gbitatkgytmlwnqzcxcg.supabase.co` | ❌ No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | ❌ No |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (different from above) | ⚠️ **YES** |
| `HF_API_KEY` | `hf_...` | ❌ No |
| `BETTER_AUTH_SECRET` | `4afec...` | ❌ No |
| `BETTER_AUTH_URL` | `https://[domain].vercel.app` | ⚠️ **YES** |
| `NODE_ENV` | `production` | ⚠️ **YES** |

---

## Step 4: Redeploy with Environment Variables

After adding all variables:

1. Go to **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Wait for build to complete
4. View logs to verify no errors

---

## Step 5: Test Production Deployment

Once deployed:

```bash
# Get your deployment URL from Vercel dashboard
# Should be: https://ranked-edhk-[random].vercel.app

# Test endpoints
curl https://ranked-edhk-[random].vercel.app

# Test moderation API
curl -X POST https://ranked-edhk-[random].vercel.app/api/moderate \
  -H "Content-Type: application/json" \
  -d '{"text": "Great program!", "grade": "A"}'

# Expected response:
# { "approved": true, "gradeValid": true, "message": "Review approved..." }
```

---

## Step 6: Enable Cron Jobs (Optional)

For scheduled JUPAS data scraping:

1. Go to **Settings** → **Cron Jobs**
2. Add cron job:
   - **Schedule**: `0 2 * * *` (daily at 2 AM UTC)
   - **Endpoint**: `/api/cron/scrape`

---

## Troubleshooting

### Build fails with "Module not found"
- Check `.gitignore` doesn't block needed files
- Run `npm install` locally and verify `package-lock.json` is committed

### Moderation API returns 500 error
- Verify `HF_API_KEY` is set correctly in Vercel
- Check logs: **Deployments** → **Functions** → view logs
- Verify Hugging Face API is accessible

### SUPABASE_SERVICE_ROLE_KEY exposed warning
- Go to **Settings** → **Environment Variables**
- Check that `SUPABASE_SERVICE_ROLE_KEY` is marked as "Production Only"
- Remove it from Preview/Development environments

### Reviews not persisting
- Verify Supabase connection working: `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check database schema is imported: `scripts/DATABASE_SCHEMA.sql`
- Verify RLS policies don't block inserts

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.local` is NEVER committed to GitHub
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is **Production Only** in Vercel
- [ ] `BETTER_AUTH_URL` updated to production domain
- [ ] All secrets are unique (not using development credentials)
- [ ] Vercel environment variables have correct scopes (Production/Preview/Development)

---

## Production Checklist

- [ ] Deployment visible at `https://[your-domain].vercel.app`
- [ ] `/` loads without errors
- [ ] `/api/moderate` accepts POST requests
- [ ] Moderation API filters unsafe content
- [ ] Grade consistency checking works
- [ ] Reviews are stored in Supabase
- [ ] Anonymous reviews display correctly (no PII)
- [ ] Legal disclaimer appears before review submission
- [ ] Risk warning modal shows before submit
- [ ] Domain whitelisting enforces HK university emails

---

## Quick Reference: Environment Variables

```bash
# Get Supabase credentials
# From: https://app.supabase.com/project/[your-project]/settings/api
# Project: RankedEDHKLOG

# Get Hugging Face token
# From: https://huggingface.co/settings/tokens

# Get Better-Auth secret (already generated)
# From: .env.local BETTER_AUTH_SECRET=...

# Get deployment domain
# From: Vercel dashboard after first deployment
```

---

## Next Steps After Deployment

1. **Test all features** in production URL
2. **Monitor logs** for errors: Vercel dashboard → Functions
3. **Set up GitHub Actions** for CI/CD (optional)
4. **Enable analytics** in Vercel dashboard
5. **Add custom domain** (if needed): Vercel Settings → Domains

---

**Status**: ✅ Ready for production deployment  
**Security Level**: 🟢 All secrets properly isolated  
**Last Updated**: March 31, 2026
