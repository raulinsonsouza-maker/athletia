-- =====================================================
-- SCRIPT DE INSERÇÃO EM LOTE DE EXERCÍCIOS DE PANTURRILHAS
-- Sistema: AthletIA - Produção
-- PostgreSQL 14+ (Debian VPS)
-- =====================================================
-- 
-- Este script insere 42 exercícios de panturrilhas no banco de dados
-- e associa corretamente os grupos musculares visuais.
--
-- IMPORTANTE: Execute este script em uma transação para garantir
-- atomicidade. Se houver erro, todas as inserções serão revertidas.
-- =====================================================

BEGIN;

-- =====================================================
-- TIMESTAMP DE LOTE (para rastreamento robusto)
-- =====================================================
-- Captura o timestamp exato antes da inserção
-- Isso permite rastrear todos os exercícios inseridos nesta execução
-- mesmo se o script demorar ou houver execuções simultâneas

DO $$
DECLARE
    v_timestamp_lote TIMESTAMP := NOW();
BEGIN
    -- Armazena o timestamp em uma variável de sessão
    PERFORM set_config('app.timestamp_lote', v_timestamp_lote::text, false);
    RAISE NOTICE 'Lote de inserção iniciado em: %', v_timestamp_lote;
END $$;

-- =====================================================
-- PASSO 0: HABILITAR EXTENSÕES NECESSÁRIAS (se não estiverem)
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
    ) THEN
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
        RAISE NOTICE 'Extensão pgcrypto habilitada.';
    ELSE
        RAISE NOTICE 'Extensão pgcrypto já está habilitada.';
    END IF;
END $$;

-- =====================================================
-- PASSO 1: VERIFICAÇÃO DE GRUPOS MUSCULARES
-- =====================================================

DO $$
DECLARE
    grupos_necessarios TEXT[] := ARRAY['Panturrilhas', 'Quadríceps', 'Posteriores de coxa', 'Glúteos'];
    grupo_nome TEXT;
    grupo_existe BOOLEAN;
    grupo_id UUID;
BEGIN
    FOREACH grupo_nome IN ARRAY grupos_necessarios
    LOOP
        SELECT EXISTS(
            SELECT 1 FROM grupos_musculares_visuais 
            WHERE LOWER(TRIM(nome)) = LOWER(TRIM(grupo_nome)) 
            AND ativo = true
        ) INTO grupo_existe;
        
        IF NOT grupo_existe THEN
            RAISE EXCEPTION 'Grupo muscular "%" não encontrado ou inativo na tabela grupos_musculares_visuais. Verifique antes de continuar.', grupo_nome;
        ELSE
            SELECT id INTO grupo_id
            FROM grupos_musculares_visuais 
            WHERE LOWER(TRIM(nome)) = LOWER(TRIM(grupo_nome)) 
            AND ativo = true
            LIMIT 1;
            RAISE NOTICE 'Grupo "%" encontrado (ID: %)', grupo_nome, grupo_id;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Todos os grupos musculares necessários foram encontrados.';
END $$;

-- =====================================================
-- PASSO 2: INSERÇÃO DOS EXERCÍCIOS
-- =====================================================

