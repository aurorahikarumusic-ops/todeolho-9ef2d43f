
-- Tabela para rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  function_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para consultas rápidas
CREATE INDEX idx_rate_limit_lookup ON public.rate_limit_log (identifier, function_name, created_at DESC);

-- RLS habilitado mas sem políticas públicas (só service_role acessa)
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Função para limpar registros antigos (> 1 hora)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limit_log WHERE created_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;

-- Trigger para limpeza automática (a cada insert)
CREATE TRIGGER trg_cleanup_rate_limit
AFTER INSERT ON public.rate_limit_log
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_rate_limit_log();

-- Função de rate limiting (security definer)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_function_name text,
  p_max_requests int DEFAULT 10,
  p_window_seconds int DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_count int;
BEGIN
  -- Conta requisições na janela
  SELECT COUNT(*) INTO request_count
  FROM public.rate_limit_log
  WHERE identifier = p_identifier
    AND function_name = p_function_name
    AND created_at > now() - (p_window_seconds || ' seconds')::interval;

  -- Se excedeu, retorna false
  IF request_count >= p_max_requests THEN
    RETURN false;
  END IF;

  -- Registra a tentativa
  INSERT INTO public.rate_limit_log (identifier, function_name)
  VALUES (p_identifier, p_function_name);

  RETURN true;
END;
$$;
