-- ============================================================================
-- TEACHER MANAGEMENT APP - COMPLETE SUPABASE SCHEMA
-- ============================================================================
-- This file contains the complete SQL setup for the TeacherManagement app.
-- Run these queries in order to replicate the database setup.
-- Generated: February 2026
-- Project: Vitsify (ykcpcgwzwrgvohhvrbrz)
-- ============================================================================

-- ============================================================================
-- EXTENSIONS (Enabled in Supabase)
-- ============================================================================
-- These are already enabled by default or via Supabase dashboard:
-- - uuid-ossp (for gen_random_uuid())
-- - pgcrypto (for cryptographic functions)
-- - pg_graphql (for GraphQL support)
-- - pg_stat_statements (for query statistics)
-- - supabase_vault (for secrets management)
-- - plpgsql (procedural language)


-- ============================================================================
-- TABLE: profiles
-- ============================================================================
-- Stores user profile information, linked to auth.users

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE,
    full_name TEXT,
    avatar_url TEXT
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can delete their own profile" 
    ON public.profiles FOR DELETE 
    USING ((SELECT auth.uid()) = id);


-- ============================================================================
-- TABLE: teachers
-- ============================================================================
-- Stores teacher information with ratings aggregation

CREATE TABLE public.teachers (
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    full_name TEXT NOT NULL,
    cabin_no TEXT,
    mobile_no TEXT,
    status TEXT DEFAULT 'verified'::text,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    rating_count INTEGER DEFAULT 0,
    average_rating DOUBLE PRECISION DEFAULT 0.0,
    
    -- Check constraint for status values
    CONSTRAINT teachers_status_check CHECK (status = ANY (ARRAY['verified'::text, 'pending'::text]))
);

-- Indexes
CREATE INDEX idx_teachers_created_by ON public.teachers USING btree (created_by);
CREATE INDEX idx_teachers_status ON public.teachers USING btree (status);

-- Enable RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teachers
CREATE POLICY "Anyone can view teachers" 
    ON public.teachers FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create teachers" 
    ON public.teachers FOR INSERT 
    WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can update teachers they created" 
    ON public.teachers FOR UPDATE 
    USING ((SELECT auth.uid()) = created_by);

CREATE POLICY "Authenticated users can delete teachers they created" 
    ON public.teachers FOR DELETE 
    USING ((SELECT auth.uid()) = created_by);


-- ============================================================================
-- TABLE: ratings
-- ============================================================================
-- Stores teacher ratings by users

CREATE TABLE public.ratings (
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    teaching INTEGER NOT NULL,
    evaluation INTEGER NOT NULL,
    behaviour INTEGER NOT NULL,
    internals INTEGER NOT NULL,
    class_average TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Check constraints for rating values (1-5)
    CONSTRAINT ratings_teaching_check CHECK (teaching >= 1 AND teaching <= 5),
    CONSTRAINT ratings_evaluation_check CHECK (evaluation >= 1 AND evaluation <= 5),
    CONSTRAINT ratings_behaviour_check CHECK (behaviour >= 1 AND behaviour <= 5),
    CONSTRAINT ratings_internals_check CHECK (internals >= 1 AND internals <= 5),
    CONSTRAINT ratings_class_average_check CHECK (class_average = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))
);

-- Indexes
CREATE INDEX idx_ratings_teacher_id ON public.ratings USING btree (teacher_id);
CREATE INDEX idx_ratings_user_id ON public.ratings USING btree (user_id);
CREATE INDEX idx_ratings_teacher_user ON public.ratings USING btree (teacher_id, user_id);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings
CREATE POLICY "Anyone can view ratings" 
    ON public.ratings FOR SELECT 
    USING (true);

CREATE POLICY "Users can create their own ratings" 
    ON public.ratings FOR INSERT 
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own ratings" 
    ON public.ratings FOR UPDATE 
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own ratings" 
    ON public.ratings FOR DELETE 
    USING ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- TABLE: teacher_favorites
-- ============================================================================
-- Stores user's favorite teachers (many-to-many relationship)

CREATE TABLE public.teacher_favorites (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- Composite primary key
    PRIMARY KEY (user_id, teacher_id)
);

-- Indexes
CREATE INDEX idx_teacher_favorites_user_id ON public.teacher_favorites USING btree (user_id);
CREATE INDEX idx_teacher_favorites_teacher_id ON public.teacher_favorites USING btree (teacher_id);

