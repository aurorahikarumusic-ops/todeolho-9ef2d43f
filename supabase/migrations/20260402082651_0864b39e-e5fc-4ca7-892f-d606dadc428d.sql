DROP TRIGGER IF EXISTS on_new_task_notify ON public.tasks;
DROP FUNCTION IF EXISTS public.notify_on_new_task();