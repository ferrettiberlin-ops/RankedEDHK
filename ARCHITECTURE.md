# 🏗️ Architecture & Technology Stack

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Next.js Frontend (React + TypeScript)        │   │
│  │  ┌──────────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │  Navigation  │  │ Sidebar  │  │ Main Content│   │   │
│  │  └──────────────┘  └──────────┘  └──────────────┘   │   │
│  │  ┌──────────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │ ReviewForm   │  │ReviewList│  │Program Dtls │   │   │
│  │  └──────────────┘  └──────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTPS (TailwindCSS)
                            │
┌─────────────────────────────────────────────────────────────┐
│              Vercel (Edge Network + CDN)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Next.js API Routes (Serverless)               │  │
│  │  ┌──────────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │  /moderate   │  │ /programs │ │ /cron/scrape│   │  │
│  │  │(Gemini)      │  │ /scores   │ │ (automated) │   │  │
│  │  └──────────────┘  └──────────┘  └──────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌──────────────────┐ ┌────────────────┐ ┌──────────────────┐
│  Supabase        │ │ Google Gemini  │ │ GitHub           │
│ (PostgreSQL)     │ │ (AI Moderation)│ │ (Version Control)│
│                  │ │                │ │                  │
│ ├─universities   │ │ Flags content  │ │ Auto-deploys to  │
│ ├─programs       │ │ for approval   │ │ Vercel on push   │
│ ├─reviews        │ │                │ │                  │
│ ├─users          │ │                │ │                  │
│ └─auth           │ │                │ │                  │
│                  │ │                │ │                  │
│ RLS Policies     │ │                │ │                  │
│ enabled          │ │                │ │                  │
└──────────────────┘ └────────────────┘ └──────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14.x
- **Language**: TypeScript
- **Runtime**: React 18.x
- **Styling**: TailwindCSS 3.x + PostCSS
- **Build Tool**: Webpack (Next.js)
- **Package Manager**: npm

### Backend
- **Runtime**: Node.js (Vercel Serverless)
- **API Framework**: Next.js API Routes
- **Middleware**: Built-in Next.js middleware
- **Language**: TypeScript

### Database
- **Provider**: Supabase (PostgreSQL)
- **Security**: Row-Level Security (RLS)
- **Migrations**: SQL scripts
- **Client**: @supabase/supabase-js

### Authentication
- **Provider**: Better-Auth
- **Email Verification**: Token-based (15 min expiry)
- **Domain Whitelisting**: 8 HK universities
- **Password Security**: Bcrypt (Better-Auth)

### AI & Moderation
- **AI Provider**: Google Cloud (Generative AI)
- **Model**: Gemini Pro
- **Purpose**: Content moderation
- **Access**: Server-side only (secure)

### Deployment
- **Hosting**: Vercel
- **Edge Network**: Vercel Edge Functions
- **CDN**: Vercel CDN
- **Monitoring**: Vercel Analytics
- **Cron Jobs**: Vercel Cron
- **SSL**: Auto-issued Let's Encrypt

### Version Control
- **System**: Git
- **Remote**: GitHub
- **CI/CD**: Vercel auto-deploy

---

## Data Flow