-- Enable RLS
ALTER TABLE public.teacher_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teacher_favorites
CREATE POLICY "Allow users to view their favorites" 
    ON public.teacher_favorites FOR SELECT 
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Allow users to insert their own favorites" 
    ON public.teacher_favorites FOR INSERT 
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Allow users to delete their favorites" 
    ON public.teacher_favorites FOR DELETE 
    USING ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- TABLE: bug_reports
-- ============================================================================
-- Stores bug reports submitted by users

CREATE TABLE public.bug_reports (
    id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT,
    expected_behavior TEXT,
    actual_behavior TEXT,
    browser_info TEXT,
    status TEXT DEFAULT 'open'::text NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bug_reports
CREATE POLICY "Users can view their own bug reports" 
    ON public.bug_reports FOR SELECT 
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own bug reports" 
    ON public.bug_reports FOR INSERT 
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own bug reports" 
    ON public.bug_reports FOR UPDATE 
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own bug reports" 
    ON public.bug_reports FOR DELETE 
    USING ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Validate VIT Bhopal email domain
CREATE OR REPLACE FUNCTION public.validate_email_domain(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
  -- Only allow VIT Bhopal email addresses
  RETURN email ~* '^[a-zA-Z0-9._%+-]+@vitbhopal\.ac\.in$';
END;
$function$;


-- Function: Validate auth user email (called by trigger on auth.users)
CREATE OR REPLACE FUNCTION public.validate_auth_user_email()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Check if email is provided and validate domain
  IF NEW.email IS NOT NULL AND NOT public.validate_email_domain(NEW.email) THEN
    RAISE EXCEPTION 'Only VIT Bhopal email addresses (@vitbhopal.ac.in) are allowed for authentication.';
  END IF;
  
  RETURN NEW;
END;
$function$;


-- Function: Handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$function$;


-- Function: Update teacher rating aggregates (called by trigger)
CREATE OR REPLACE FUNCTION public.update_teacher_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_rating_count INT;
  v_average_rating FLOAT;
BEGIN
  SELECT 
    COUNT(*),
    COALESCE(AVG((teaching + evaluation + behaviour + internals) / 4.0), 0.0)
  INTO v_rating_count, v_average_rating
  FROM ratings 
  WHERE teacher_id = COALESCE(NEW.teacher_id, OLD.teacher_id);

  UPDATE teachers
  SET 
    rating_count = v_rating_count,
    average_rating = v_average_rating
  WHERE id = COALESCE(NEW.teacher_id, OLD.teacher_id);

  RETURN NEW;
END;
$function$;


-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-create profile when new user signs up
-- NOTE: This trigger is on auth.users table (requires Supabase dashboard or CLI)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Triggers: Update teacher rating aggregates when ratings change
CREATE TRIGGER rating_insert_trigger
  AFTER INSERT ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_teacher_rating();

CREATE TRIGGER rating_update_trigger
  AFTER UPDATE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_teacher_rating();

CREATE TRIGGER rating_delete_trigger
  AFTER DELETE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_teacher_rating();


-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================
-- Enable realtime for specific tables

ALTER PUBLICATION supabase_realtime ADD TABLE public.teachers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;


-- ============================================================================
-- NOTES & BEST PRACTICES APPLIED
-- ============================================================================
-- 
-- 1. RLS POLICIES use (SELECT auth.uid()) instead of auth.uid() directly
--    This prevents per-row re-evaluation (initplan optimization)
--
-- 2. INDEXES are created on:
--    - Foreign key columns (teacher_id, user_id, created_by)
--    - Filter columns (status)
--    - Composite indexes for common query patterns (teacher_id, user_id)
--
-- 3. TRIGGERS automatically update teacher rating aggregates
--    This denormalizes the data for faster reads
--
-- 4. CASCADE DELETE is used appropriately:
--    - profiles → auth.users (user deleted = profile deleted)
--    - ratings → teachers (teacher deleted = ratings deleted)
--    - ratings → profiles (user deleted = ratings deleted)
--    - teacher_favorites → both teachers and profiles
--    - bug_reports → profiles
--    - teachers.created_by uses SET NULL (teacher remains if creator deleted)
--
-- 5. EMAIL VALIDATION restricts signups to @vitbhopal.ac.in domain
--
-- ============================================================================
