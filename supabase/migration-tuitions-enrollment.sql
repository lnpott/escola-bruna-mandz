alter table public.tuitions add column if not exists enrollment_id text references public.enrollments(id);
