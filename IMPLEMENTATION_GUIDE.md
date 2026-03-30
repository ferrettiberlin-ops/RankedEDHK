# RankedEDHK Advanced Implementation Guide

## 🔒 Anonymity & Privacy Architecture

### Student Verification Flow

```
1. Student Signup
   └─ Email verification (university domain only)
   └─ Email is used ONLY for verification
   └─ Email is NEVER stored in database

2. User Record Created
   └─ Anonymous user ID (UUID)
   └─ University ID (anonymized)
   └─ Year of study (anonymized)
   └─ Verified flag = true

3. Review Submission
   └─ Review linked to anonymous user ID
   └─ No personal info visible
   └─ Public sees: grade + text + year of study (anonymized)
   └─ Email never exposed
```

### Database Structure

**users table** (anonymous):
```sql
id (UUID)           -- Unique student ID
university_id       -- Which university (anonymized)
year_of_study       -- 1-5 (anonymized)
verified (boolean)  -- Email verified? (true = can submit reviews)
-- NO email, NO student ID, NO personal info
```

**reviews table** (fully public, anonymous):
```sql
id                                -- Review ID
program_id                         -- Which program
user_id                           -- Anonymous user (no email exposed)
competitiveness_grade             -- A-F
competitiveness_text              -- Text explanation
social_grade, social_text         -- etc
career_grade, career_text         -- etc
teaching_grade, teaching_text     -- etc
competitiveness_grade_valid       -- Grade included in calculations?
social_grade_valid                -- etc
career_grade_valid                -- etc
teaching_grade_valid              -- etc
-- Reviewers are completely anonymous to public
```

---

## 🛡️ Content Moderation System

### Two-Stage Moderation

#### Stage 1: Content Safety Check
```
Review text → Google Gemini API
├─ Check for hate speech
├─ Check for harassment/bullying
├─ Check for defamation
├─ Check for spam/off-topic
└─ Check for illegal activity

Result: APPROVED or FLAGGED
```

If **FLAGGED**: 
- ❌ Review is blocked completely
- 🔴 Red warning shown to user
- 📝 Reason displayed

If **APPROVED**: Continue to Stage 2

#### Stage 2: Grade Consistency Check
```
For each of 4 grades:
  Text → Google Gemini API
  ├─ Compare text sentiment to grade
  ├─ Check if grade matches content
  ├─ Verify no contradictions
  └─ Return: CONSISTENT or INCONSISTENT

Example:
  Grade: A (Excellent)
  Text: "Terrible teachers, outdated materials"
  Result: INCONSISTENT ❌
  Action: Publish text only, exclude grade from calculations
```

If **CONSISTENT**: ✅ Grade included in program rating  
If **INCONSISTENT**: ⚠️ Text published, grade excluded

---

## 🚨 Legal & Risk Protection

### Legal Disclaimer (Shown Before Review)
Located in: `components/LegalDisclaimer.tsx`

- All reviews are anonymous student opinions
- Platform not liable for opinions
- Student is sole responsible for review content
- Reviews may be moderated/removed

### Risk Warning Modal (Before Submission)
Located in: `components/RiskWarningModal.tsx`

Shows warnings:
- ⚠️ Review will be public
- ⚠️ Offensive content will be blocked
- ⚠️ Grades must match text
- ⚠️ Platform has no liability

User must check box to acknowledge and continue.

---

## 🔑 API Endpoints

### POST `/api/moderate`

**Request:**
```json
{
  "text": "Review text here...",
  "grade": "A"
}
```

**Response:**
```json
{
  "approved": true,
  "gradeValid": true,
  "consistencyReasoning": "Grade matches review sentiment",
  "message": "Review approved and will be included in calculations"
}
```

or

```json
{
  "approved": false,
  "reason": "content_flagged",
  "message": "Review contains inappropriate content",
  "gradeValid": null
}
```

---

## 📝 Review Submission Flow

