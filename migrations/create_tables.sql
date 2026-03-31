-- migrations/create_tables.sql
-- Run this in Supabase SQL editor (Project → SQL)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text,
  university text,
  program text,
  year_of_study integer,
  competitiveness text,
  competition_text text,
  social text,
  social_text text,
  career text,
  career_text text,
  teaching text,
  teaching_text text,
  competitiveness_grade_valid boolean,
  social_grade_valid boolean,
  career_grade_valid boolean,
  teaching_grade_valid boolean,
  moderation_status text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.program_list (
  id serial PRIMARY KEY,
  university text,
  program text
);

-- Optional index
CREATE INDEX IF NOT EXISTS idx_programs_university ON public.program_list (university);
-- Ensure uniqueness on (university, program) to support upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_programs_university_program ON public.program_list (university, program);
