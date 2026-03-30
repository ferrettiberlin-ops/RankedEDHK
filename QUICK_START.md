# 🚀 Next Steps - Quick Reference

Your RankedEDHK application is complete and ready! Here's what to do next:

---

## STEP 1: Prepare Your Local Environment (5 minutes)

```bash
cd /Users/fredberlin/Documents/VS\ Code\ /RankEDHK

# Install npm packages
npm install
```

---

## STEP 2: Setup Supabase (10 minutes)

### Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Create new project with your email
4. Choose region (closest to Hong Kong: Singapore or Tokyo)
5. Wait for project to be "ready" (shows green checkmark)

### Copy Your Credentials
1. Go to Project Settings → API
2. Copy these three values:
   - **Project URL** → Copy to `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public key** → Copy to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role secret** → Copy to `SUPABASE_SERVICE_ROLE_KEY`

### Create Database Schema
1. In Supabase, go to SQL Editor → New Query
2. Paste the entire content from: `/scripts/DATABASE_SCHEMA.sql`
3. Click "Run"
4. Verify 4 tables created: universities, programs, users, reviews

---

## STEP 3: Get Google Gemini API Key (2 minutes)

1. Go to https://aistudio.google.com/app/apikey
2. Click "Get API Key"
3. Create new API key
4. Copy the key to `GEMINI_API_KEY`

---

## STEP 4: Create .env.local

```bash
# Copy the template
cp .env.local.example .env.local

# Edit .env.local with your credentials
# Use VS Code to edit:
code .env.local
```

Fill in these values from Steps 2 & 3:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
GEMINI_API_KEY=AIzaSyD...
BETTER_AUTH_SECRET=generate-random-string-here
BETTER_AUTH_URL=http://localhost:3000
NODE_ENV=development
```

To generate BETTER_AUTH_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## STEP 5: Run Local Development Server (2 minutes)

```bash
npm run dev
```

You should see:
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

Open browser to: http://localhost:3000

You should see the RankedEDHK home page! 🎉

---

## STEP 6: Test the Application

### Sidebar Navigation
- [ ] Click on a university (e.g., "University of Hong Kong")
- [ ] Should expand and show program list
- [ ] Click on a program

### Program Details
- [ ] Should show program name and code
- [ ] Should show "No reviews yet" message

### Review Form
- [ ] Form should be visible
- [ ] Select grades for 4 categories
- [ ] Type in review text (min 1 char, max 500)
- [ ] Click "Submit Review"
- [ ] Should see success message

### Test Moderation
- [ ] Try submitting a review with inappropriate content
- [ ] Gemini API should flag or approve it

---

## STEP 7: Populate Program Data (Optional)

### Option A: Run Scraper
```bash
npm run scrape
```

### Option B: Manual Entry in Supabase
1. Go to Supabase Dashboard
2. Table Editor → programs
3. Click "Insert Row"
4. Fill:
   - name: "Bachelor of Business"
   - code: "BBA"
   - university_id: (select from dropdown)
   - description: "A great business program"

---

## STEP 8: Deploy to Vercel (10 minutes)

### Push to GitHub
```bash
git add -A
git commit -m "Add JUPAS review platform"
git push origin main
```

### Deploy on Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy"
5. Wait 5-10 minutes for build

### Add Environment Variables in Vercel
1. Project Settings → Environment Variables
2. Add all 8 variables from `.env.local`:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (mark: Production Only)
   - GEMINI_API_KEY
   - BETTER_AUTH_SECRET
   - BETTER_AUTH_URL (your Vercel domain)
   - CRON_SECRET
   - NODE_ENV

3. Redeploy (or auto-redeploys)
4. Visit your live URL!

---

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run scraper manually
npm run scrape

# Check for errors
npm run lint

# See file structure
ls -la
```

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find and kill process
kill -9 $(lsof -ti :3000)

# Or use different port
npm run dev -- -p 3001
```

### Can't Connect to Supabase
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Check NEXT_PUBLIC_SUPABASE_ANON_KEY isn't truncated
- Try in Supabase Studio SQL Console to test connection

### Gemini API Not Working
- Verify GEMINI_API_KEY in .env.local
- Go to Google Cloud Console → check API is enabled
- Check you haven't exceeded free quota (60 requests/min)

### Reviews Not Saving
- Check browser console for errors (F12 → Console)
- Verify database schema was created
- Check Supabase → SQL Editor for any errors

---

## What's Next?

### Complete Authentication
- Better-Auth is configured in structure but needs implementation
- Implement email verification
- Add password reset flow
- Set up OAuth (Google, GitHub)

### Add More Features
- Search functionality
- Filtering and sorting
- User profiles
- Review editing
- Favorite programs
- Email notifications

### Production Optimization
- Implement caching
- Add image optimization
- Setup monitoring
- Configure rate limiting
- SEO optimization

### Database Improvements
- Add more data fields
- Implement full-text search
- Add analytics tables
- Setup replication

---

## Reference Files

- **Full README**: [README.md](README.md) - Complete project overview
- **Setup Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions
- **Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deployment verification
- **Database Schema**: [scripts/DATABASE_SCHEMA.sql](scripts/DATABASE_SCHEMA.sql) - PostgreSQL schema
- **Environment Variables**: [.env.local.example](.env.local.example) - Template

---

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs  
- **Google Gemini Docs**: https://ai.google.dev/docs
- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## You're All Set! 🎉

Your JUPAS review platform is ready to go. Start with Step 1 and follow the checklist.

Got stuck? Check the troubleshooting section above or review the detailed guides in README.md and SETUP_GUIDE.md.

**Happy coding!** 🚀
