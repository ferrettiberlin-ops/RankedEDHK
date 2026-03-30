# Setup & Configuration Guide

## Quick Setup Checklist

This guide helps you get RankedEDHK running locally and deployed to Vercel.

## Part 1: Local Development Setup

### 1. Clone and Install

```bash
git clone git@github.com:ferrettiberlin-ops/RankedEDHK.git
cd RankedEDHK
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for project to be ready (green checkmark)
4. Go to Project Settings → API → Copy your credentials:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service role secret key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Setup Database Schema

1. In Supabase dashboard, go to SQL Editor → New Query
2. Copy the entire content from `scripts/DATABASE_SCHEMA.sql`
3. Paste into the editor and execute
4. Verify 5 tables are created: `universities`, `programs`, `users`, `reviews`, `auth.users`

### 4. Get Google Gemini API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create new API key
3. Copy and save securely

### 5. Setup Better-Auth

Better-Auth configuration requires:
- Better-Auth URL (for local: `http://localhost:3000`)
- Better-Auth Secret (generate a random string)

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Create .env.local File

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Supabase (from Step 2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Google Gemini (from Step 4)
GEMINI_API_KEY=AIzaSyD...

# Better-Auth (generate your own)
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Development
NODE_ENV=development
```

### 7. Run Local Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser. You should see the home page!

### 8. Populate Test Data

Option A: Run the scraper
```bash
npm run scrape
```

Option B: Manually insert data in Supabase:
1. Go to Supabase Dashboard → Table Editor → `programs`
2. Click "Insert Row" to add test programs
3. Fill in: name, code, university_id, description

### 9. Test Review Submission

1. Click on a university in the sidebar
2. Click on a program
3. Fill out the review form
4. Submit to test moderation and storage

---

## Part 2: Deploy to Vercel

### 1. Make Sure Code is Committed

```bash
git add -A
git commit -m "Add JUPAS review platform"
git push origin main
```

### 2. Connect GitHub to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select `RankedEDHK` repository
5. Vercel auto-detects Next.js ✅

### 3. Configure Environment Variables in Vercel

In Vercel dashboard:
1. Click "Add Environment Variables"
2. Add each variable with its value:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY         (Production only)
GEMINI_API_KEY
BETTER_AUTH_SECRET
BETTER_AUTH_URL                    (set to your Vercel domain)
CRON_SECRET                        (for scraping jobs)
NODE_ENV                           (set to production)
```

⚠️ **IMPORTANT**: Don't expose service role key to client. Mark it "Production Only".

### 4. Deploy

Click "Deploy" button - Vercel will:
- Build your Next.js app
- Deploy to a live URL
- Set up SSL/HTTPS automatically
- Create a production environment

### 5. Update BETTER_AUTH_URL

After deployment, update the BETTER_AUTH_URL:
1. Note your Vercel URL (e.g., `https://ranked-edhk.vercel.app`)
2. Update in Vercel Environment Variables
3. Redeploy

### 6. Setup Cron Jobs (Optional)

To auto-run the scraper daily:

1. Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/scrape",
      "schedule": "0 2 * * *"
    }
  ]
}
```

2. Commit and push
3. Vercel auto-enables scheduled functions

---

## Part 3: Connecting Better-Auth

Better-Auth provides authentication with email verification. Setup requires:

### 1. Install Better-Auth

```bash
npm install better-auth
```

### 2. Create Auth Configuration

Create `lib/auth.ts`:
```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: {
    // Supabase connection
  },
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async (user, url) => {
      // Send verification email via email provider
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000"
  ],
});
```

### 3. Create Auth API Route

Create `app/api/auth/[...auth]/route.ts`

### 4. Add Auth Provider

Wrap app in `AuthProvider` component

---

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

### Supabase Connection Issues

```bash
# Test connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('universities').select().then(r => console.log(r.data?.length, 'unis found'));
"
```

### Build Fails on Vercel

Check build logs:
1. Vercel Dashboard → Deployments → Failed Deployment
2. Click "Details" to see error
3. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Unsupported Node version

### Reviews Not Saving

1. Check Supabase RLS policies are enabled
2. Verify user is authenticated (`auth.uid()` exists)
3. Check Supabase audit logs for errors
4. Verify database schema matches `DATABASE_SCHEMA.sql`

### Gemini Moderation Failing

1. Check GEMINI_API_KEY is valid
2. Go to Google Cloud Console → check API quota
3. Ensure Generative Language API is enabled
4. Check rate limits (free tier: 60 requests/minute)

---

## Environment Variables Reference

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Supabase admin key | `eyJhbGc...` |
| `GEMINI_API_KEY` | Secret | Google Gemini API key | `AIzaSyD...` |
| `BETTER_AUTH_SECRET` | Secret | Auth secret (random) | `abc123...` |
| `BETTER_AUTH_URL` | Public | Auth callback URL | `http://localhost:3000` |
| `CRON_SECRET` | Secret | Cron job secret | `xyz789...` |
| `NODE_ENV` | Public | Environment | `development` or `production` |

**Public** = Safe to expose in frontend  
**Secret** = Never expose, only in `.env.local` or Vercel production

---

## Testing Checklist

- [ ] Home page loads
- [ ] Sidebar shows universities
- [ ] Click university expands programs
- [ ] Click program shows details
- [ ] Review form loads
- [ ] Can submit review
- [ ] Moderation check works
- [ ] Aggregated scores update
- [ ] Login/signup pages exist
- [ ] About page has info
- [ ] Universities page lists all 8 unis

---

## Performance Tips

1. **Database Queries**: Add indexes on frequently queried columns
2. **Caching**: Use `revalidateTag()` for ISR
3. **Image Optimization**: Use Next.js `<Image>` component
4. **Bundle Size**: Check with `npm run build` output
5. **Monitoring**: Setup Vercel Analytics dashboard

---

## Security Checklist

- [ ] `.env.local` in `.gitignore`
- [ ] Service role key only in production
- [ ] RLS policies enabled in Supabase
- [ ] Content Security Policy headers set
- [ ] HTTPS enforced (Vercel default)
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on forms
- [ ] CORS properly configured

---

Last Updated: March 2026
