
-- 1. Clean all public tables
DELETE FROM public.pearl_reactions;
DELETE FROM public.pearl_posts;
DELETE FROM public.grandma_suggestions;
DELETE FROM public.achievements;
DELETE FROM public.tasks;
DELETE FROM public.events;
DELETE FROM public.daily_missions;
DELETE FROM public.confessions;
DELETE FROM public.mom_ratings;
DELETE FROM public.monthly_challenges;
DELETE FROM public.push_subscriptions;
DELETE FROM public.whatsapp_message_log;
DELETE FROM public.whatsapp_subscriptions;
DELETE FROM public.ranking_group_members;
DELETE FROM public.ranking_groups;
DELETE FROM public.children;
DELETE FROM public.profiles;

-- 2. Delete all auth users
DELETE FROM auth.users;

-- 3. Create fake users
DO $$
DECLARE
  family1_id uuid := gen_random_uuid();
  family2_id uuid := gen_random_uuid();
  maria_id uuid := gen_random_uuid();
  joao_id uuid := gen_random_uuid();
  lourdes_id uuid := gen_random_uuid();
  ana_id uuid := gen_random_uuid();
  pedro_id uuid := gen_random_uuid();
  carminha_id uuid := gen_random_uuid();
  hashed_pw text;
BEGIN
  hashed_pw := crypt('teste123', gen_salt('bf'));

  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token)
  VALUES
    (maria_id, '00000000-0000-0000-0000-000000000000', 'maria@teste.com', hashed_pw, now(), '{"display_name":"Maria Silva","role":"mae"}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
    (joao_id, '00000000-0000-0000-0000-000000000000', 'joao@teste.com', hashed_pw, now(), '{"display_name":"João Silva","role":"pai"}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
    (lourdes_id, '00000000-0000-0000-0000-000000000000', 'lourdes@teste.com', hashed_pw, now(), '{"display_name":"Dona Lourdes","role":"avo"}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
    (ana_id, '00000000-0000-0000-0000-000000000000', 'ana@teste.com', hashed_pw, now(), '{"display_name":"Ana Santos","role":"mae"}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
    (pedro_id, '00000000-0000-0000-0000-000000000000', 'pedro@teste.com', hashed_pw, now(), '{"display_name":"Pedro Santos","role":"pai"}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
    (carminha_id, '00000000-0000-0000-0000-000000000000', 'carminha@teste.com', hashed_pw, now(), '{"display_name":"Vó Carminha","role":"avo"}'::jsonb, 'authenticated', 'authenticated', now(), now(), '');

  INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), maria_id, maria_id::text, 'email', jsonb_build_object('sub', maria_id::text, 'email', 'maria@teste.com'), now(), now(), now()),
    (gen_random_uuid(), joao_id, joao_id::text, 'email', jsonb_build_object('sub', joao_id::text, 'email', 'joao@teste.com'), now(), now(), now()),
    (gen_random_uuid(), lourdes_id, lourdes_id::text, 'email', jsonb_build_object('sub', lourdes_id::text, 'email', 'lourdes@teste.com'), now(), now(), now()),
    (gen_random_uuid(), ana_id, ana_id::text, 'email', jsonb_build_object('sub', ana_id::text, 'email', 'ana@teste.com'), now(), now(), now()),
    (gen_random_uuid(), pedro_id, pedro_id::text, 'email', jsonb_build_object('sub', pedro_id::text, 'email', 'pedro@teste.com'), now(), now(), now()),
    (gen_random_uuid(), carminha_id, carminha_id::text, 'email', jsonb_build_object('sub', carminha_id::text, 'email', 'carminha@teste.com'), now(), now(), now());

  -- Update profiles (created by trigger)
  UPDATE public.profiles SET family_id = family1_id, points = 850, streak_days = 12 WHERE user_id = maria_id;
  UPDATE public.profiles SET family_id = family1_id, points = 620, streak_days = 8 WHERE user_id = joao_id;
  UPDATE public.profiles SET family_id = family1_id, points = 200, streak_days = 5 WHERE user_id = lourdes_id;
  UPDATE public.profiles SET family_id = family2_id, points = 720, streak_days = 15 WHERE user_id = ana_id;
  UPDATE public.profiles SET family_id = family2_id, points = 480, streak_days = 6 WHERE user_id = pedro_id;
  UPDATE public.profiles SET family_id = family2_id, points = 150, streak_days = 3 WHERE user_id = carminha_id;

  -- Tasks (using valid categories: school, health, home, finances, fun)
  INSERT INTO public.tasks (family_id, created_by, assigned_to, title, description, category, points, urgency, completed_at)
  VALUES
    (family1_id, maria_id, joao_id, 'Dar banho nas crianças', 'Banho completo com shampoo', 'health', 60, 'alta', now() - interval '1 day'),
    (family1_id, maria_id, joao_id, 'Preparar lanche da escola', 'Sanduíche natural + suco', 'school', 40, 'normal', now() - interval '2 days'),
    (family1_id, maria_id, joao_id, 'Levar no pediatra', 'Consulta de rotina às 14h', 'health', 80, 'urgente', NULL),
    (family1_id, maria_id, joao_id, 'Arrumar o quarto', 'Trocar lençol e organizar brinquedos', 'home', 50, 'normal', NULL),
    (family1_id, maria_id, joao_id, 'Buscar na escola', 'Saída às 17h30', 'school', 30, 'alta', now() - interval '3 hours'),
    (family2_id, ana_id, pedro_id, 'Fazer compras do mês', 'Lista no app de notas', 'home', 70, 'normal', now() - interval '5 hours'),
    (family2_id, ana_id, pedro_id, 'Levar ao parque', 'Pelo menos 1 hora brincando', 'fun', 30, 'normal', NULL),
    (family2_id, ana_id, pedro_id, 'Contar história antes de dormir', 'Livro novo da biblioteca', 'fun', 40, 'normal', now() - interval '1 day');

  -- Grandma suggestions
  INSERT INTO public.grandma_suggestions (family_id, user_id, title, description, suggestion_type, status)
  VALUES
    (family1_id, lourdes_id, 'Criança precisa de sopa!', 'Na minha época todo mundo tomava sopa de legumes todo dia', 'tarefa', 'pendente'),
    (family1_id, lourdes_id, 'Agasalhar o neto', 'Tá frio lá fora, bota um casaco nessa criança!', 'palpite', 'aceito'),
    (family1_id, lourdes_id, 'Tirar o celular da criança', 'Criança tem que brincar na rua, não ficar no celular', 'palpite', 'recusado'),
    (family2_id, carminha_id, 'Dar chá de camomila', 'Pra criança dormir melhor, chá de camomila resolve tudo', 'tarefa', 'pendente'),
    (family2_id, carminha_id, 'Levar na missa domingo', 'Faz tempo que não vão, tá precisando', 'evento', 'ignorado');

  -- Achievements
  INSERT INTO public.achievements (user_id, badge_key, badge_name, badge_emoji)
  VALUES
    (joao_id, 'first_task', 'Primeira Tarefa', '🎯'),
    (joao_id, 'streak_7', 'Sequência de 7 dias', '🔥'),
    (pedro_id, 'first_task', 'Primeira Tarefa', '🎯'),
    (maria_id, 'task_master', 'Mestre das Tarefas', '👑'),
    (ana_id, 'task_master', 'Mestre das Tarefas', '👑');

  -- Children
  INSERT INTO public.children (family_id, name, birth_date)
  VALUES
    (family1_id, 'Lucas Silva', '2020-03-15'),
    (family1_id, 'Sofia Silva', '2022-08-20'),
    (family2_id, 'Miguel Santos', '2021-11-10');

END $$;