INSERT INTO exercicios (
    id,
    nome,
    grupo_muscular_principal,
    sinergistas,
    descricao,
    execucao_tecnica,
    erros_comuns,
    imagem_url,
    carga_inicial_sugerida,
    rpe_sugerido,
    equipamento_necessario,
    sem_equipamento,
    nivel_dificuldade,
    alternativas,
    ativo,
    created_at,
    updated_at
) VALUES
-- EXERCÍCIOS DE FORÇA - PANTURRILHAS
(
    gen_random_uuid(),
    'Elevação de Panturrilha em Pé (Peso Corporal)',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício fundamental para desenvolvimento das panturrilhas utilizando apenas o peso corporal.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Apoie as pontas dos pés em um degrau ou superfície elevada' || CHR(10) || '3. Deixe os calcanhares pendurados abaixo do nível dos dedos' || CHR(10) || '4. Contraia as panturrilhas e eleve o corpo até ficar na ponta dos pés' || CHR(10) || '5. Mantenha a contração máxima por 1-2 segundos no topo' || CHR(10) || '6. Desça lentamente até sentir alongamento completo nas panturrilhas' || CHR(10) || '7. Repita o movimento de forma controlada',
    ARRAY['Não descer completamente', 'Usar impulso do joelho', 'Perder equilíbrio', 'Movimento muito rápido']::text[],
    NULL,
    0.0,
    6,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha em Pé com Halteres',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício de força para panturrilhas utilizando halteres para adicionar resistência.',
    '1. Segure um halter em cada mão ao lado do corpo' || CHR(10) || '2. Fique em pé com os pés na largura dos ombros' || CHR(10) || '3. Apoie as pontas dos pés em um degrau ou superfície elevada' || CHR(10) || '4. Mantenha os braços estendidos ao longo do corpo' || CHR(10) || '5. Contraia as panturrilhas e eleve o corpo até ficar na ponta dos pés' || CHR(10) || '6. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '7. Desça lentamente até sentir alongamento completo' || CHR(10) || '8. Execute o movimento de forma controlada e constante',
    ARRAY['Usar carga excessiva', 'Não descer completamente', 'Arquear as costas', 'Movimento balançado']::text[],
    NULL,
    10.0,
    7,
    ARRAY['Halteres']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha com Faixa Elástica',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício de resistência para panturrilhas utilizando faixa elástica para tensão constante.',
    '1. Coloque a faixa elástica ao redor da parte superior dos pés' || CHR(10) || '2. Fique em pé com os pés na largura dos ombros' || CHR(10) || '3. Segure as pontas da faixa com as mãos para criar tensão' || CHR(10) || '4. Apoie as pontas dos pés em uma superfície elevada' || CHR(10) || '5. Contraia as panturrilhas e eleve o corpo contra a resistência da faixa' || CHR(10) || '6. Mantenha a contração no topo por 1-2 segundos' || CHR(10) || '7. Desça lentamente controlando a resistência da faixa' || CHR(10) || '8. Mantenha tensão constante durante todo o movimento',
    ARRAY['Não manter tensão constante', 'Faixa muito solta', 'Perder equilíbrio', 'Movimento incompleto']::text[],
    NULL,
    0.0,
    6,
    ARRAY['Faixa Elástica']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha Sentado com Barra',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício que enfatiza o músculo sóleo das panturrilhas, realizado na posição sentada.',
    '1. Sente-se em um banco com os pés apoiados em uma plataforma elevada' || CHR(10) || '2. Coloque a barra sobre as coxas, próximo aos joelhos' || CHR(10) || '3. Ajuste a barra com peso adequado' || CHR(10) || '4. Mantenha os joelhos flexionados em 90 graus' || CHR(10) || '5. Apoie apenas as pontas dos pés na plataforma' || CHR(10) || '6. Contraia as panturrilhas e eleve os calcanhares o máximo possível' || CHR(10) || '7. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '8. Desça lentamente até sentir alongamento completo no sóleo' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Não descer completamente', 'Barra deslizando', 'Joelhos estendendo']::text[],
    NULL,
    20.0,
    7,
    ARRAY['Barra', 'Banco']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha no Leg Press',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício de panturrilhas realizado na máquina leg press com maior estabilidade.',
    '1. Sente-se na máquina leg press e ajuste a posição' || CHR(10) || '2. Coloque apenas as pontas dos pés na parte inferior da plataforma' || CHR(10) || '3. Deixe os calcanhares pendurados abaixo da plataforma' || CHR(10) || '4. Desbloqueie a máquina e mantenha as pernas estendidas' || CHR(10) || '5. Contraia as panturrilhas e empurre a plataforma com as pontas dos pés' || CHR(10) || '6. Estenda completamente os tornozelos até ficar na ponta dos pés' || CHR(10) || '7. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '8. Desça lentamente até sentir alongamento completo' || CHR(10) || '9. Execute o movimento de forma controlada e constante',
    ARRAY['Usar carga excessiva', 'Flexionar os joelhos', 'Não descer completamente', 'Movimento rápido demais']::text[],
    NULL,
    50.0,
    7,
    ARRAY['Máquina Leg Press']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha no Hack Squat',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício de panturrilhas realizado na máquina hack squat com maior controle.',
    '1. Posicione-se na máquina hack squat' || CHR(10) || '2. Coloque apenas as pontas dos pés na parte inferior da plataforma' || CHR(10) || '3. Deixe os calcanhares pendurados abaixo da plataforma' || CHR(10) || '4. Mantenha as pernas estendidas e o tronco apoiado' || CHR(10) || '5. Contraia as panturrilhas e empurre a plataforma com as pontas dos pés' || CHR(10) || '6. Estenda completamente os tornozelos até ficar na ponta dos pés' || CHR(10) || '7. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '8. Desça lentamente até sentir alongamento completo' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Flexionar os joelhos', 'Não descer completamente', 'Perder alinhamento']::text[],
    NULL,
    40.0,
    7,
    ARRAY['Máquina Hack Squat']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha Sentado na Máquina',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício que enfatiza o sóleo utilizando máquina específica para panturrilhas.',
    '1. Sente-se na máquina de panturrilha sentada' || CHR(10) || '2. Ajuste o apoio de coxas para conforto' || CHR(10) || '3. Coloque apenas as pontas dos pés na plataforma' || CHR(10) || '4. Deixe os calcanhares pendurados abaixo da plataforma' || CHR(10) || '5. Ajuste a carga adequada' || CHR(10) || '6. Contraia as panturrilhas e eleve os calcanhares o máximo possível' || CHR(10) || '7. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '8. Desça lentamente até sentir alongamento completo' || CHR(10) || '9. Execute o movimento de forma controlada e constante',
    ARRAY['Usar carga excessiva', 'Não descer completamente', 'Movimento rápido', 'Perder controle']::text[],
    NULL,
    30.0,
    7,
    ARRAY['Máquina de Panturrilha']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha Unilateral',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício unilateral que permite trabalhar cada panturrilha individualmente com maior foco.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Apoie apenas a ponta de um pé em uma superfície elevada' || CHR(10) || '3. Levante a outra perna ou mantenha-a levemente flexionada' || CHR(10) || '4. Deixe o calcanhar do pé de apoio pendurado abaixo do nível dos dedos' || CHR(10) || '5. Segure em algo para manter o equilíbrio se necessário' || CHR(10) || '6. Contraia a panturrilha e eleve o corpo até ficar na ponta do pé' || CHR(10) || '7. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '8. Desça lentamente até sentir alongamento completo' || CHR(10) || '9. Complete todas as repetições de um lado antes de trocar',
    ARRAY['Perder equilíbrio', 'Não descer completamente', 'Usar impulso', 'Movimento muito rápido']::text[],
    NULL,
    0.0,
    6,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha Unilateral no Hack Squat',
    'Panturrilhas',
    ARRAY[]::text[],
    'Variação unilateral na máquina hack squat para maior isolamento e correção de assimetrias.',
    '1. Posicione-se na máquina hack squat' || CHR(10) || '2. Coloque apenas a ponta de um pé na parte inferior da plataforma' || CHR(10) || '3. Levante a outra perna ou mantenha-a levemente flexionada' || CHR(10) || '4. Deixe o calcanhar pendurado abaixo da plataforma' || CHR(10) || '5. Mantenha a perna estendida e o tronco apoiado' || CHR(10) || '6. Contraia a panturrilha e empurre a plataforma com a ponta do pé' || CHR(10) || '7. Estenda completamente o tornozelo até ficar na ponta do pé' || CHR(10) || '8. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '9. Desça lentamente até sentir alongamento completo' || CHR(10) || '10. Complete todas as repetições de um lado antes de trocar',
    ARRAY['Usar carga excessiva', 'Não descer completamente', 'Perder alinhamento', 'Flexionar o joelho']::text[],
    NULL,
    20.0,
    7,
    ARRAY['Máquina Hack Squat']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha Inclinada',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício clássico de panturrilhas realizado com o tronco inclinado para frente, aumentando o alongamento.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Incline o tronco para frente até ficar paralelo ao chão' || CHR(10) || '3. Apoie as mãos em uma superfície estável para apoio' || CHR(10) || '4. Apoie apenas as pontas dos pés em uma superfície elevada' || CHR(10) || '5. Deixe os calcanhares pendurados abaixo do nível dos dedos' || CHR(10) || '6. Mantenha as pernas estendidas e o tronco paralelo ao chão' || CHR(10) || '7. Contraia as panturrilhas e eleve o corpo até ficar na ponta dos pés' || CHR(10) || '8. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '9. Desça lentamente até sentir alongamento completo' || CHR(10) || '10. Execute o movimento de forma controlada',
    ARRAY['Arquear as costas', 'Flexionar os joelhos', 'Não descer completamente', 'Perder alinhamento do tronco']::text[],
    NULL,
    0.0,
    7,
    ARRAY['Peso Corporal']::text[],
    true,
    'Intermediário',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha Inclinada na Máquina',
    'Panturrilhas',
    ARRAY[]::text[],
    'Variação da elevação de panturrilha com tronco inclinado, utilizando máquina específica para maior carga e controle.',
    '1. Posicione-se na máquina de panturrilha inclinada' || CHR(10) || '2. Ajuste o apoio de quadril para conforto' || CHR(10) || '3. Coloque apenas as pontas dos pés na plataforma' || CHR(10) || '4. Deixe os calcanhares pendurados abaixo da plataforma' || CHR(10) || '5. Mantenha o tronco paralelo ao chão e as pernas estendidas' || CHR(10) || '6. Ajuste a carga adequada' || CHR(10) || '7. Contraia as panturrilhas e eleve o corpo até ficar na ponta dos pés' || CHR(10) || '8. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '9. Desça lentamente até sentir alongamento completo' || CHR(10) || '10. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Não descer completamente', 'Arquear as costas', 'Flexionar os joelhos']::text[],
    NULL,
    30.0,
    7,
    ARRAY['Máquina de Panturrilha']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha na Máquina de Supino',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício criativo utilizando a máquina de supino para trabalhar panturrilhas.',
    '1. Posicione-se em pé na frente da máquina de supino' || CHR(10) || '2. Coloque apenas as pontas dos pés na base da máquina' || CHR(10) || '3. Deixe os calcanhares pendurados abaixo da base' || CHR(10) || '4. Segure na estrutura da máquina para apoio e equilíbrio' || CHR(10) || '5. Mantenha as pernas estendidas e o tronco ereto' || CHR(10) || '6. Contraia as panturrilhas e eleve o corpo até ficar na ponta dos pés' || CHR(10) || '7. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '8. Desça lentamente até sentir alongamento completo' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Perder equilíbrio', 'Não descer completamente', 'Usar impulso', 'Máquina instável']::text[],
    NULL,
    0.0,
    6,
    ARRAY['Máquina de Supino']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha em Pé com Barra',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício de força para panturrilhas utilizando barra para maior carga.',
    '1. Coloque a barra nas costas como em um agachamento' || CHR(10) || '2. Fique em pé com os pés na largura dos ombros' || CHR(10) || '3. Apoie apenas as pontas dos pés em um degrau ou superfície elevada' || CHR(10) || '4. Deixe os calcanhares pendurados abaixo do nível dos dedos' || CHR(10) || '5. Mantenha a barra estável nas costas' || CHR(10) || '6. Contraia as panturrilhas e eleve o corpo até ficar na ponta dos pés' || CHR(10) || '7. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '8. Desça lentamente até sentir alongamento completo' || CHR(10) || '9. Execute o movimento de forma controlada e estável',
    ARRAY['Usar carga excessiva', 'Não descer completamente', 'Perder equilíbrio', 'Barra deslizando']::text[],
    NULL,
    30.0,
    8,
    ARRAY['Barra']::text[],
    false,
    'Avançado',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha Inclinada com Parceiro',
    'Panturrilhas',
    ARRAY[]::text[],
    'Variação da elevação de panturrilha com tronco inclinado, utilizando parceiro para adicionar resistência.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Incline o tronco para frente até ficar paralelo ao chão' || CHR(10) || '3. Apoie as mãos em uma superfície estável' || CHR(10) || '4. Apoie apenas as pontas dos pés em uma superfície elevada' || CHR(10) || '5. Peça ao parceiro para sentar ou apoiar peso nas suas costas' || CHR(10) || '6. Deixe os calcanhares pendurados abaixo do nível dos dedos' || CHR(10) || '7. Contraia as panturrilhas e eleve o corpo até ficar na ponta dos pés' || CHR(10) || '8. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '9. Desça lentamente até sentir alongamento completo' || CHR(10) || '10. Execute o movimento de forma controlada',
    ARRAY['Peso excessivo do parceiro', 'Não descer completamente', 'Arquear as costas', 'Perder equilíbrio']::text[],
    NULL,
    0.0,
    7,
    ARRAY['Peso Corporal']::text[],
    false,
    'Avançado',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha em Agachamento Isométrico',
    'Panturrilhas',
    ARRAY['Quadríceps', 'Glúteos']::text[],
    'Exercício funcional que combina agachamento isométrico com elevação de panturrilhas.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Desça para posição de agachamento e mantenha a posição' || CHR(10) || '3. Mantenha as coxas paralelas ao chão' || CHR(10) || '4. Mantenha o tronco ereto e o core contraído' || CHR(10) || '5. A partir desta posição, contraia as panturrilhas e eleve os calcanhares' || CHR(10) || '6. Mantenha a elevação por 1-2 segundos' || CHR(10) || '7. Desça os calcanhares mantendo a posição de agachamento' || CHR(10) || '8. Continue alternando entre elevar e descer os calcanhares' || CHR(10) || '9. Mantenha a posição de agachamento durante todo o exercício',
    ARRAY['Perder a posição de agachamento', 'Arquear as costas', 'Joelhos indo para dentro', 'Movimento descontrolado']::text[],
    NULL,
    0.0,
    7,
    ARRAY['Peso Corporal']::text[],
    true,
    'Avançado',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha Sentado com Peso',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício que enfatiza o sóleo utilizando halteres ou anilhas na posição sentada.',
    '1. Sente-se em um banco com os pés apoiados em uma plataforma elevada' || CHR(10) || '2. Coloque um halter ou anilha sobre as coxas, próximo aos joelhos' || CHR(10) || '3. Mantenha os joelhos flexionados em 90 graus' || CHR(10) || '4. Apoie apenas as pontas dos pés na plataforma' || CHR(10) || '5. Deixe os calcanhares pendurados abaixo da plataforma' || CHR(10) || '6. Contraia as panturrilhas e eleve os calcanhares o máximo possível' || CHR(10) || '7. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '8. Desça lentamente até sentir alongamento completo no sóleo' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Não descer completamente', 'Peso deslizando', 'Joelhos estendendo']::text[],
    NULL,
    15.0,
    7,
    ARRAY['Halteres', 'Anilhas']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha no Leg Press Sentado',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício de panturrilhas realizado na máquina leg press na posição sentada.',
    '1. Sente-se na máquina leg press e ajuste a posição' || CHR(10) || '2. Coloque apenas as pontas dos pés na parte inferior da plataforma' || CHR(10) || '3. Deixe os calcanhares pendurados abaixo da plataforma' || CHR(10) || '4. Mantenha as pernas estendidas e o tronco apoiado' || CHR(10) || '5. Desbloqueie a máquina' || CHR(10) || '6. Contraia as panturrilhas e empurre a plataforma com as pontas dos pés' || CHR(10) || '7. Estenda completamente os tornozelos até ficar na ponta dos pés' || CHR(10) || '8. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '9. Desça lentamente até sentir alongamento completo' || CHR(10) || '10. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Flexionar os joelhos', 'Não descer completamente', 'Perder alinhamento']::text[],
    NULL,
    40.0,
    7,
    ARRAY['Máquina Leg Press']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha Unilateral no Leg Press',
    'Panturrilhas',
    ARRAY[]::text[],
    'Variação unilateral na máquina leg press para maior isolamento e correção de assimetrias.',
    '1. Sente-se na máquina leg press e ajuste a posição' || CHR(10) || '2. Coloque apenas a ponta de um pé na parte inferior da plataforma' || CHR(10) || '3. Levante a outra perna ou mantenha-a levemente flexionada' || CHR(10) || '4. Deixe o calcanhar pendurado abaixo da plataforma' || CHR(10) || '5. Mantenha a perna estendida e o tronco apoiado' || CHR(10) || '6. Desbloqueie a máquina' || CHR(10) || '7. Contraia a panturrilha e empurre a plataforma com a ponta do pé' || CHR(10) || '8. Estenda completamente o tornozelo até ficar na ponta do pé' || CHR(10) || '9. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '10. Desça lentamente até sentir alongamento completo' || CHR(10) || '11. Complete todas as repetições de um lado antes de trocar',
    ARRAY['Usar carga excessiva', 'Não descer completamente', 'Perder alinhamento', 'Flexionar o joelho']::text[],
    NULL,
    25.0,
    7,
    ARRAY['Máquina Leg Press']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
