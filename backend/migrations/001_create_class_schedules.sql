-- Create class_schedules table
CREATE TABLE IF NOT EXISTS public.class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_section_id UUID NOT NULL REFERENCES public.class_sections(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  day VARCHAR(20) NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_section_id, day, time_slot)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_class_schedules_class_section_id 
ON public.class_schedules(class_section_id);

CREATE INDEX IF NOT EXISTS idx_class_schedules_course_id 
ON public.class_schedules(course_id);

CREATE INDEX IF NOT EXISTS idx_class_schedules_day_time 
ON public.class_schedules(day, time_slot);

-- Enable RLS
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to insert, update, delete
CREATE POLICY "Admins can manage schedules" ON public.class_schedules
  USING ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin');

-- Policy: Allow anyone to read
CREATE POLICY "Anyone can view schedules" ON public.class_schedules
  FOR SELECT
  USING (true);
