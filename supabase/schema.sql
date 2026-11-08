-- Ethan Code v1.0 pre-integration schema
-- Apply only after Ethan ID/backend integration planning.
create table if not exists public.ethan_code_tracks (
 id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
 description text, is_published boolean not null default false, created_at timestamptz default now()
);
create table if not exists public.ethan_code_lessons (
 id uuid primary key default gen_random_uuid(), track_id uuid references public.ethan_code_tracks(id) on delete cascade,
 title text not null, content jsonb not null default '{}'::jsonb, sort_order int default 0,
 is_published boolean not null default false, created_at timestamptz default now()
);
create table if not exists public.ethan_code_challenges (
 id uuid primary key default gen_random_uuid(), lesson_id uuid references public.ethan_code_lessons(id) on delete set null,
 title text not null, instructions text not null, difficulty text default 'beginner',
 test_spec jsonb not null default '{}'::jsonb, is_published boolean not null default false
);
create table if not exists public.ethan_code_progress (
 user_id uuid not null, lesson_id uuid references public.ethan_code_lessons(id) on delete cascade,
 completed_at timestamptz default now(), primary key(user_id,lesson_id)
);
create table if not exists public.ethan_code_submissions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null,
 challenge_id uuid references public.ethan_code_challenges(id) on delete cascade,
 status text not null default 'submitted', score numeric, submitted_at timestamptz default now()
);
create table if not exists public.ethan_code_projects (
 id uuid primary key default gen_random_uuid(), user_id uuid not null, title text not null,
 description text, project_data jsonb not null default '{}'::jsonb, created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.ethan_code_tracks enable row level security;
alter table public.ethan_code_lessons enable row level security;
alter table public.ethan_code_challenges enable row level security;
alter table public.ethan_code_progress enable row level security;
alter table public.ethan_code_submissions enable row level security;
alter table public.ethan_code_projects enable row level security;
-- Do not add permissive anonymous write policies. Bind user_id to Ethan ID auth.uid()
-- and use authorised admin roles for publishing/authoring during integration.

create table if not exists public.ethan_code_assessments (
 id uuid primary key default gen_random_uuid(), track_id uuid references public.ethan_code_tracks(id) on delete cascade,
 title text not null, instructions text, pass_mark numeric, is_published boolean not null default false, created_at timestamptz default now()
);
create table if not exists public.ethan_code_assessment_attempts (
 id uuid primary key default gen_random_uuid(), assessment_id uuid references public.ethan_code_assessments(id) on delete cascade,
 user_id uuid not null, score numeric, status text not null default 'submitted', submitted_at timestamptz default now()
);
create table if not exists public.ethan_code_project_reviews (
 id uuid primary key default gen_random_uuid(), project_id uuid references public.ethan_code_projects(id) on delete cascade,
 reviewer_user_id uuid not null, feedback text, status text not null default 'reviewed', reviewed_at timestamptz default now()
);
alter table public.ethan_code_assessments enable row level security;
alter table public.ethan_code_assessment_attempts enable row level security;
alter table public.ethan_code_project_reviews enable row level security;

create table if not exists public.ethan_code_quiz_attempts (id uuid primary key default gen_random_uuid(),user_id uuid not null,lesson_id uuid references public.ethan_code_lessons(id) on delete set null,score numeric not null,max_score numeric not null,submitted_at timestamptz default now());
create table if not exists public.ethan_code_workspaces (id uuid primary key default gen_random_uuid(),user_id uuid not null,title text not null default 'My Workspace',html_code text,css_code text,js_code text,updated_at timestamptz default now());
alter table public.ethan_code_quiz_attempts enable row level security;
alter table public.ethan_code_workspaces enable row level security;

create table if not exists public.ethan_code_practicals (
 id uuid primary key default gen_random_uuid(), lesson_id uuid references public.ethan_code_lessons(id) on delete set null,
 title text not null, brief text not null, steps jsonb not null default '[]'::jsonb, checklist jsonb not null default '[]'::jsonb,
 is_published boolean not null default false, created_at timestamptz default now()
);
create table if not exists public.ethan_code_practical_submissions (
 id uuid primary key default gen_random_uuid(), practical_id uuid references public.ethan_code_practicals(id) on delete cascade,
 user_id uuid not null, submission_data jsonb not null default '{}'::jsonb, reflection text,
 status text not null default 'submitted', submitted_at timestamptz default now()
);
alter table public.ethan_code_practicals enable row level security;
alter table public.ethan_code_practical_submissions enable row level security;

create table if not exists public.ethan_code_lesson_versions (id uuid primary key default gen_random_uuid(),lesson_id uuid references public.ethan_code_lessons(id) on delete cascade,version_number int not null default 1,content jsonb not null default '{}'::jsonb,created_by uuid,created_at timestamptz default now(),unique(lesson_id,version_number));
alter table public.ethan_code_lesson_versions enable row level security;

-- Child-friendly classroom progression (production persistence after Ethan ID integration)
create table if not exists public.ethan_code_classroom_progress (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null,
 course_key text not null,
 lesson_key text not null,
 completed_at timestamptz default now(),
 unique(user_id, course_key, lesson_key)
);
alter table public.ethan_code_classroom_progress enable row level security;

create table if not exists public.ethan_code_learning_preferences (
 user_id uuid primary key, learning_path text, interests jsonb default '[]'::jsonb, updated_at timestamptz default now()
);
create table if not exists public.ethan_code_mission_progress (
 id uuid primary key default gen_random_uuid(), user_id uuid not null, mission_key text not null,
 stars int not null default 0, completed_at timestamptz, unique(user_id,mission_key)
);
alter table public.ethan_code_learning_preferences enable row level security;
alter table public.ethan_code_mission_progress enable row level security;