### Review Submission Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User fills Review Form (ClientSide)                      │
│    ├─ Select grades (A-F)                                  │
│    ├─ Enter text review                                    │
│    └─ Click Submit                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ 2. Client-Side Validation (TypeScript)                     │
│    ├─ Check all grades selected                            │
│    ├─ Verify text length (1-500 chars)                     │
│    ├─ Validate user authenticated                          │
│    └─ Send to server                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ 3. Server-Side Processing (/api/reviews)                   │
│    ├─ Verify user authentication                           │
│    ├─ Check email verified                                 │
│    └─ Call Gemini API                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ 4. AI Moderation (Google Gemini)                            │
│    ├─ Analyze for hate speech                              │
│    ├─ Check for harassment                                 │
│    ├─ Detect profanity/spam                                │
│    └─ Return approval/flag status                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴─────────────┐
          │                          │
    ┌─────▼──────┐            ┌──────▼──────┐
    │  Approved  │            │  Flagged    │
    └─────┬──────┘            └──────┬──────┘
          │                          │
    ┌─────▼──────────────┐      ┌────▼──────────┐
    │ Insert to Supabase │      │ Return error  │
    │ - program_id       │      │ - Show warning│
    │ - user_id          │      │ - Block submit│
    │ - grades           │      └───────────────┘
    │ - text_review      │
    │ - timestamp        │
    └─────┬──────────────┘
          │
    ┌─────▼──────────────────────┐
    │ RLS Policies Check          │
    │ ├─ User must be verified    │
    │ ├─ Grade validation         │
    │ └─ Supabase accepts insert  │
    └─────┬──────────────────────┘
          │
    ┌─────▼──────────────────────┐
    │ Calculate Aggregated Scores │
    │ ├─ Fetch all reviews        │
    │ ├─ Weight by year           │
    │ ├─ Calculate letter grades  │
    │ └─ Update overall grade     │
    └─────┬──────────────────────┘
          │
    ┌─────▼──────────────────────┐
    │ Return to Client            │
    │ ├─ Success message          │
    │ ├─ Updated scores           │
    │ ├─ Refresh review list      │
    │ └─ Reset form               │
    └────────────────────────────┘
```

### Data Storage

```
Supabase PostgreSQL Database

┌──────────────────────────────────────────┐
│           universities                    │
├──────────────────────────────────────────┤
│ id: UUID (PK)                            │
│ name: VARCHAR                            │
│ code: VARCHAR (UNIQUE)                   │
│ email_domain: VARCHAR                    │
│ created_at: TIMESTAMP                    │
└──────────────────────────────────────────┘
            │ 1 ─ N │
            └───────────────┐
                            │
┌──────────────────────────────────────────┐
│           programs                        │
├──────────────────────────────────────────┤
│ id: UUID (PK)                            │
│ name: VARCHAR                            │
│ code: VARCHAR                            │
│ university_id: UUID (FK)                 │
│ description: TEXT                        │
│ created_at: TIMESTAMP                    │
└──────────────────────────────────────────┘
            │ 1 ─ N │
            └───────────────┐
                            │
┌──────────────────────────────────────────┐
│           reviews                         │
├──────────────────────────────────────────┤
│ id: UUID (PK)                            │
│ program_id: UUID (FK)                    │
│ user_id: UUID (FK)                       │
│ competitiveness: CHAR                    │
│ social_opportunities: CHAR               │
│ career_opportunities: CHAR               │
│ teaching_quality: CHAR                   │
│ text_review: TEXT                        │
│ year_of_study: INTEGER                   │
│ created_at: TIMESTAMP                    │
└──────────────────────────────────────────┘
            │ N ─ 1 │
            └───────────────┐
                            │
┌──────────────────────────────────────────┐
│           users                           │
├──────────────────────────────────────────┤
│ id: UUID (PK, from auth.users)           │
│ email: VARCHAR (UNIQUE)                  │
│ university_id: UUID (FK)                 │
│ email_verified: BOOLEAN                  │
│ verification_token: VARCHAR              │
│ token_expires_at: TIMESTAMP              │
│ year_of_study: INTEGER                   │
│ created_at: TIMESTAMP                    │
└──────────────────────────────────────────┘
```

---

## Security Architecture

### Authentication Layer
```
┌─────────────────────────────────┐
│  Better-Auth                     │
│  ├─ Email/Password              │
│  ├─ Domain Whitelisting         │
│  ├─ Email Verification          │
│  └─ Session Tokens              │
└────────┬────────────────────────┘
         │
    ┌────▼─────────────────────────┐
    │  Supabase Auth Table          │
    │  ├─ Hashed passwords          │
    │  ├─ Email verified status     │
    │  └─ UUID user IDs             │
    └────┬─────────────────────────┘
         │
    ┌────▼─────────────────────┐
    │  RLS Policies             │
    │  ├─ Row-based access      │
    │  ├─ Verified users only   │
    │  └─ Own data only         │
    └──────────────────────────┘