-- ALONGAMENTOS E MOBILIDADE
(
    gen_random_uuid(),
    'Alongamento de Isquiotibiais em Pé com Perna Cruzada',
    'Panturrilhas',
    ARRAY['Posteriores de coxa', 'Glúteos']::text[],
    'Alongamento que trabalha panturrilhas, isquiotibiais e glúteos em uma única posição.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Cruze uma perna sobre a outra' || CHR(10) || '3. Mantenha ambas as pernas estendidas' || CHR(10) || '4. Incline o tronco para frente mantendo as costas retas' || CHR(10) || '5. Alcance em direção aos pés com as mãos' || CHR(10) || '6. Sinta o alongamento na parte posterior da perna de trás' || CHR(10) || '7. Mantenha a posição por 30-60 segundos' || CHR(10) || '8. Respire profundamente e relaxe' || CHR(10) || '9. Troque de lado e repita',
    ARRAY['Flexionar os joelhos', 'Arquear as costas', 'Forçar demais o alongamento', 'Não manter a posição']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento de Isquiotibiais em Pé',
    'Panturrilhas',
    ARRAY['Posteriores de coxa', 'Glúteos']::text[],
    'Alongamento clássico para panturrilhas e isquiotibiais realizado em pé.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Estenda uma perna à frente mantendo-a reta' || CHR(10) || '3. Flexione levemente a perna de apoio' || CHR(10) || '4. Incline o tronco para frente mantendo as costas retas' || CHR(10) || '5. Alcance em direção ao pé estendido com as mãos' || CHR(10) || '6. Sinta o alongamento na parte posterior da perna' || CHR(10) || '7. Mantenha a posição por 30-60 segundos' || CHR(10) || '8. Respire profundamente e relaxe' || CHR(10) || '9. Troque de lado e repita',
    ARRAY['Flexionar o joelho da perna estendida', 'Arquear as costas', 'Forçar demais', 'Não manter a posição']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Rolo de Espuma para Panturrilhas',
    'Panturrilhas',
    ARRAY[]::text[],
    'Técnica de liberação miofascial para panturrilhas utilizando rolo de espuma.',
    '1. Sente-se no chão com as pernas estendidas à frente' || CHR(10) || '2. Coloque o rolo de espuma sob as panturrilhas' || CHR(10) || '3. Apoie as mãos no chão atrás do corpo para apoio' || CHR(10) || '4. Levante o corpo apoiando o peso nas mãos e nas panturrilhas' || CHR(10) || '5. Role lentamente o rolo ao longo das panturrilhas' || CHR(10) || '6. Quando encontrar um ponto de tensão, pare e mantenha por 30-60 segundos' || CHR(10) || '7. Continue rolando de forma lenta e controlada' || CHR(10) || '8. Respire profundamente durante o processo' || CHR(10) || '9. Trabalhe toda a extensão das panturrilhas',
    ARRAY['Rolar muito rápido', 'Usar pressão excessiva', 'Não manter pontos de tensão', 'Perder controle']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Rolo de Espuma']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Rotação Externa do Pé com Faixa',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício de mobilidade para panturrilhas e tornozelos utilizando faixa elástica.',
    '1. Sente-se no chão com uma perna estendida' || CHR(10) || '2. Coloque a faixa elástica ao redor da parte superior do pé' || CHR(10) || '3. Segure as pontas da faixa com as mãos' || CHR(10) || '4. Mantenha a perna estendida e o joelho levemente flexionado' || CHR(10) || '5. Gire o pé para fora contra a resistência da faixa' || CHR(10) || '6. Mantenha a rotação por 2-3 segundos' || CHR(10) || '7. Retorne lentamente à posição inicial' || CHR(10) || '8. Execute o movimento de forma controlada' || CHR(10) || '9. Troque de lado e repita',
    ARRAY['Usar faixa muito tensa', 'Movimento muito rápido', 'Não manter a posição', 'Flexionar demais o joelho']::text[],
    NULL,
    0.0,
    4,
    ARRAY['Faixa Elástica']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento dos Extensores dos Dedos',
    'Panturrilhas',
    ARRAY[]::text[],
    'Alongamento específico para os músculos extensores dos dedos dos pés e panturrilhas.',
    '1. Sente-se no chão com as pernas estendidas à frente' || CHR(10) || '2. Flexione um pé trazendo os dedos em direção à canela' || CHR(10) || '3. Segure os dedos do pé com a mão do mesmo lado' || CHR(10) || '4. Puxe suavemente os dedos em direção à canela' || CHR(10) || '5. Sinta o alongamento na parte superior do pé e panturrilha' || CHR(10) || '6. Mantenha a posição por 30-60 segundos' || CHR(10) || '7. Respire profundamente e relaxe' || CHR(10) || '8. Solte e repita com o outro pé',
    ARRAY['Forçar demais o alongamento', 'Não manter a posição', 'Flexionar o joelho', 'Puxar muito rápido']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Dorsiflexão de Tornozelo em Pé',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício de mobilidade para melhorar a dorsiflexão do tornozelo e alongar panturrilhas.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Dê um passo à frente com um pé' || CHR(10) || '3. Mantenha o calcanhar do pé de trás no chão' || CHR(10) || '4. Flexione o joelho da perna da frente' || CHR(10) || '5. Incline o corpo para frente mantendo o calcanhar de trás no chão' || CHR(10) || '6. Sinta o alongamento na panturrilha da perna de trás' || CHR(10) || '7. Mantenha a posição por 30-60 segundos' || CHR(10) || '8. Respire profundamente e relaxe' || CHR(10) || '9. Troque de lado e repita',
    ARRAY['Levantar o calcanhar', 'Arquear as costas', 'Forçar demais', 'Não manter a posição']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento de Panturrilha na Parede',
    'Panturrilhas',
    ARRAY[]::text[],
    'Alongamento clássico de panturrilhas utilizando a parede para apoio.',
    '1. Fique em pé de frente para uma parede' || CHR(10) || '2. Dê um passo à frente com um pé' || CHR(10) || '3. Coloque as mãos na parede na altura dos ombros' || CHR(10) || '4. Mantenha a perna de trás estendida com o calcanhar no chão' || CHR(10) || '5. Incline o corpo para frente empurrando a parede' || CHR(10) || '6. Sinta o alongamento na panturrilha da perna de trás' || CHR(10) || '7. Mantenha a posição por 30-60 segundos' || CHR(10) || '8. Respire profundamente e relaxe' || CHR(10) || '9. Troque de lado e repita',
    ARRAY['Levantar o calcanhar', 'Flexionar o joelho de trás', 'Arquear as costas', 'Não manter a posição']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento de Aquiles com Dedos Elevados',
    'Panturrilhas',
    ARRAY[]::text[],
    'Alongamento específico para o tendão de Aquiles e panturrilhas.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Coloque as pontas dos pés em uma superfície elevada' || CHR(10) || '3. Deixe os calcanhares pendurados abaixo do nível dos dedos' || CHR(10) || '4. Mantenha as pernas estendidas' || CHR(10) || '5. Deixe o peso do corpo alongar as panturrilhas e o tendão de Aquiles' || CHR(10) || '6. Sinta o alongamento profundo na parte posterior da perna' || CHR(10) || '7. Mantenha a posição por 30-60 segundos' || CHR(10) || '8. Respire profundamente e relaxe' || CHR(10) || '9. Para intensificar, flexione levemente os joelhos',
    ARRAY['Forçar demais o alongamento', 'Não manter a posição', 'Perder equilíbrio', 'Movimento balançado']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento dos Flexores dos Dedos',
    'Panturrilhas',
    ARRAY[]::text[],
    'Alongamento para os músculos flexores dos dedos dos pés e panturrilhas.',
    '1. Sente-se no chão com as pernas estendidas à frente' || CHR(10) || '2. Flexione um pé apontando os dedos para longe do corpo' || CHR(10) || '3. Segure a parte superior do pé com a mão do mesmo lado' || CHR(10) || '4. Puxe suavemente o pé em direção ao corpo' || CHR(10) || '5. Sinta o alongamento na parte inferior do pé e panturrilha' || CHR(10) || '6. Mantenha a posição por 30-60 segundos' || CHR(10) || '7. Respire profundamente e relaxe' || CHR(10) || '8. Solte e repita com o outro pé',
    ARRAY['Forçar demais o alongamento', 'Não manter a posição', 'Flexionar o joelho', 'Puxar muito rápido']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento de Gastrocnêmio em Pé',
    'Panturrilhas',
    ARRAY[]::text[],
    'Alongamento específico para o músculo gastrocnêmio (cabeça externa e interna da panturrilha).',
    '1. Fique em pé de frente para uma parede' || CHR(10) || '2. Dê um passo à frente com um pé' || CHR(10) || '3. Coloque as mãos na parede na altura dos ombros' || CHR(10) || '4. Mantenha a perna de trás completamente estendida' || CHR(10) || '5. Mantenha o calcanhar da perna de trás firmemente no chão' || CHR(10) || '6. Incline o corpo para frente empurrando a parede' || CHR(10) || '7. Sinta o alongamento no gastrocnêmio da perna de trás' || CHR(10) || '8. Mantenha a posição por 30-60 segundos' || CHR(10) || '9. Respire profundamente e relaxe' || CHR(10) || '10. Troque de lado e repita',
    ARRAY['Levantar o calcanhar', 'Flexionar o joelho de trás', 'Arquear as costas', 'Não manter a posição']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento de Panturrilha Unilateral com Descida do Calcanhar',
    'Panturrilhas',
    ARRAY[]::text[],
    'Alongamento profundo unilateral para panturrilhas com foco no alongamento excêntrico.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Apoie apenas a ponta de um pé em uma superfície elevada' || CHR(10) || '3. Levante a outra perna ou mantenha-a levemente flexionada' || CHR(10) || '4. Deixe o calcanhar pendurado abaixo do nível dos dedos' || CHR(10) || '5. Segure em algo para manter o equilíbrio' || CHR(10) || '6. Deixe o peso do corpo alongar a panturrilha lentamente' || CHR(10) || '7. Sinta o alongamento profundo na panturrilha' || CHR(10) || '8. Mantenha a posição por 30-60 segundos' || CHR(10) || '9. Respire profundamente e relaxe' || CHR(10) || '10. Troque de lado e repita',
    ARRAY['Perder equilíbrio', 'Forçar demais', 'Não manter a posição', 'Movimento balançado']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento de Isquiotibiais Sentado com Perna Estendida',
    'Panturrilhas',
    ARRAY['Posteriores de coxa']::text[],
    'Alongamento sentado que trabalha panturrilhas e isquiotibiais simultaneamente.',
    '1. Sente-se no chão com uma perna estendida à frente' || CHR(10) || '2. Flexione a outra perna colocando o pé contra a coxa interna' || CHR(10) || '3. Mantenha a perna estendida completamente reta' || CHR(10) || '4. Flexione o pé da perna estendida apontando os dedos para cima' || CHR(10) || '5. Incline o tronco para frente mantendo as costas retas' || CHR(10) || '6. Alcance em direção ao pé estendido com as mãos' || CHR(10) || '7. Sinta o alongamento na parte posterior da perna' || CHR(10) || '8. Mantenha a posição por 30-60 segundos' || CHR(10) || '9. Respire profundamente e relaxe' || CHR(10) || '10. Troque de lado e repita',
    ARRAY['Flexionar o joelho da perna estendida', 'Arquear as costas', 'Forçar demais', 'Não manter a posição']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento de Panturrilha em Afundo',
    'Panturrilhas',
    ARRAY[]::text[],
    'Alongamento de panturrilhas realizado na posição de afundo para maior intensidade.',
    '1. Fique em pé e dê um passo à frente com um pé' || CHR(10) || '2. Entre na posição de afundo com a perna de trás estendida' || CHR(10) || '3. Mantenha o calcanhar da perna de trás no chão' || CHR(10) || '4. Flexione o joelho da perna da frente' || CHR(10) || '5. Incline o corpo para frente mantendo o calcanhar de trás no chão' || CHR(10) || '6. Sinta o alongamento profundo na panturrilha da perna de trás' || CHR(10) || '7. Mantenha a posição por 30-60 segundos' || CHR(10) || '8. Respire profundamente e relaxe' || CHR(10) || '9. Troque de lado e repita',
    ARRAY['Levantar o calcanhar', 'Flexionar o joelho de trás', 'Arquear as costas', 'Não manter a posição']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento do Tibial Posterior com Faixa',
    'Panturrilhas',
    ARRAY[]::text[],
    'Alongamento específico para o músculo tibial posterior utilizando faixa elástica.',
    '1. Sente-se no chão com uma perna estendida' || CHR(10) || '2. Coloque a faixa elástica ao redor da parte superior do pé' || CHR(10) || '3. Segure as pontas da faixa com as mãos' || CHR(10) || '4. Gire o pé para dentro contra a resistência da faixa' || CHR(10) || '5. Mantenha a rotação por 2-3 segundos' || CHR(10) || '6. Sinta o alongamento no tibial posterior' || CHR(10) || '7. Retorne lentamente à posição inicial' || CHR(10) || '8. Execute o movimento de forma controlada' || CHR(10) || '9. Troque de lado e repita',
    ARRAY['Usar faixa muito tensa', 'Movimento muito rápido', 'Não manter a posição', 'Forçar demais']::text[],
    NULL,
    0.0,
    4,
    ARRAY['Faixa Elástica']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamentos de Pé e Tornozelo',
    'Panturrilhas',
    ARRAY[]::text[],
    'Série de alongamentos para pé e tornozelo que beneficiam as panturrilhas.',
    '1. Sente-se no chão com as pernas estendidas' || CHR(10) || '2. Rotacione os tornozelos em círculos lentos (10 vezes em cada direção)' || CHR(10) || '3. Flexione os pés apontando os dedos para cima e para baixo (10 vezes)' || CHR(10) || '4. Gire os pés para dentro e para fora (10 vezes cada lado)' || CHR(10) || '5. Flexione e estenda os dedos dos pés (10 vezes)' || CHR(10) || '6. Mantenha cada movimento lento e controlado' || CHR(10) || '7. Respire profundamente durante os movimentos' || CHR(10) || '8. Sinta a mobilidade aumentando gradualmente' || CHR(10) || '9. Complete a série com ambas as pernas',
    ARRAY['Movimentos muito rápidos', 'Não completar a amplitude', 'Forçar demais', 'Não manter ritmo constante']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Rotação de Pé e Tornozelo',
    'Panturrilhas',
    ARRAY[]::text[],
    'Exercício de mobilidade para melhorar a amplitude de movimento do tornozelo e alongar panturrilhas.',
    '1. Sente-se no chão com as pernas estendidas ou em uma cadeira' || CHR(10) || '2. Estenda uma perna à frente' || CHR(10) || '3. Rotacione o tornozelo em círculos lentos e amplos' || CHR(10) || '4. Execute 10 rotações no sentido horário' || CHR(10) || '5. Execute 10 rotações no sentido anti-horário' || CHR(10) || '6. Mantenha os movimentos lentos e controlados' || CHR(10) || '7. Sinta a mobilidade aumentando gradualmente' || CHR(10) || '8. Respire profundamente durante os movimentos' || CHR(10) || '9. Troque de lado e repita',
    ARRAY['Movimentos muito rápidos', 'Não completar a amplitude', 'Forçar demais', 'Não manter ritmo constante']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento Estático de Panturrilhas',
    'Panturrilhas',
    ARRAY[]::text[],
    'Alongamento estático básico para panturrilhas mantendo uma posição fixa.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Dê um passo à frente com um pé' || CHR(10) || '3. Mantenha a perna de trás estendida com o calcanhar no chão' || CHR(10) || '4. Flexione o joelho da perna da frente' || CHR(10) || '5. Incline o corpo para frente mantendo o calcanhar de trás no chão' || CHR(10) || '6. Sinta o alongamento na panturrilha da perna de trás' || CHR(10) || '7. Mantenha a posição estática por 30-60 segundos' || CHR(10) || '8. Respire profundamente e relaxe' || CHR(10) || '9. Troque de lado e repita',
    ARRAY['Levantar o calcanhar', 'Flexionar o joelho de trás', 'Arquear as costas', 'Não manter a posição']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento de Panturrilha Unilateral',
    'Panturrilhas',
    ARRAY[]::text[],
    'Alongamento unilateral para trabalhar cada panturrilha individualmente.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Dê um passo à frente com um pé' || CHR(10) || '3. Mantenha a perna de trás estendida com o calcanhar no chão' || CHR(10) || '4. Flexione o joelho da perna da frente' || CHR(10) || '5. Incline o corpo para frente mantendo o calcanhar de trás no chão' || CHR(10) || '6. Foque o alongamento apenas na panturrilha da perna de trás' || CHR(10) || '7. Mantenha a posição por 30-60 segundos' || CHR(10) || '8. Respire profundamente e relaxe' || CHR(10) || '9. Troque de lado e repita',
    ARRAY['Levantar o calcanhar', 'Flexionar o joelho de trás', 'Arquear as costas', 'Não manter a posição']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento de Panturrilha com Corda',
    'Panturrilhas',
    ARRAY[]::text[],
    'Alongamento de panturrilhas utilizando corda ou faixa para maior controle e intensidade.',
    '1. Sente-se no chão com uma perna estendida' || CHR(10) || '2. Coloque a corda ou faixa ao redor da parte superior do pé' || CHR(10) || '3. Segure as pontas da corda com as mãos' || CHR(10) || '4. Mantenha a perna estendida' || CHR(10) || '5. Puxe suavemente a corda em direção ao corpo' || CHR(10) || '6. Flexione o pé apontando os dedos para cima' || CHR(10) || '7. Sinta o alongamento na panturrilha' || CHR(10) || '8. Mantenha a posição por 30-60 segundos' || CHR(10) || '9. Respire profundamente e relaxe' || CHR(10) || '10. Troque de lado e repita',
    ARRAY['Forçar demais o alongamento', 'Não manter a posição', 'Flexionar o joelho', 'Puxar muito rápido']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Corda', 'Faixa Elástica']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento de Panturrilha em Agachamento',
    'Panturrilhas',
    ARRAY['Quadríceps', 'Posteriores de coxa']::text[],
    'Alongamento funcional que combina agachamento com alongamento de panturrilhas.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Desça para posição de agachamento profundo' || CHR(10) || '3. Mantenha os calcanhares no chão' || CHR(10) || '4. Coloque as mãos no chão à frente para apoio' || CHR(10) || '5. Estenda uma perna para trás mantendo o calcanhar no chão' || CHR(10) || '6. Sinta o alongamento na panturrilha da perna estendida' || CHR(10) || '7. Mantenha a posição por 30-60 segundos' || CHR(10) || '8. Respire profundamente e relaxe' || CHR(10) || '9. Troque de lado e repita',
    ARRAY['Levantar os calcanhares', 'Perder equilíbrio', 'Arquear as costas', 'Não manter a posição']::text[],
    NULL,
    0.0,
    4,
    ARRAY['Peso Corporal']::text[],
    true,
    'Intermediário',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Elevação de Panturrilha Inclinada Unilateral',
    'Panturrilhas',
    ARRAY[]::text[],
    'Variação unilateral da elevação de panturrilha com tronco inclinado para maior isolamento e correção de assimetrias.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Incline o tronco para frente até ficar paralelo ao chão' || CHR(10) || '3. Apoie as mãos em uma superfície estável' || CHR(10) || '4. Apoie apenas a ponta de um pé em uma superfície elevada' || CHR(10) || '5. Levante a outra perna ou mantenha-a levemente flexionada' || CHR(10) || '6. Deixe o calcanhar pendurado abaixo do nível dos dedos' || CHR(10) || '7. Mantenha as pernas estendidas e o tronco paralelo ao chão' || CHR(10) || '8. Contraia a panturrilha e eleve o corpo até ficar na ponta do pé' || CHR(10) || '9. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '10. Desça lentamente até sentir alongamento completo' || CHR(10) || '11. Complete todas as repetições de um lado antes de trocar',
    ARRAY['Arquear as costas', 'Flexionar os joelhos', 'Não descer completamente', 'Perder alinhamento do tronco']::text[],
    NULL,
    0.0,
    7,
    ARRAY['Peso Corporal']::text[],
    true,
    'Intermediário',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Alongamento de Virilha Lateral',
    'Panturrilhas',
    ARRAY['Quadríceps', 'Glúteos']::text[],
    'Alongamento que trabalha panturrilhas, virilha e músculos internos da coxa.',
    '1. Fique em pé com os pés bem afastados' || CHR(10) || '2. Deslize um pé para o lado mantendo a perna estendida' || CHR(10) || '3. Flexione o joelho da perna oposta' || CHR(10) || '4. Incline o corpo para o lado da perna estendida' || CHR(10) || '5. Mantenha o calcanhar da perna estendida no chão' || CHR(10) || '6. Sinta o alongamento na parte interna da coxa e panturrilha' || CHR(10) || '7. Mantenha a posição por 30-60 segundos' || CHR(10) || '8. Respire profundamente e relaxe' || CHR(10) || '9. Troque de lado e repita',
    ARRAY['Levantar o calcanhar', 'Flexionar a perna estendida', 'Arquear as costas', 'Não manter a posição']::text[],
    NULL,
    0.0,
    3,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    NOW(),
    NOW()
);

