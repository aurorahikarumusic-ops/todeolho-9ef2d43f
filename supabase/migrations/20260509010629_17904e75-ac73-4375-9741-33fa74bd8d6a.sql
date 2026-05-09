-- Drop tables if they exist (cascading to remove dependencies, functions and policies)
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.families CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.redemption_requests CASCADE;
DROP TABLE IF EXISTS public.rate_limit_log CASCADE;
DROP TABLE IF EXISTS public.murals CASCADE;
DROP TABLE IF EXISTS public.pix_transactions CASCADE;

-- Drop custom functions
DROP FUNCTION IF EXISTS public.get_user_family_id CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.check_rate_limit CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_rate_limits CASCADE;