```
User fills form with:
├─ 4 grades (A-F)
├─ 4 text explanations
└─ Year of study

↓ User clicks "Review & Submit"

↓ Risk Warning Modal appears
└─ User must accept risks

↓ Send to /api/moderate for each text + grade pair

↓ Moderation API:
├─ Check content safety (Gemini)
└─ If approved, check grade consistency (Gemini)

↓ Results:
├─ FLAGGED → Block submission, show error
├─ APPROVED + CONSISTENT → Store with grade_valid=true
└─ APPROVED + INCONSISTENT → Store with grade_valid=false

↓ Display result to user:
├─ Success: "Review included in program ratings"
├─ Warning: "Review published but grades excluded"
└─ Error: "Review blocked for content policy"
```

---

## 🗄️ Database Schema Updates

### Key Changes from Original

**REMOVED:**
- `email` from users table (never stored)
- `email_verified` from users table (only `verified` boolean)
- `verification_token`, `token_expires_at` (handled by Better-Auth)
- Single `text_review` field from reviews

**ADDED:**
- `competitiveness_text`, `social_text`, `career_text`, `teaching_text`
- `competitiveness_grade_valid`, `social_grade_valid`, etc.
- `moderation_status` ('pending', 'approved', 'flagged')
- `moderation_flags` for storing reasons

**RENAMED:**
- `email_domain` → `domain`
- `competitiveness` → `competitiveness_grade`
- Individual text fields per category

### Setup: Run in Supabase SQL Editor

```sql
-- Execute scripts/DATABASE_SCHEMA.sql
-- This creates all tables with RLS policies
```

---

## 🔐 Row-Level Security (RLS) Policies

### For `users` table:
```sql
-- Users can only see their own profile
SELECT: auth.uid() = id
UPDATE: auth.uid() = id
```

### For `reviews` table:
```sql
-- Everyone can READ reviews (anonymous)
SELECT: true

-- Only VERIFIED users can INSERT
INSERT: auth.uid() = user_id AND 
        user.verified = true

-- Users can UPDATE/DELETE their own reviews
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id
```

This means:
✅ Reviews are public (anyone can read)
✅ Verified students only can write
✅ No user emails exposed
✅ Complete anonymity maintained

---

## 🔧 Environment Variables Required

### Local Development (.env.local)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  (for local scraper only)

# Google Gemini
GEMINI_API_KEY=...

# Better-Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# Node
NODE_ENV=development
```

### Production (Vercel Environment Variables)

```
All of the above, PLUS:

# Mark these as "Production Only":
SUPABASE_SERVICE_ROLE_KEY=...
CRON_SECRET=...

# Update after deployment:
BETTER_AUTH_URL=https://yourdomain.vercel.app
NODE_ENV=production
```

⚠️ **CRITICAL**: Service role key should ONLY be in production, never client-side.

---

## 📊 How Aggregated Scores Work

### Calculation Process

1. **Fetch all reviews** for a program
2. **For each review**, check grade validity:
   ```
   if grade_valid = true
     include in calculation
   else
     exclude from calculation
   ```
3. **Weight by year of study**:
   ```
   Year 1: 1.0x  (newest students)
   Year 2: 1.2x
   Year 3: 1.4x
   Year 4: 1.6x
   Year 5: 1.8x  (postgraduates, most experience)
   ```
4. **Calculate letter grade**:
   ```
   (A=4, B=3, C=2, D=1, F=0) → weighted average → round → convert to letter
   ```
5. **Final grade**: Average of 4 categories

### Example

```
Program has 5 reviews:

Review 1: B (1.0x) - competitiveness VALID
Review 2: A (1.2x) - competitiveness VALID
Review 3: B (1.4x) - competitiveness INCONSISTENT (excluded)
Review 4: C (1.6x) - competitiveness VALID
Review 5: B (1.8x) - competitiveness VALID

