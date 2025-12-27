-- =====================================================
-- SCRIPT DE INSERÇÃO EM LOTE DE EXERCÍCIOS DE GLÚTEOS
-- Sistema: AthletIA - Produção
-- PostgreSQL 14+ (Debian VPS)
-- =====================================================
-- 
-- Este script insere exercícios de glúteos no banco de dados
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
    v_timestamp_lote TIMESTAMP := transaction_timestamp();
BEGIN
    -- Armazena o timestamp em uma variável de sessão
    -- transaction_timestamp() retorna o mesmo valor durante toda a transação
    -- false = não persiste além da transação atual
    PERFORM set_config('app.timestamp_lote', v_timestamp_lote::text, false);
    RAISE NOTICE 'Lote de inserção iniciado em: %', v_timestamp_lote;
    RAISE NOTICE 'Timestamp armazenado: %', current_setting('app.timestamp_lote', true);
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
    grupos_necessarios TEXT[] := ARRAY['Glúteos', 'Quadríceps', 'Posteriores de coxa'];
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
(
    gen_random_uuid(),
    'Banded Fire Hydrant',
    'Glúteos',
    ARRAY['Quadríceps']::text[],
    'Exercício de glúteos realizado em posição de quatro apoios com faixa de resistência, movendo a perna lateralmente.',
    '1. Fique em posição de quatro apoios (mãos e joelhos no chão)' || CHR(10) || '2. Coloque uma faixa de resistência ao redor das coxas, acima dos joelhos' || CHR(10) || '3. Mantenha as costas retas e o core contraído' || CHR(10) || '4. Mantenha os braços estendidos e alinhados com os ombros' || CHR(10) || '5. Mantenha os joelhos alinhados com os quadris' || CHR(10) || '6. Eleve uma perna lateralmente, mantendo o joelho flexionado em 90 graus' || CHR(10) || '7. Contraia os glúteos no topo do movimento' || CHR(10) || '8. Mantenha a contração por 1 segundo' || CHR(10) || '9. Desça a perna lentamente até a posição inicial' || CHR(10) || '10. Complete todas as repetições de um lado antes de trocar',
    ARRAY['Arquear as costas', 'Balançar o corpo', 'Elevar muito alto', 'Perder alinhamento']::text[],
    NULL,
    0.0,
    6,
    ARRAY['Faixa de resistência']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Banded Donkey Kicks',
    'Glúteos',
    ARRAY['Posteriores de coxa']::text[],
    'Exercício de glúteos realizado em posição de quatro apoios com faixa de resistência, chutando a perna para trás.',
    '1. Fique em posição de quatro apoios (mãos e joelhos no chão)' || CHR(10) || '2. Coloque uma faixa de resistência ao redor dos pés ou acima dos joelhos' || CHR(10) || '3. Mantenha as costas retas e o core contraído' || CHR(10) || '4. Mantenha os braços estendidos e alinhados com os ombros' || CHR(10) || '5. Mantenha um joelho no chão como apoio' || CHR(10) || '6. Chute a outra perna para trás, mantendo o joelho flexionado em 90 graus' || CHR(10) || '7. Contraia os glúteos no topo do movimento' || CHR(10) || '8. Mantenha a contração por 1 segundo' || CHR(10) || '9. Retorne a perna lentamente até a posição inicial' || CHR(10) || '10. Complete todas as repetições de um lado antes de trocar',
    ARRAY['Arquear as costas', 'Balançar o corpo', 'Estender completamente o joelho', 'Perder alinhamento']::text[],
    NULL,
    0.0,
    6,
    ARRAY['Faixa de resistência']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Banded Glute Bridge',
    'Glúteos',
    ARRAY['Quadríceps', 'Posteriores de coxa']::text[],
    'Exercício de glúteos realizado em ponte com faixa de resistência ao redor das coxas.',
    '1. Deite-se de costas no chão com os joelhos flexionados' || CHR(10) || '2. Coloque os pés na largura dos quadris, firmes no chão' || CHR(10) || '3. Coloque uma faixa de resistência ao redor das coxas, acima dos joelhos' || CHR(10) || '4. Mantenha os braços ao lado do corpo' || CHR(10) || '5. Contraia os glúteos e eleve o quadril do chão' || CHR(10) || '6. Mantenha os joelhos alinhados e empurre contra a faixa' || CHR(10) || '7. Forme uma linha reta dos joelhos aos ombros' || CHR(10) || '8. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '9. Desça o quadril lentamente até a posição inicial' || CHR(10) || '10. Execute o movimento de forma controlada',
    ARRAY['Arquear as costas', 'Elevar muito alto', 'Joelhos indo para dentro', 'Perder tensão na faixa']::text[],
    NULL,
    0.0,
    6,
    ARRAY['Faixa de resistência']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Banded Single Leg Glute Bridge',
    'Glúteos',
    ARRAY['Quadríceps', 'Posteriores de coxa']::text[],
    'Exercício unilateral de glúteos realizado em ponte com faixa de resistência, trabalhando uma perna por vez.',
    '1. Deite-se de costas no chão com os joelhos flexionados' || CHR(10) || '2. Coloque os pés na largura dos quadris, firmes no chão' || CHR(10) || '3. Coloque uma faixa de resistência ao redor das coxas, acima dos joelhos' || CHR(10) || '4. Estenda uma perna à frente, mantendo-a paralela ao chão' || CHR(10) || '5. Mantenha os braços ao lado do corpo' || CHR(10) || '6. Contraia os glúteos e eleve o quadril do chão usando apenas uma perna' || CHR(10) || '7. Mantenha a perna estendida paralela ao chão' || CHR(10) || '8. Forme uma linha reta do joelho de apoio aos ombros' || CHR(10) || '9. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '10. Desça o quadril lentamente até a posição inicial' || CHR(10) || '11. Complete todas as repetições de um lado antes de trocar',
    ARRAY['Arquear as costas', 'Balançar o corpo', 'Perder alinhamento', 'Joelho de apoio indo para dentro']::text[],
    NULL,
    0.0,
    7,
    ARRAY['Faixa de resistência']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Dumbbell Pull Through',
    'Glúteos',
    ARRAY['Posteriores de coxa', 'Quadríceps']::text[],
    'Exercício de glúteos realizado com halter, puxando o peso entre as pernas em movimento de agachamento.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Segure um halter com ambas as mãos entre as pernas' || CHR(10) || '3. Mantenha as costas retas e o core contraído' || CHR(10) || '4. Flexione os joelhos e os quadris, descendo em um movimento de agachamento' || CHR(10) || '5. Deixe o halter passar entre as pernas' || CHR(10) || '6. Mantenha o peito erguido e as costas retas' || CHR(10) || '7. Contraia os glúteos e empurre os quadris para frente' || CHR(10) || '8. Estenda os joelhos e os quadris, retornando à posição inicial' || CHR(10) || '9. Puxe o halter para frente enquanto sobe' || CHR(10) || '10. Execute o movimento de forma controlada',
    ARRAY['Arquear as costas', 'Joelhos indo para dentro', 'Puxar com os braços', 'Não contrair os glúteos']::text[],
    NULL,
    10.0,
    7,
    ARRAY['Halteres', 'Academia completa']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Frog Reverse Hyperextension',
    'Glúteos',
    ARRAY['Posteriores de coxa']::text[],
    'Exercício de glúteos realizado deitado de bruços com as pernas em posição de sapo, elevando as pernas para trás.',
    '1. Deite-se de bruços no chão ou em um banco' || CHR(10) || '2. Coloque as pernas em posição de sapo (joelhos flexionados e pés juntos)' || CHR(10) || '3. Mantenha os braços estendidos à frente para apoio' || CHR(10) || '4. Mantenha a cabeça alinhada com a coluna' || CHR(10) || '5. Contraia os glúteos e eleve as pernas do chão' || CHR(10) || '6. Mantenha a posição de sapo durante todo o movimento' || CHR(10) || '7. Eleve até sentir contração máxima nos glúteos' || CHR(10) || '8. Mantenha a contração por 1-2 segundos' || CHR(10) || '9. Desça as pernas lentamente até a posição inicial' || CHR(10) || '10. Execute o movimento de forma controlada',
    ARRAY['Arquear as costas', 'Levantar a cabeça', 'Estender os joelhos', 'Perder a posição de sapo']::text[],
    NULL,
    0.0,
    6,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Bridge Hip Abduction',
    'Glúteos',
    ARRAY['Quadríceps']::text[],
    'Exercício de glúteos realizado em ponte com abdução de quadril, abrindo as pernas lateralmente.',
    '1. Deite-se de costas no chão com os joelhos flexionados' || CHR(10) || '2. Coloque os pés juntos, firmes no chão' || CHR(10) || '3. Mantenha os braços ao lado do corpo' || CHR(10) || '4. Contraia os glúteos e eleve o quadril do chão' || CHR(10) || '5. Forme uma linha reta dos joelhos aos ombros' || CHR(10) || '6. Mantenha os joelhos juntos' || CHR(10) || '7. Abra os joelhos lateralmente, mantendo os pés juntos' || CHR(10) || '8. Contraia os glúteos durante a abdução' || CHR(10) || '9. Retorne os joelhos à posição inicial' || CHR(10) || '10. Mantenha o quadril elevado durante todo o movimento',
    ARRAY['Arquear as costas', 'Baixar o quadril', 'Perder alinhamento', 'Movimento muito rápido']::text[],
    NULL,
    0.0,
    6,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Barbell Hip Thrusts',
    'Glúteos',
    ARRAY['Quadríceps', 'Posteriores de coxa']::text[],
    'Exercício avançado de glúteos realizado com barra, empurrando os quadris para cima a partir de uma posição apoiada.',
    '1. Sente-se no chão com as costas apoiadas em um banco ou superfície elevada' || CHR(10) || '2. Coloque a barra sobre os quadris (use uma almofada para proteção)' || CHR(10) || '3. Flexione os joelhos e coloque os pés firmes no chão' || CHR(10) || '4. Mantenha os pés na largura dos quadris' || CHR(10) || '5. Segure a barra com as mãos para estabilidade' || CHR(10) || '6. Contraia os glúteos e empurre os quadris para cima' || CHR(10) || '7. Forme uma linha reta dos joelhos aos ombros' || CHR(10) || '8. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '9. Desça os quadris lentamente até quase tocar o chão' || CHR(10) || '10. Execute o movimento de forma controlada',
    ARRAY['Arquear as costas', 'Usar carga excessiva', 'Joelhos indo para dentro', 'Não completar o movimento']::text[],
    NULL,
    40.0,
    8,
    ARRAY['Barra', 'Academia completa']::text[],
    false,
    'Avançado',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Single-Leg Dumbbell Hip Thrust',
    'Glúteos',
    ARRAY['Quadríceps', 'Posteriores de coxa']::text[],
    'Exercício unilateral de glúteos realizado com halter, trabalhando uma perna por vez.',
    '1. Sente-se no chão com as costas apoiadas em um banco ou superfície elevada' || CHR(10) || '2. Coloque um halter sobre os quadris (use uma almofada para proteção)' || CHR(10) || '3. Flexione um joelho e coloque o pé firme no chão' || CHR(10) || '4. Estenda a outra perna à frente, mantendo-a paralela ao chão' || CHR(10) || '5. Mantenha os braços ao lado do corpo para apoio' || CHR(10) || '6. Contraia os glúteos e empurre os quadris para cima usando apenas uma perna' || CHR(10) || '7. Mantenha a perna estendida paralela ao chão' || CHR(10) || '8. Forme uma linha reta do joelho de apoio aos ombros' || CHR(10) || '9. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '10. Desça os quadris lentamente até quase tocar o chão' || CHR(10) || '11. Complete todas as repetições de um lado antes de trocar',
    ARRAY['Arquear as costas', 'Balançar o corpo', 'Perder alinhamento', 'Joelho de apoio indo para dentro']::text[],
    NULL,
    15.0,
    8,
    ARRAY['Halteres', 'Academia completa']::text[],
    false,
    'Avançado',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Frog Pump',
    'Glúteos',
    ARRAY['Quadríceps']::text[],
    'Exercício de glúteos realizado em ponte com as pernas em posição de sapo, bombeando os quadris.',
    '1. Deite-se de costas no chão' || CHR(10) || '2. Coloque os pés juntos com os joelhos apontando para os lados (posição de sapo)' || CHR(10) || '3. Mantenha os braços ao lado do corpo' || CHR(10) || '4. Contraia os glúteos e eleve o quadril do chão' || CHR(10) || '5. Forme uma linha reta dos joelhos aos ombros' || CHR(10) || '6. Mantenha a posição de sapo durante todo o movimento' || CHR(10) || '7. Faça pequenos movimentos de bombeamento, elevando e descendo levemente' || CHR(10) || '8. Mantenha os glúteos contraídos durante todo o movimento' || CHR(10) || '9. Execute o movimento de forma controlada e rápida' || CHR(10) || '10. Complete todas as repetições',
    ARRAY['Arquear as costas', 'Perder a posição de sapo', 'Baixar o quadril demais', 'Movimento muito amplo']::text[],
    NULL,
    0.0,
    6,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Barbell Glute Bridge',
    'Glúteos',
    ARRAY['Quadríceps', 'Posteriores de coxa']::text[],
    'Exercício de glúteos realizado em ponte com barra, empurrando os quadris para cima a partir do chão.',
    '1. Deite-se de costas no chão com os joelhos flexionados' || CHR(10) || '2. Coloque os pés na largura dos quadris, firmes no chão' || CHR(10) || '3. Coloque a barra sobre os quadris (use uma almofada para proteção)' || CHR(10) || '4. Mantenha os braços ao lado do corpo' || CHR(10) || '5. Segure a barra com as mãos para estabilidade' || CHR(10) || '6. Contraia os glúteos e eleve o quadril do chão' || CHR(10) || '7. Forme uma linha reta dos joelhos aos ombros' || CHR(10) || '8. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '9. Desça o quadril lentamente até quase tocar o chão' || CHR(10) || '10. Execute o movimento de forma controlada',
    ARRAY['Arquear as costas', 'Usar carga excessiva', 'Joelhos indo para dentro', 'Não completar o movimento']::text[],
    NULL,
    30.0,
    7,
    ARRAY['Barra', 'Academia completa']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Side Hip Abduction',
    'Glúteos',
    ARRAY[]::text[],
    'Exercício de glúteos realizado deitado de lado, abrindo a perna lateralmente.',
    '1. Deite-se de lado no chão' || CHR(10) || '2. Apoie a cabeça na mão ou no braço estendido' || CHR(10) || '3. Mantenha as pernas estendidas e alinhadas' || CHR(10) || '4. Mantenha a perna de baixo como apoio' || CHR(10) || '5. Eleve a perna de cima lateralmente, mantendo-a estendida' || CHR(10) || '6. Contraia os glúteos durante a elevação' || CHR(10) || '7. Eleve até sentir contração máxima nos glúteos laterais' || CHR(10) || '8. Mantenha a contração por 1 segundo' || CHR(10) || '9. Desça a perna lentamente até a posição inicial' || CHR(10) || '10. Complete todas as repetições de um lado antes de trocar',
    ARRAY['Balançar o corpo', 'Flexionar o joelho', 'Rolar para frente ou para trás', 'Elevar muito alto']::text[],
    NULL,
    0.0,
    6,
    ARRAY['Peso Corporal']::text[],
    true,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
);

