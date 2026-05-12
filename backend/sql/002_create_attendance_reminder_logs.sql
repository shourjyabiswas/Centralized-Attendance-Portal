create extension if not exists pgcrypto;

create table if not exists attendance_reminder_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references attendance_sessions(id) on delete cascade,
  teacher_id uuid references teacher_profiles(id) on delete set null,
  class_section_id uuid references class_sections(id) on delete set null,
  reminder_type text not null default 'attendance_missing_3h',
  sent_at timestamptz not null default now()
);

create unique index if not exists attendance_reminder_logs_unique
  on attendance_reminder_logs(session_id);