Calculation:
= (3×1.0 + 4×1.2 + 0×1.4 + 2×1.6 + 3×1.8) / (1.0 + 1.2 + 0 + 1.6 + 1.8)
= (3 + 4.8 + 0 + 3.2 + 5.4) / 5.6
= 16.4 / 5.6
= 2.93
≈ 3
= B ✅

Result: Competitiveness Rating = B
(Review 3's grade was excluded but text still published)
```

---

## 🚀 Implementation Checklist

- [ ] Run DATABASE_SCHEMA.sql in Supabase
- [ ] Verify 4 tables created with RLS
- [ ] Copy .env.local.template to .env.local
- [ ] Fill in Supabase credentials (RankedEDHKLOG)
- [ ] Fill in Gemini API key
- [ ] Generate BETTER_AUTH_SECRET
- [ ] Test locally: `npm run dev`
- [ ] Test review submission with warning modal
- [ ] Verify moderation works (try offensive text)
- [ ] Verify consistency check (grade vs text)
- [ ] Check published reviews are anonymous
- [ ] Deploy to Vercel
- [ ] Add environment variables in Vercel
- [ ] Test production moderation
- [ ] Verify legal disclaimers display

---

## 🧪 Testing Scenarios

### Test 1: Valid Review
```
Grade: A
Text: "Excellent program with great teachers and resources"
Expected: ✅ APPROVED, grade VALID, included in calculations
```

### Test 2: Flagged Content
```
Text: "This university is filled with [slur]"
Expected: ❌ BLOCKED, red warning, review not submitted
```

### Test 3: Inconsistent Grade
```
Grade: A
Text: "Waste of time, worst experience ever"
Expected: ⚠️ APPROVED but grade INVALID
Result: Text published, grade excluded
```

### Test 4: Highly Positive About Negative
```
Grade: F
Text: "Amazing program, life-changing experience"
Expected: ⚠️ APPROVED but grade INVALID
Result: Text published as-is, grade excluded
```

---

## 🔗 Key Files

| File | Purpose |
|------|---------|
| `scripts/DATABASE_SCHEMA.sql` | Database creation + RLS |
| `lib/gemini.ts` | Content & consistency moderation |
| `app/api/moderate/route.ts` | Moderation endpoint |
| `components/ReviewForm.tsx` | Review form with modal |
| `components/RiskWarningModal.tsx` | Risk warning before submit |
| `components/LegalDisclaimer.tsx` | Legal disclaimer page |
| `lib/reviews.ts` | Review submission logic |
| `.env.local.template` | Environment variables |

---

## 📱 User Experience

### Student Perspective

1. **Signup**: Enter university email → verify → approved
2. **Browse**: View programs anonymously
3. **Review**: Select grades, write explanations for each
4. **Warning**: See ⚠️ warning modal about risks
5. **Submit**: Click continue → moderation runs automatically
6. **Result**: See success/warning/error message
7. **View**: See review published anonymously (no email shown)
8. **Later**: See their review in program's review list with all reviews anonymous

### Public User Perspective

1. **Browse**: View programs and reviews
2. **See Reviews**: Anonymous reviews from "Year 2 Student", "Postgrad", etc.
3. **No Personal Info**: No names, no emails, no IDs
4. **See Ratings**: Grade from review (if valid)
5. **Read Text**: Full review text visible
6. **Aggregated Score**: Program overall rating from valid grades only

---

## ⚠️ Important Notes

- **Emails are never stored** in the database
- **Emails are never displayed** publicly
- **Reviews are completely anonymous**
- **Grades may be excluded** if inconsistent with text
- **Moderation is automatic** via Gemini AI
- **Users are protected** from liability by disclaimer + warning
- **All data is encrypted** in transit (HTTPS) and at rest (Supabase)

---

**Status**: ✅ Complete Implementation Guide  
**Date**: March 31, 2026  
**Project**: RankedEDHK v2 (with Moderation & Anonymity)