-- =====================================================
-- PASSO 3: ASSOCIAÇÃO COM GRUPOS MUSCULARES VISUAIS
-- =====================================================

DO $$
DECLARE
    exercicio_record RECORD;
    grupo_principal_record RECORD;
    sinergista_record RECORD;
    sinergista_nome TEXT;
    grupos_inseridos INT := 0;
    exercicios_processados INT := 0;
    ordem_counter INT;
    v_timestamp_lote TIMESTAMP;
    total_no_intervalo INT;
BEGIN
    -- Recupera o timestamp do lote
    SELECT (current_setting('app.timestamp_lote', true))::TIMESTAMP INTO v_timestamp_lote;
    
    -- Se não conseguir recuperar, usa um intervalo seguro (últimos 30 minutos)
    IF v_timestamp_lote IS NULL THEN
        v_timestamp_lote := transaction_timestamp() - INTERVAL '30 minutes';
        RAISE WARNING 'Não foi possível recuperar timestamp do lote. Usando intervalo de 30 minutos.';
        RAISE NOTICE 'Timestamp atual: %, Timestamp usado: %', transaction_timestamp(), v_timestamp_lote;
    ELSE
        RAISE NOTICE 'Timestamp do lote recuperado: %', v_timestamp_lote;
    END IF;
    
    -- Debug: conta quantos exercícios existem no intervalo
    SELECT COUNT(*) INTO total_no_intervalo
    FROM exercicios 
    WHERE created_at >= (v_timestamp_lote - INTERVAL '1 second');
    RAISE NOTICE 'Exercícios encontrados no intervalo: %', total_no_intervalo;
    
    -- Itera sobre todos os exercícios inseridos neste lote
    -- Usa um intervalo maior para garantir que capture todos os exercícios
    FOR exercicio_record IN 
        SELECT id, nome, grupo_muscular_principal, sinergistas
        FROM exercicios 
        WHERE created_at >= (v_timestamp_lote - INTERVAL '1 second')
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
            -- Verifica se já existe associação para evitar duplicatas
            IF NOT EXISTS (
                SELECT 1 FROM exercicios_grupos_musculares
                WHERE exercicio_id = exercicio_record.id
                  AND grupo_visual_id = grupo_principal_record.id
                  AND papel = 'PRINCIPAL'::"PapelGrupoMuscular"
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
                    grupo_principal_record.id,
                    'PRINCIPAL'::"PapelGrupoMuscular",
                    ordem_counter,
                    transaction_timestamp()
                ) ON CONFLICT (exercicio_id, grupo_visual_id, papel) DO NOTHING;
                
                grupos_inseridos := grupos_inseridos + 1;
                ordem_counter := ordem_counter + 1;
            END IF;
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
                            'SINERGISTA'::"PapelGrupoMuscular",
                            ordem_counter,
                            transaction_timestamp()
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
    
    -- Se não conseguir recuperar, usa um intervalo seguro (últimos 30 minutos)
    IF v_timestamp_lote IS NULL THEN
        v_timestamp_lote := transaction_timestamp() - INTERVAL '30 minutes';
        RAISE WARNING 'Não foi possível recuperar timestamp do lote. Usando intervalo de 30 minutos.';
        RAISE NOTICE 'Timestamp atual: %, Timestamp usado: %', transaction_timestamp(), v_timestamp_lote;
    ELSE
        RAISE NOTICE 'Timestamp do lote recuperado: %', v_timestamp_lote;
    END IF;
    
    -- Usa o timestamp do lote para contar exercícios inseridos
    -- Usa um intervalo maior para garantir que capture todos os exercícios
    SELECT COUNT(*) INTO total_exercicios
    FROM exercicios
    WHERE created_at >= (v_timestamp_lote - INTERVAL '1 second');
    
    RAISE NOTICE 'Debug: Total de exercícios encontrados: %', total_exercicios;
    
    SELECT COUNT(DISTINCT e.id) INTO exercicios_sem_grupos
    FROM exercicios e
    LEFT JOIN exercicios_grupos_musculares egm ON e.id = egm.exercicio_id
    WHERE e.created_at >= (v_timestamp_lote - INTERVAL '1 second')
      AND egm.id IS NULL;
    
    SELECT COUNT(*) INTO total_grupos_associados
    FROM exercicios_grupos_musculares egm
    INNER JOIN exercicios e ON egm.exercicio_id = e.id
    WHERE e.created_at >= (v_timestamp_lote - INTERVAL '1 second');
    
    SELECT COUNT(DISTINCT exercicio_id) INTO exercicios_com_grupos
    FROM exercicios_grupos_musculares egm
    INNER JOIN exercicios e ON egm.exercicio_id = e.id
    WHERE e.created_at >= (v_timestamp_lote - INTERVAL '1 second');
    
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
-- NOTA: Esta query é apenas para verificação manual após o commit.
-- Use um intervalo de tempo adequado para encontrar os exercícios inseridos.
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
WHERE e.created_at >= CURRENT_TIMESTAMP - INTERVAL '5 minutes'
GROUP BY e.id, e.nome, e.grupo_muscular_principal, e.nivel_dificuldade, e.sem_equipamento, e.ativo
ORDER BY e.created_at DESC;
*/