-- =====================================================
-- PASSO 3: ASSOCIAR GRUPOS MUSCULARES VISUAIS
-- =====================================================

DO $$
DECLARE
    exercicio_record RECORD;
    grupo_principal_record RECORD;
    sinergista_record RECORD;
    sinergista_nome TEXT;
    ordem_counter INT;
    grupos_inseridos INT := 0;
    exercicios_processados INT := 0;
    v_timestamp_lote TIMESTAMP;
BEGIN
    -- Recupera o timestamp do lote
    SELECT (current_setting('app.timestamp_lote', true))::TIMESTAMP INTO v_timestamp_lote;
    
    -- Se não conseguir recuperar, usa um intervalo seguro (últimos 5 minutos)
    IF v_timestamp_lote IS NULL THEN
        v_timestamp_lote := NOW() - INTERVAL '5 minutes';
        RAISE WARNING 'Não foi possível recuperar timestamp do lote. Usando intervalo de 5 minutos.';
    END IF;
    
    FOR exercicio_record IN 
        SELECT id, nome, grupo_muscular_principal, sinergistas
        FROM exercicios
        WHERE created_at >= v_timestamp_lote
        ORDER BY created_at
    LOOP
        exercicios_processados := exercicios_processados + 1;
        ordem_counter := 0;
        
        -- 1. Associar grupo principal
        SELECT id INTO grupo_principal_record
        FROM grupos_musculares_visuais
        WHERE LOWER(TRIM(nome)) = LOWER(TRIM(exercicio_record.grupo_muscular_principal))
          AND ativo = true
        LIMIT 1;
        
        IF grupo_principal_record.id IS NOT NULL THEN
            INSERT INTO exercicios_grupos_musculares (
                id,
                exercicio_id,
                grupo_visual_id,
                papel,
                ordem,
                created_at
            ) VALUES (
                gen_random_uuid(),
                exercicio_record.id,
                grupo_principal_record.id,
                'PRINCIPAL'::papel_grupo_muscular,
                ordem_counter,
                NOW()
            ) ON CONFLICT (exercicio_id, grupo_visual_id, papel) DO NOTHING;
            
            grupos_inseridos := grupos_inseridos + 1;
            ordem_counter := ordem_counter + 1;
        ELSE
            RAISE WARNING 'Grupo principal "%" não encontrado para exercício "%"', 
                exercicio_record.grupo_muscular_principal, exercicio_record.nome;
        END IF;
        
        -- 2. Associar sinergistas
        IF exercicio_record.sinergistas IS NOT NULL AND array_length(exercicio_record.sinergistas, 1) > 0 THEN
            FOREACH sinergista_nome IN ARRAY exercicio_record.sinergistas
            LOOP
                SELECT id INTO sinergista_record
                FROM grupos_musculares_visuais
                WHERE LOWER(TRIM(nome)) = LOWER(TRIM(sinergista_nome))
                  AND ativo = true
                LIMIT 1;
                
                IF sinergista_record.id IS NOT NULL THEN
                    IF NOT EXISTS (
                        SELECT 1 FROM exercicios_grupos_musculares
                        WHERE exercicio_id = exercicio_record.id
                          AND grupo_visual_id = sinergista_record.id
                    ) THEN
                        INSERT INTO exercicios_grupos_musculares (
                            id,
                            exercicio_id,
                            grupo_visual_id,
                            papel,
                            ordem,
                            created_at
                        ) VALUES (
                            gen_random_uuid(),
                            exercicio_record.id,
                            sinergista_record.id,
                            'SINERGISTA'::papel_grupo_muscular,
                            ordem_counter,
                            NOW()
                        ) ON CONFLICT (exercicio_id, grupo_visual_id, papel) DO NOTHING;
                        
                        grupos_inseridos := grupos_inseridos + 1;
                        ordem_counter := ordem_counter + 1;
                    END IF;
                ELSE
                    RAISE WARNING 'Sinergista "%" não encontrado para exercício "%"', 
                        sinergista_nome, exercicio_record.nome;
                END IF;
            END LOOP;
        END IF;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Processados % exercício(s)', exercicios_processados;
    RAISE NOTICE 'Total de % grupos musculares associados', grupos_inseridos;
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- PASSO 4: VERIFICAÇÃO E RELATÓRIO FINAL
-- =====================================================

