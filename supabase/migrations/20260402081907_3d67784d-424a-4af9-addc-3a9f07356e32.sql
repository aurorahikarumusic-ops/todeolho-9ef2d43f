-- Create a function that calls the notify-new-task edge function via pg_net
CREATE OR REPLACE FUNCTION public.notify_on_new_task()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
  edge_url text;
  service_key text;
BEGIN
  -- Build the payload matching webhook format
  payload := jsonb_build_object(
    'type', 'INSERT',
    'record', row_to_json(NEW)::jsonb
  );

  -- Get the Supabase URL from config
  edge_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);

  -- Use pg_net to call edge function asynchronously
  PERFORM net.http_post(
    url := concat(
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'supabase_url' LIMIT 1),
      '/functions/v1/notify-new-task'
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', concat('Bearer ', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1))
    ),
    body := payload
  );

  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_new_task_notify
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_task();
