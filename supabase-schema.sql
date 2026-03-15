-- Save this file as supabase-schema.sql and run it in the Supabase SQL Editor

-- 1. Users
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[],
  groups TEXT[],
  reputation_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Proposals
CREATE TYPE proposal_type AS ENUM ('event', 'project', 'policy', 'funding', 'working_group', 'campaign');
CREATE TYPE proposal_status AS ENUM (
  'draft', 'submitted', 'in_review', 'approved', 'seeking_participants', 
  'seeking_steward', 'ready_to_start', 'in_progress', 'completed', 
  'rejected', 'needs_revision', 'expired'
);

CREATE TABLE proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  tags TEXT[],
  type proposal_type NOT NULL,
  
  -- Resource Needs (JSONB for flexibility as it maps to the object in spec)
  resource_needs JSONB DEFAULT '{}'::jsonb,
  
  -- Thresholds
  thresholds JSONB DEFAULT '{}'::jsonb,
  
  status proposal_status DEFAULT 'draft',
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Decisions
CREATE TYPE decision_type AS ENUM ('object', 'consent', 'participate', 'steward', 'need_more_info');

CREATE TABLE decisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  proposal_id UUID REFERENCES proposals(id) NOT NULL,
  type decision_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, proposal_id) -- A user can only make one primary decision per proposal
);

-- 4. Participations
CREATE TYPE participation_status AS ENUM ('interested', 'confirmed', 'withdrawn');

CREATE TABLE participations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  proposal_id UUID REFERENCES proposals(id) NOT NULL,
  role TEXT,
  status participation_status DEFAULT 'interested',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, proposal_id)
);

-- 5. Stewardships
CREATE TYPE stewardship_status AS ENUM ('pending', 'accepted', 'withdrawn');

CREATE TABLE stewardships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  proposal_id UUID REFERENCES proposals(id) NOT NULL,
  status stewardship_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, proposal_id)
);

-- 6. Comments (Questions)
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  proposal_id UUID REFERENCES proposals(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Setup Row Level Security (RLS) policies (Basic Examples)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stewardships ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to proposals and users
CREATE POLICY "Public profiles are viewable by everyone." ON users FOR SELECT USING (true);
CREATE POLICY "Proposals are viewable by everyone." ON proposals FOR SELECT USING (true);
CREATE POLICY "Comments are viewable by everyone." ON comments FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Users can insert their own profile." ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Authenticated users can create proposals." ON proposals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can create comments." ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can make decisions." ON decisions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can join participations." ON participations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can request stewardship." ON stewardships FOR INSERT WITH CHECK (auth.uid() = user_id);
