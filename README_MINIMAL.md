# RankedEDHK

A secure platform for verified university students to share and discover academic reviews.

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Configure environment (copy template and fill in values)
cp .env.local.example .env.local

# Start development server
npm run dev
```

Access the app at `http://localhost:3000`

### Production Deployment

The project is configured for automatic deployment to Vercel:

1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Add these environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `ANON_KEY`
   - `ROLE_KEY`
   - `AUTH_SECRET`
   - `HF_KEY`
3. Deploy
4. Access your app at `https://[your-project].vercel.app`

## Security

- All secrets stored locally in `.env.local` (never committed)
- Review data is anonymous (no personal information stored)
- Content moderation via Hugging Face API
- HTTPS enforced in production

## Requirements

- Node.js 18+
- npm or yarn

---

**Note**: This is a private project. Do not fork or replicate without permission.