```

### API Security
```
┌─────────────────────────────────┐
│  Client Request                  │
│  ├─ HTTPS only                   │
│  └─ Signed JWT token             │
└────────┬────────────────────────┘
         │
    ┌────▼─────────────────────────┐
    │  Next.js API Route             │
    │  ├─ Authenticate request       │
    │  ├─ Verify permission          │
    │  └─ Validate input              │
    └────┬─────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │  External APIs                 │
    │  ├─ Gemini (server-side key)   │
    │  ├─ Supabase (service role)    │
    │  └─ Rate limiting              │
    └────┬──────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │  Response                      │
    │  ├─ Sanitized data             │
    │  ├─ Error handling             │
    │  └─ Security headers           │
    └──────────────────────────────┘
```

### Data Security
```
┌─────────────────────────────────────────┐
│  Data at Rest (Supabase)                 │
│  ├─ PostgreSQL encryption                │
│  ├─ RLS policies                         │
│  ├─ Audit logs                           │
│  └─ Backups encrypted                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Data in Transit                         │
│  ├─ HTTPS/TLS 1.3                        │
│  ├─ Signed API requests                  │
│  ├─ JWT tokens                           │
│  └─ No plaintext secrets                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Data in Code                            │
│  ├─ Environment variables                │
│  ├─ .gitignore protection                │
│  ├─ Production-only secrets              │
│  └─ No hardcoded keys                    │
└─────────────────────────────────────────┘
```

---

## Performance Optimization

### Frontend Performance
- ✅ Code splitting via Next.js
- ✅ TailwindCSS minimal CSS (~15KB)
- ✅ Image optimization ready
- ✅ Lazy loading components
- ✅ Client-side form validation
- ✅ React hooks for state management

### Backend Performance
- ✅ Serverless functions (cold start < 1s)
- ✅ Database connection pooling (Supabase)
- ✅ Indexed database queries
- ✅ Caching-friendly API endpoints
- ✅ Request validation early

### CDN & Edge
- ✅ Vercel Edge Network (global)
- ✅ Automatic GZIP compression
- ✅ HTTP/2 push capability
- ✅ Stale-while-revalidate caching

---

## Scalability Considerations

### Database
- Supabase auto-scales PostgreSQL
- Read replicas available
- Horizontal scaling via sharding

### API
- Vercel serverless auto-scales
- Load balancing included
- Rate limiting enforced

### Frontend
- Static generation (ISR)
- Edge caching
- CDN distribution

---

## Monitoring & Observability

### Vercel Analytics
- ✅ Core Web Vitals
- ✅ Real user monitoring
- ✅ Deployment tracking

### Application Logging
- ✅ Browser console (client)
- ✅ Vercel logs (server)
- ✅ Error tracking ready

### Database Monitoring
- ✅ Supabase dashboard
- ✅ Query performance
- ✅ Audit logs

---

## Deployment Pipeline

```
Developer Push to GitHub
         │
         ▼
GitHub Webhook
         │
         ▼
Vercel Detects Change
         │
         ▼
Build Next.js App
├─ npm install
├─ npm run build
├─ Type checking
└─ Lint (optional)
         │
         ▼
Deploy to Edge Network
├─ Upload static files
├─ Deploy serverless functions
└─ Update environment variables
         │
         ▼
Verify Deployment
├─ Health checks
├─ Smoke tests
└─ Update DNS
         │
         ▼
Live on https://yourdomain.vercel.app
```

---

**Technology Stack Summary**: 
- 🎬 Frontend: Next.js + React + TypeScript
- 🗄️ Database: Supabase (PostgreSQL)
- 🔐 Auth: Better-Auth + Email Domain
- 🤖 AI: Google Gemini API
- 🚀 Deploy: Vercel Serverless
- 🎨 Styling: TailwindCSS
- 📦 Package Mgr: npm

**Status**: ✅ Production-Ready Architecture