DO $$
DECLARE
    total_exercicios INT;
    exercicios_sem_grupos INT;
    total_grupos_associados INT;
    exercicios_com_grupos INT;
    v_timestamp_lote TIMESTAMP;
BEGIN
    -- Recupera o timestamp do lote
    SELECT (current_setting('app.timestamp_lote', true))::TIMESTAMP INTO v_timestamp_lote;
    
    -- Se não conseguir recuperar, usa um intervalo seguro (últimos 5 minutos)
    IF v_timestamp_lote IS NULL THEN
        v_timestamp_lote := NOW() - INTERVAL '5 minutes';
        RAISE WARNING 'Não foi possível recuperar timestamp do lote. Usando intervalo de 5 minutos.';
    END IF;
    
    -- Usa o timestamp do lote para contar exercícios inseridos
    SELECT COUNT(*) INTO total_exercicios
    FROM exercicios
    WHERE created_at >= v_timestamp_lote;
    
    SELECT COUNT(DISTINCT e.id) INTO exercicios_sem_grupos
    FROM exercicios e
    LEFT JOIN exercicios_grupos_musculares egm ON e.id = egm.exercicio_id
    WHERE e.created_at >= v_timestamp_lote
      AND egm.id IS NULL;
    
    SELECT COUNT(*) INTO total_grupos_associados
    FROM exercicios_grupos_musculares egm
    INNER JOIN exercicios e ON egm.exercicio_id = e.id
    WHERE e.created_at >= v_timestamp_lote;
    
    SELECT COUNT(DISTINCT exercicio_id) INTO exercicios_com_grupos
    FROM exercicios_grupos_musculares egm
    INNER JOIN exercicios e ON egm.exercicio_id = e.id
    WHERE e.created_at >= v_timestamp_lote;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RELATÓRIO DE INSERÇÃO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Exercícios inseridos: %', total_exercicios;
    RAISE NOTICE 'Exercícios com grupos: %', exercicios_com_grupos;
    RAISE NOTICE 'Grupos musculares associados: %', total_grupos_associados;
    RAISE NOTICE 'Exercícios sem grupos: %', exercicios_sem_grupos;
    RAISE NOTICE '========================================';
    
    IF exercicios_sem_grupos > 0 THEN
        RAISE WARNING 'ATENÇÃO: % exercício(s) não possuem grupos musculares associados!', exercicios_sem_grupos;
    END IF;
    
    IF total_exercicios = 0 THEN
        RAISE EXCEPTION 'Nenhum exercício foi inserido. Verifique os dados e tente novamente.';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- QUERIES DE VERIFICAÇÃO (Execute após COMMIT)
-- =====================================================
-- 
-- NOTA: A tabela temporária foi removida após o commit.
-- Use o timestamp de criação para verificar os exercícios inseridos.
-- 
-- Exemplo de query de verificação:
/*
SELECT 
    e.id,
    e.nome,
    e.grupo_muscular_principal,
    e.nivel_dificuldade,
    e.sem_equipamento,
    e.ativo,
    COUNT(egm.id) as grupos_associados,
    STRING_AGG(gv.nome || ' (' || egm.papel || ')', ', ' ORDER BY egm.ordem) as grupos
FROM exercicios e
LEFT JOIN exercicios_grupos_musculares egm ON e.id = egm.exercicio_id
LEFT JOIN grupos_musculares_visuais gv ON egm.grupo_visual_id = gv.id
WHERE e.created_at >= NOW() - INTERVAL '5 minute'
GROUP BY e.id, e.nome, e.grupo_muscular_principal, e.nivel_dificuldade, e.sem_equipamento, e.ativo
ORDER BY e.created_at DESC;
*/

