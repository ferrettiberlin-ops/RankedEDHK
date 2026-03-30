# Vercel Deployment Setup

## Step 1: Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub account and repository
5. Click **"Import"**

## Step 2: Configure Environment Variables

Vercel auto-detects Next.js. Before deployment, add environment variables:

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable with these exact names:

| Variable | Value | Environment |
|----------|-------|-------------|
| `SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `NEXT_PUBLIC_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `ROLE_KEY` | Your Supabase service role key | **Production Only** ⚠️ |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | **Production Only** ⚠️ |
| `AUTH_SECRET` | Your auth secret | Production, Preview, Development |
| `BETTER_AUTH_SECRET` | Your auth secret | Production, Preview, Development |
| `BETTER_AUTH_URL` | `https://[your-domain].vercel.app` | Production Only |
| `HF_KEY` | Your Hugging Face API key | Production, Preview, Development |
| `HF_API_KEY` | Your Hugging Face API key | Production, Preview, Development |
| `NODE_ENV` | `production` | Production Only |

**Tip**: Copy values from GitHub Secrets you've already created.

## Step 3: Deploy

1. Click **"Deploy"** in Vercel
2. Wait for build to complete
3. Your app will be available at `https://[your-project].vercel.app`

## Step 4: Verify Deployment

- [ ] App loads at `https://[your-project].vercel.app`
- [ ] API routes respond correctly
- [ ] Moderation API works
- [ ] Database operations succeed

## Security Checklist

- [ ] `ROLE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` marked as **Production Only**
- [ ] `.env.local` is in `.gitignore` (never committed)
- [ ] No secrets visible in GitHub repository
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] CSP headers enabled (configured in `next.config.js`)

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Run `npm run build` locally to debug

### API Routes Return 500
- Check function logs in Vercel dashboard
- Verify API keys are correct in environment variables
- Test locally with `npm run dev`

### Database Connection Errors
- Verify `SUPABASE_URL` and `ANON_KEY` are correct
- Check Supabase project is running
- Ensure RLS policies allow operations

---

**Less common**: If you need to rollback, use Vercel's deployment history or redeploy from a previous commit.
