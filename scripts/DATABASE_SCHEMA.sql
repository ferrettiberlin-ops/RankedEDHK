-- Create Universities table
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  code VARCHAR NOT NULL UNIQUE,
  domain VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  code VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(code, university_id)
);

-- Create Users table (anonymous, no email stored)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  university_id UUID NOT NULL REFERENCES universities(id),
  year_of_study INTEGER NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Reviews table (anonymous reviews with text + grades)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Grade fields
  competitiveness_grade CHAR(1),
  social_grade CHAR(1),
  career_grade CHAR(1),
  teaching_grade CHAR(1),
  
  -- Text fields
  competitiveness_text TEXT,
  social_text TEXT,
  career_text TEXT,
  teaching_text TEXT,
  
  -- Moderation + Consistency
  competitiveness_grade_valid BOOLEAN DEFAULT TRUE,
  social_grade_valid BOOLEAN DEFAULT TRUE,
  career_grade_valid BOOLEAN DEFAULT TRUE,
  teaching_grade_valid BOOLEAN DEFAULT TRUE,
  
  moderation_status VARCHAR DEFAULT 'pending',
  moderation_flags TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(program_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for universities (public read)
CREATE POLICY "Universities are viewable by everyone" ON universities
  FOR SELECT USING (true);

-- RLS Policies for programs (public read)
CREATE POLICY "Programs are viewable by everyone" ON programs
  FOR SELECT USING (true);

-- RLS Policies for users (own profile only, anonymous)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for reviews (public read anonymous, verified users can insert)
CREATE POLICY "Reviews are viewable by everyone (anonymous)" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Verified users can insert reviews" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND verified = true)
  );

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Insert universities
INSERT INTO universities (name, code, domain) VALUES
  ('University of Hong Kong', 'HKU', 'hku.hk'),
  ('Hong Kong University of Science and Technology', 'HKUST', 'ust.hk'),
  ('Chinese University of Hong Kong', 'CUHK', 'cuhk.edu.hk'),
  ('Hong Kong Polytechnic University', 'POLYU', 'polyu.edu.hk'),
  ('City University of Hong Kong', 'CITYU', 'cityu.edu.hk'),
  ('Hong Kong Baptist University', 'HKBU', 'hkbu.edu.hk'),
  ('Education University of Hong Kong', 'EDUHK', 'eduhk.hk'),
  ('Lingnan University', 'LINGNAN', 'lingnan.edu.hk')
ON CONFLICT (code) DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_programs_university_id ON programs(university_id);
CREATE INDEX idx_programs_code ON programs(code);
CREATE INDEX idx_reviews_program_id ON reviews(program_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_moderation_status ON reviews(moderation_status);
CREATE INDEX idx_users_university_id ON users(university_id);
CREATE INDEX idx_users_verified ON users(verified);
