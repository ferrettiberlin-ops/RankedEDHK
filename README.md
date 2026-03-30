# RankedEDHK - JUPAS Program Review Platform

A Next.js + TypeScript + TailwindCSS web application where verified Hong Kong university students can review and rate JUPAS programs. Reviews are aggregated with weighted scoring and displayed publicly, with AI-powered content moderation powered by Google Gemini.

## 🎯 Features

- **Program Data Scraping**: Automated JUPAS program data collection
- **Student Authentication**: Better-Auth with HK university email verification
- **Review System**: 4-category grading (Competitiveness, Social Ops, Career Ops, Teaching Quality)
- **AI Moderation**: Google Gemini-powered content filtering
- **Weighted Aggregation**: Scoring by year of study (older years weight more)
- **Responsive UI**: TailwindCSS styling with dark mode support
- **Secure Deployment**: Vercel with Row-Level Security (RLS) on Supabase
- **Real-time Updates**: Live aggregated scores

## 📋 Tech Stack

- **Frontend**: Next.js 14+ (React 18+), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Better-Auth with domain whitelisting
- **AI Moderation**: Google Generative AI (Gemini)
- **Deployment**: Vercel
- **Scraping**: Node.js + Cheerio

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier available)
- Google Gemini API key (free tier available)
- Better-Auth setup

### Step 1: Clone & Setup Local Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd RankedEDHK

# Install dependencies
npm install

# Create .env.local from template
cp .env.local.example .env.local
```

### Step 2: Configure Environment Variables

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key

# Better-Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Cron Jobs (for Vercel)
CRON_SECRET=your-cron-secret-key
```

### Step 3: Setup Supabase Database

1. Create a new Supabase project
2. Run the SQL schema in `scripts/DATABASE_SCHEMA.sql` in Supabase SQL Editor
3. Verify tables are created: `universities`, `programs`, `users`, `reviews`

### Step 4: Run Local Development

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Step 5: Populate Program Data

Run the scraper to fetch JUPAS programs:

```bash
npm run scrape
```

Or manually insert test data in Supabase.

## 📁 Project Structure

```
RankedEDHK/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   └── api/
│       ├── moderate/        # Content moderation endpoint
│       ├── programs/        # Program scores aggregation
│       └── cron/            # Scheduled scraping job
├── components/
│   ├── Navigation.tsx       # Top navigation
│   ├── Sidebar.tsx          # University/program list
│   ├── MainContent.tsx      # Main page layout
│   ├── ReviewForm.tsx       # Review submission form
│   ├── ReviewList.tsx       # Display reviews
│   └── ProgramDetails.tsx   # Program info & ratings
├── lib/
│   ├── supabase.ts          # Supabase client & queries
│   ├── reviews.ts           # Review functions
│   ├── programs.ts          # Program scoring logic
│   ├── gemini.ts            # AI moderation
│   └── auth.ts              # Authentication helpers
├── public/                  # Static assets
├── scripts/
│   ├── scraper.js           # Manual scraper script
│   └── DATABASE_SCHEMA.sql  # Supabase schema
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── .env.local.example       # Environment variables template
```

## 🔐 Security Features

### Environment Variables
- All API keys stored in `.env.local` (never committed)
- Sensitive keys use Vercel Environment Variables for production
- `.gitignore` prevents accidental commits

### Database Security (Supabase RLS)
- Public read access to universities and programs
- Reviews visible to all (anonymous)
- Only verified users can submit reviews
- Users can only edit/delete their own reviews
- Service role key used only for admin operations

### Authentication
- Email verification with 15-minute expiring tokens
- Domain whitelisting for HK universities only
- Rate limiting on login attempts
- HTTPS enforced in production

### AI Moderation
- Content moderation via Gemini API (server-side only)
- API key never exposed to frontend
- Requests sanitized before storage
- Failed validations don't block submissions

### Input Validation
- Form validation on client and server
- SQL injection prevention via Supabase parameterized queries
- XSS prevention via React escaping
- Content Security Policy headers enabled

## 📊 Review Aggregation Algorithm

Scores are weighted by year of study (newer years weighted less):
- Year 1: 1.0x
- Year 2: 1.2x
- Year 3: 1.4x
- Year 4: 1.6x
- Postgraduate: 1.8x

Overall grade calculated from weighted average of 4 categories.

## 🚀 Deployment to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add JUPAS review platform"
git push origin main
```

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js ✅
5. Click "Deploy"

### Step 3: Add Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... (only Production)
GEMINI_API_KEY=...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://yourdomain.vercel.app
CRON_SECRET=...
```

### Step 4: Set Up Cron Jobs (Optional)

Add to `vercel.json`:

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

This runs the scraper daily at 2 AM UTC.

### Step 5: Verify Deployment

- Live URL: `https://yourdomain.vercel.app`
- Check Vercel Deployments tab
- Monitor real-time logs

## 📧 University Email Domains

Supported universities for email verification:
- HKU: `hku.hk`
- HKUST: `ust.hk`
- CUHK: `cuhk.edu.hk`
- PolyU: `polyu.edu.hk`
- CityU: `cityu.edu.hk`
- HKBU: `hkbu.edu.hk`
- EdUHK: `eduhk.hk`
- Lingnan: `lingnan.edu.hk`

## 🔧 API Endpoints

### POST `/api/moderate`
Content moderation via Gemini API
```json
{
  "text": "Review text to moderate"
}
```

### GET `/api/programs/[id]/scores`
Aggregated program scores
```json
{
  "competitiveness": "B",
  "socialOpportunities": "A",
  "careerOpportunities": "B",
  "teachingQuality": "B",
  "overallGrade": "B",
  "reviewCount": 12
}
```

## 📚 Database Schema

### universities
- `id`: UUID (PK)
- `name`: String
- `code`: String (UNIQUE)
- `email_domain`: String

### programs
- `id`: UUID (PK)
- `name`: String
- `code`: String
- `university_id`: UUID (FK)
- `description`: Text

### reviews
- `id`: UUID (PK)
- `program_id`: UUID (FK)
- `user_id`: UUID (FK)
- `competitiveness`: Char (A/B/C/D/F)
- `social_opportunities`: Char
- `career_opportunities`: Char
- `teaching_quality`: Char
- `text_review`: Text
- `year_of_study`: Integer

### users
- `id`: UUID (PK, linked to Supabase auth)
- `email`: String (UNIQUE)
- `university_id`: UUID (FK)
- `email_verified`: Boolean
- `verification_token`: String
- `token_expires_at`: Timestamp

## 🐛 Troubleshooting

### Reviews Not Showing
- Check RLS policies are enabled in Supabase
- Verify user is verified (email_verified = true)
- Check Supabase audit logs

### Moderation Failing
- Verify GEMINI_API_KEY is set
- Check Google Cloud Console for API quota
- See server logs in Vercel dashboard

### Database Connection Issues
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Check Supabase project is running
- Verify RLS policies allow reads

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Better-Auth Docs](https://better-auth.vercel.app)
- [Gemini API Docs](https://ai.google.dev/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## 📝 License

MIT License - see LICENSE file

## 👥 Contributing

Contributions welcomed! Please open an issue or PR.

---

**Last Updated**: March 2026
**Maintained by**: Ferretti Berlincioni
