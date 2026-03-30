# Deployment Checklist

Complete this checklist before deploying to production.

## Pre-Deployment (Local Testing)

- [ ] Run `npm run build` - no errors
- [ ] Run `npm run dev` - loads on localhost:3000
- [ ] Test all pages load:
  - [ ] Home page
  - [ ] About page
  - [ ] Universities page
  - [ ] Login page
  - [ ] Signup page
- [ ] Test sidebar functionality:
  - [ ] Universities expand/collapse
  - [ ] Programs load
  - [ ] Program details display
- [ ] Test review submission:
  - [ ] Form validation works
  - [ ] Review submits successfully
  - [ ] Moderation check runs
  - [ ] Review appears in list
- [ ] Test aggregated scores:
  - [ ] Scores calculate correctly
  - [ ] Letter grades display
  - [ ] Review count accurate
- [ ] Verify environment variables:
  - [ ] `.env.local` has all required keys
  - [ ] No console errors with missing env vars
  - [ ] Supabase connection works
  - [ ] Gemini API responds

## Supabase Verification

- [ ] Database schema created via SQL script
- [ ] All 5 tables exist:
  - [ ] universities (8 records)
  - [ ] programs (populated via scraper)
  - [ ] users (empty)
  - [ ] reviews (empty)
  - [ ] (Supabase auth table)
- [ ] RLS policies enabled:
  - [ ] `universities` - public read
  - [ ] `programs` - public read
  - [ ] `users` - own profile only
  - [ ] `reviews` - read all, write verified users only
- [ ] Indexes created for performance:
  - [ ] programs.university_id
  - [ ] reviews.program_id
  - [ ] users.email_verified

## GitHub Preparation

- [ ] `.env.local` in `.gitignore`
- [ ] No credentials committed
- [ ] No large files (> 100MB)
- [ ] All code formatted properly
- [ ] No console.error() or console.log() in production code
- [ ] Latest code pushed to main branch

```bash
# Verify nothing sensitive is committed
git log -p --all -S "sk-" | head -20  # Check for keys
grep -r "password" --include="*.ts" --include="*.tsx" src/ | grep -v "//"
```

## Vercel Setup

- [ ] GitHub account connected to Vercel
- [ ] RankedEDHK repository imported
- [ ] Project selected Next.js (auto-detected)
- [ ] Build command: `next build` (default)
- [ ] Start command: `next start` (default)
- [ ] Node.js version compatible (14+)

## Environment Variables in Vercel

Add these to Vercel Project Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` (Production)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (Production Only) ⚠️
- [ ] `GEMINI_API_KEY` (Production)
- [ ] `BETTER_AUTH_SECRET` (Production)
- [ ] `BETTER_AUTH_URL` (Production, after deployment)
- [ ] `CRON_SECRET` (Production)
- [ ] `NODE_ENV=production` (Production)

**Important**: Service role key should be marked "Production Only"

## First Deployment

- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete (5-10 mins)
- [ ] Build succeeds without errors ✅
- [ ] Deployment gets unique URL
- [ ] Note the URL (e.g., `https://ranked-edhk.vercel.app`)

## Post-Deployment Testing

Visit your live URL:

- [ ] Home page loads
- [ ] Navigation works
- [ ] Sidebar loads universities
- [ ] Can select programs
- [ ] Review form displays
- [ ] Can submit test review
- [ ] Reviews persist (reload page)
- [ ] Aggregated scores calculate
- [ ] No console errors (Ctrl+Shift+J)

Check Vercel:

- [ ] Deployments tab shows green ✅
- [ ] Analytics dashboard available
- [ ] Logs show successful requests
- [ ] No serverless function errors

## Update Authentication URL

After deployment, update BETTER_AUTH_URL:

1. Note your Vercel URL
2. Vercel Project Settings → Environment Variables
3. Update `BETTER_AUTH_URL` to your live URL
4. Click "Save"
5. Deployment auto-restarts with new URL

## Setup Cron Jobs (Optional)

For automatic daily scraping:

1. Ensure `vercel.json` exists with:
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

2. Commit and push to GitHub
3. Vercel redeploys and enables cron
4. Check "Crons" section in Vercel dashboard

## Domain Setup (Optional)

To use custom domain:

1. Vercel Dashboard → Project Settings → Domains
2. Add your domain (e.g., rankedhk.com)
3. Follow DNS configuration steps
4. Wait for verification (usually instant)
5. SSL certificate auto-issued

## Monitoring & Maintenance

### Daily

- [ ] Check Vercel deployments for errors
- [ ] Monitor Gemini API quota
- [ ] Review user feedback

### Weekly

- [ ] Check Supabase query logs
- [ ] Monitor database size
- [ ] Verify automated scraper ran

### Monthly

- [ ] Backup Supabase data
- [ ] Review security audit logs
- [ ] Check rate limiting effectiveness
- [ ] Update dependencies: `npm outdated`

## Rollback Plan

If something breaks in production:

1. Revert broken commit:
```bash
git revert <commit-hash>
git push
```

2. Vercel auto-redeploys from main
3. Monitor until status shows green ✅
4. Check live site again

## Emergency Procedures

### Database is Down
- Vercel apps stay up (serverless)
- Graceful error messages shown
- Manual Supabase restore from backup

### API Key Compromised
1. Regenerate in original service (Google, Supabase)
2. Update in Vercel Environment Variables
3. Manual redeploy or wait for auto-rebuild
4. Verify old key no longer works

### Excessive Rate Limiting
- Check if scraper is running too often
- Adjust cron schedule in `vercel.json`
- Implement exponential backoff in scraper

## Documentation

- [ ] README.md updated with correct URLs
- [ ] SETUP_GUIDE.md matches actual setup
- [ ] API documentation complete
- [ ] Schema diagram available

## Success Criteria ✅

- [x] Code deployed to live URL
- [x] Home page accessible
- [x] All pages render correctly
- [x] Database connected
- [x] Reviews can be submitted
- [x] No critical errors in logs
- [x] Sub-2 second page load time
- [x] HTTPS enforced
- [x] Monitoring active

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Live URL**: ___________  
**Status**: [ ] Success [ ] Needs Fix [ ] Rolled Back  

**Notes**: 

---

Last Updated: March 2026
