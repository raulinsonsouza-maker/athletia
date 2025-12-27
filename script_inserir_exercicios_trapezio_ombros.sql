-- =====================================================
-- SCRIPT DE INSERÇÃO EM LOTE DE EXERCÍCIOS DE TRAPÉZIO E OMBROS
-- Sistema: AthletIA - Produção
-- PostgreSQL 14+ (Debian VPS)
-- =====================================================
-- 
-- Este script insere exercícios de trapézio e ombros no banco de dados
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
    grupos_necessarios TEXT[] := ARRAY['Trapézio', 'Ombros', 'Costas'];
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
-- Usa CTE para capturar os IDs dos exercícios inseridos

WITH exercicios_inseridos AS (
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
-- EXERCÍCIOS DE TRAPÉZIO
(
    gen_random_uuid(),
    'Encolher de ombros por cima da cabeça',
    'Trapézio',
    ARRAY[]::text[],
    'Exercício de trapézio realizado com a barra posicionada acima da cabeça, trabalhando principalmente as fibras superiores.',
    '1. Posicione-se em pé com os pés na largura dos ombros' || CHR(10) || '2. Segure a barra com pegada pronada (palmas voltadas para frente)' || CHR(10) || '3. Eleve a barra acima da cabeça com os braços estendidos' || CHR(10) || '4. Mantenha os braços completamente estendidos durante todo o movimento' || CHR(10) || '5. Contraia os trapézios e eleve os ombros em direção às orelhas' || CHR(10) || '6. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '7. Desça os ombros lentamente até a posição inicial' || CHR(10) || '8. Execute o movimento de forma controlada' || CHR(10) || '9. Evite usar impulso ou balançar o corpo',
    ARRAY['Usar carga excessiva', 'Balançar o corpo', 'Flexionar os braços', 'Não manter os braços estendidos']::text[],
    NULL,
    20.0,
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
    'Gittleson Shrug',
    'Trapézio',
    ARRAY['Ombros']::text[],
    'Exercício de trapézio com halteres realizado com movimento rotacional, desenvolvido por Vince Gittleson.',
    '1. Fique em pé segurando halteres ao lado do corpo' || CHR(10) || '2. Mantenha os braços estendidos ao longo do corpo' || CHR(10) || '3. Contraia os trapézios e eleve os ombros em direção às orelhas' || CHR(10) || '4. Ao elevar, gire os ombros para frente e depois para trás' || CHR(10) || '5. Complete o movimento rotacional enquanto mantém a elevação' || CHR(10) || '6. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '7. Desça os ombros lentamente até a posição inicial' || CHR(10) || '8. Execute o movimento de forma controlada e fluida' || CHR(10) || '9. Evite usar impulso',
    ARRAY['Usar carga excessiva', 'Balançar o corpo', 'Movimento muito rápido', 'Não completar a rotação']::text[],
    NULL,
    15.0,
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
    'Remada inclinada a 45 graus com halteres',
    'Trapézio',
    ARRAY['Costas', 'Ombros']::text[],
    'Exercício que trabalha trapézio, costas e ombros com o tronco inclinado a 45 graus.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Incline o tronco para frente a aproximadamente 45 graus' || CHR(10) || '3. Segure halteres com pegada pronada' || CHR(10) || '4. Mantenha as costas retas e o core contraído' || CHR(10) || '5. Puxe os halteres em direção ao peito, puxando os cotovelos para trás' || CHR(10) || '6. Contraia os trapézios e as costas no topo do movimento' || CHR(10) || '7. Mantenha a contração por 1 segundo' || CHR(10) || '8. Desça os halteres lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Arquear as costas', 'Usar impulso', 'Não manter o tronco estável', 'Puxar com os braços ao invés das costas']::text[],
    NULL,
    12.0,
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
    'Encolhimento de ombros com halteres',
    'Trapézio',
    ARRAY[]::text[],
    'Exercício clássico de trapézio realizado com halteres, permitindo maior amplitude de movimento.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Segure halteres ao lado do corpo com os braços estendidos' || CHR(10) || '3. Mantenha as costas retas e o core contraído' || CHR(10) || '4. Contraia os trapézios e eleve os ombros em direção às orelhas' || CHR(10) || '5. Mantenha os braços estendidos durante todo o movimento' || CHR(10) || '6. Eleve os ombros o máximo possível' || CHR(10) || '7. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '8. Desça os ombros lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Balançar o corpo', 'Flexionar os braços', 'Rolar os ombros para frente']::text[],
    NULL,
    20.0,
    7,
    ARRAY['Halteres', 'Academia completa']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Encolhimento de ombros com cabos',
    'Trapézio',
    ARRAY[]::text[],
    'Exercício de trapézio utilizando cabos para tensão constante durante todo o movimento.',
    '1. Posicione-se em pé na frente da máquina de cabos' || CHR(10) || '2. Segure a alça do cabo com pegada neutra' || CHR(10) || '3. Mantenha os braços estendidos ao lado do corpo' || CHR(10) || '4. Mantenha as costas retas e o core contraído' || CHR(10) || '5. Contraia os trapézios e eleve os ombros em direção às orelhas' || CHR(10) || '6. Mantenha a tensão constante durante todo o movimento' || CHR(10) || '7. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '8. Desça os ombros lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Balançar o corpo', 'Flexionar os braços', 'Perder tensão no cabo']::text[],
    NULL,
    15.0,
    7,
    ARRAY['Cabo', 'Academia completa']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Encolhimento de ombros com barra',
    'Trapézio',
    ARRAY[]::text[],
    'Exercício clássico de trapézio realizado com barra, permitindo maior carga.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Segure a barra com pegada pronada na frente do corpo' || CHR(10) || '3. Mantenha os braços estendidos durante todo o movimento' || CHR(10) || '4. Mantenha as costas retas e o core contraído' || CHR(10) || '5. Contraia os trapézios e eleve os ombros em direção às orelhas' || CHR(10) || '6. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '7. Desça os ombros lentamente até a posição inicial' || CHR(10) || '8. Execute o movimento de forma controlada' || CHR(10) || '9. Evite usar impulso ou balançar o corpo',
    ARRAY['Usar carga excessiva', 'Balançar o corpo', 'Flexionar os braços', 'Rolar os ombros']::text[],
    NULL,
    30.0,
    7,
    ARRAY['Barra', 'Academia completa']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Encolhimento de ombros com barra atrás das costas',
    'Trapézio',
    ARRAY[]::text[],
    'Variação do encolhimento de ombros com a barra posicionada atrás das costas, mudando o ângulo de trabalho.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Posicione a barra atrás das costas' || CHR(10) || '3. Segure a barra com pegada pronada' || CHR(10) || '4. Mantenha os braços estendidos durante todo o movimento' || CHR(10) || '5. Mantenha as costas retas e o core contraído' || CHR(10) || '6. Contraia os trapézios e eleve os ombros em direção às orelhas' || CHR(10) || '7. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '8. Desça os ombros lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Arquear as costas', 'Flexionar os braços', 'Perder equilíbrio']::text[],
    NULL,
    25.0,
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
    'Encolhimento de ombros inclinado com halteres',
    'Trapézio',
    ARRAY[]::text[],
    'Variação do encolhimento de ombros com o tronco inclinado, alterando o ângulo de trabalho dos trapézios.',
    '1. Incline o tronco para frente a aproximadamente 45 graus' || CHR(10) || '2. Segure halteres com os braços estendidos pendurados' || CHR(10) || '3. Mantenha as costas retas e o core contraído' || CHR(10) || '4. Contraia os trapézios e eleve os ombros em direção às orelhas' || CHR(10) || '5. Mantenha os braços estendidos durante todo o movimento' || CHR(10) || '6. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '7. Desça os ombros lentamente até a posição inicial' || CHR(10) || '8. Execute o movimento de forma controlada' || CHR(10) || '9. Evite arquear as costas',
    ARRAY['Arquear as costas', 'Usar carga excessiva', 'Flexionar os braços', 'Perder alinhamento']::text[],
    NULL,
    15.0,
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
    'Encolhimento de ombros inclinado em decúbito ventral',
    'Trapézio',
    ARRAY[]::text[],
    'Exercício de trapézio realizado deitado de bruços em um banco inclinado, isolando melhor o músculo.',
    '1. Deite-se de bruços em um banco inclinado a 30-45 graus' || CHR(10) || '2. Segure halteres com os braços estendidos pendurados' || CHR(10) || '3. Mantenha a cabeça alinhada com a coluna' || CHR(10) || '4. Contraia os trapézios e eleve os ombros em direção às orelhas' || CHR(10) || '5. Mantenha os braços estendidos durante todo o movimento' || CHR(10) || '6. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '7. Desça os ombros lentamente até a posição inicial' || CHR(10) || '8. Execute o movimento de forma controlada' || CHR(10) || '9. Evite levantar a cabeça excessivamente',
    ARRAY['Levantar a cabeça demais', 'Usar carga excessiva', 'Flexionar os braços', 'Arquear as costas']::text[],
    NULL,
    12.0,
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
    'Encolher de ombros com alavanca',
    'Trapézio',
    ARRAY[]::text[],
    'Exercício de trapézio realizado em máquina com alavanca, proporcionando movimento guiado e seguro.',
    '1. Posicione-se na máquina de encolhimento de ombros' || CHR(10) || '2. Ajuste o assento e a altura da alavanca para conforto' || CHR(10) || '3. Segure as alças ou a barra da máquina' || CHR(10) || '4. Mantenha os braços estendidos durante todo o movimento' || CHR(10) || '5. Contraia os trapézios e eleve os ombros em direção às orelhas' || CHR(10) || '6. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '7. Desça os ombros lentamente até a posição inicial' || CHR(10) || '8. Execute o movimento de forma controlada' || CHR(10) || '9. Ajuste a carga adequadamente',
    ARRAY['Usar carga excessiva', 'Flexionar os braços', 'Não completar o movimento', 'Máquina mal ajustada']::text[],
    NULL,
    30.0,
    7,
    ARRAY['Ginásio completo', 'Máquinas']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Encolhimento de ombros sem pegas com alavanca',
    'Trapézio',
    ARRAY[]::text[],
    'Variação do encolhimento de ombros em máquina sem usar as pegas, trabalhando diretamente com a alavanca.',
    '1. Posicione-se na máquina de encolhimento de ombros' || CHR(10) || '2. Ajuste o assento e a altura da alavanca' || CHR(10) || '3. Posicione os ombros diretamente sob a alavanca' || CHR(10) || '4. Mantenha os braços estendidos ao lado do corpo' || CHR(10) || '5. Contraia os trapézios e eleve os ombros contra a alavanca' || CHR(10) || '6. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '7. Desça os ombros lentamente até a posição inicial' || CHR(10) || '8. Execute o movimento de forma controlada' || CHR(10) || '9. Ajuste a carga adequadamente',
    ARRAY['Usar carga excessiva', 'Flexionar os braços', 'Não completar o movimento', 'Máquina mal ajustada']::text[],
    NULL,
    25.0,
    7,
    ARRAY['Ginásio completo', 'Máquinas']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Encolhimento de ombros da Máquina Smith',
    'Trapézio',
    ARRAY[]::text[],
    'Exercício de trapézio realizado na máquina Smith, proporcionando maior estabilidade e segurança.',
    '1. Posicione-se em pé na máquina Smith' || CHR(10) || '2. Ajuste a altura da barra para que fique na altura dos quadris' || CHR(10) || '3. Segure a barra com pegada pronada' || CHR(10) || '4. Mantenha os braços estendidos durante todo o movimento' || CHR(10) || '5. Mantenha as costas retas e o core contraído' || CHR(10) || '6. Contraia os trapézios e eleve os ombros em direção às orelhas' || CHR(10) || '7. Mantenha a contração máxima por 1-2 segundos' || CHR(10) || '8. Desça os ombros lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Flexionar os braços', 'Balançar o corpo', 'Barra mal posicionada']::text[],
    NULL,
    30.0,
    7,
    ARRAY['Ginásio completo', 'Máquinas']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
-- EXERCÍCIOS DE OMBROS COM TRAPÉZIO COMO SINERGISTA
(
    gen_random_uuid(),
    'Máquina de Mosca Delt Traseira',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides posteriores realizado em máquina específica, trabalhando também o trapézio.',
    '1. Sente-se na máquina de mosca deltoide traseira' || CHR(10) || '2. Ajuste o assento e os braços da máquina para conforto' || CHR(10) || '3. Posicione os braços nos apoios da máquina' || CHR(10) || '4. Mantenha as costas apoiadas no encosto' || CHR(10) || '5. Abra os braços empurrando contra a resistência da máquina' || CHR(10) || '6. Contraia os deltoides posteriores e trapézios no final do movimento' || CHR(10) || '7. Mantenha a contração por 1 segundo' || CHR(10) || '8. Retorne os braços lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Arquear as costas', 'Não completar o movimento', 'Máquina mal ajustada']::text[],
    NULL,
    20.0,
    7,
    ARRAY['Ginásio completo', 'Máquinas']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Cabo traseiro Delt Fly',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides posteriores realizado com cabos, proporcionando tensão constante.',
    '1. Posicione-se em pé entre duas máquinas de cabos' || CHR(10) || '2. Ajuste as polias para a altura dos ombros' || CHR(10) || '3. Segure as alças com pegada neutra' || CHR(10) || '4. Incline o tronco levemente para frente' || CHR(10) || '5. Mantenha os braços levemente flexionados' || CHR(10) || '6. Abra os braços em movimento de voo, contraindo os deltoides posteriores' || CHR(10) || '7. Mantenha a contração por 1 segundo' || CHR(10) || '8. Retorne os braços lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Arquear as costas', 'Estender completamente os braços', 'Balançar o corpo']::text[],
    NULL,
    8.0,
    7,
    ARRAY['Cabo', 'Aparelho de musculação completo', 'Faixa de resistência']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Elevação lateral com o corpo inclinado',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides laterais realizado com o tronco inclinado, alterando o ângulo de trabalho.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Incline o tronco para um lado, segurando em algo para apoio' || CHR(10) || '3. Segure um halter com o braço do lado inclinado' || CHR(10) || '4. Mantenha o braço levemente flexionado' || CHR(10) || '5. Eleve o halter lateralmente até a altura do ombro' || CHR(10) || '6. Contraia os deltoides laterais e trapézios no topo' || CHR(10) || '7. Mantenha a contração por 1 segundo' || CHR(10) || '8. Desça o halter lentamente até a posição inicial' || CHR(10) || '9. Complete todas as repetições de um lado antes de trocar',
    ARRAY['Usar carga excessiva', 'Balançar o corpo', 'Estender completamente o braço', 'Inclinar demais o tronco']::text[],
    NULL,
    8.0,
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
    'Remada vertical com cabo',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides frontais e trapézio realizado com cabo, proporcionando tensão constante.',
    '1. Posicione-se em pé na frente da máquina de cabos' || CHR(10) || '2. Ajuste a polia para a altura dos joelhos' || CHR(10) || '3. Segure a alça com pegada pronada' || CHR(10) || '4. Mantenha as costas retas e o core contraído' || CHR(10) || '5. Puxe o cabo verticalmente em direção ao peito' || CHR(10) || '6. Mantenha os cotovelos acima dos punhos durante o movimento' || CHR(10) || '7. Contraia os deltoides frontais e trapézios no topo' || CHR(10) || '8. Mantenha a contração por 1 segundo' || CHR(10) || '9. Desça o cabo lentamente até a posição inicial',
    ARRAY['Usar carga excessiva', 'Balançar o corpo', 'Baixar os cotovelos', 'Puxar muito alto']::text[],
    NULL,
    15.0,
    7,
    ARRAY['Cabo', 'Academia completa']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Puxão facial',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides posteriores e trapézio realizado com cabo, puxando em direção ao rosto.',
    '1. Posicione-se em pé na frente da máquina de cabos' || CHR(10) || '2. Ajuste a polia para a altura dos olhos' || CHR(10) || '3. Segure a corda ou alça com pegada neutra' || CHR(10) || '4. Mantenha os braços paralelos ao chão' || CHR(10) || '5. Puxe a corda em direção ao rosto, separando as mãos' || CHR(10) || '6. Mantenha os cotovelos altos durante o movimento' || CHR(10) || '7. Contraia os deltoides posteriores e trapézios no final' || CHR(10) || '8. Mantenha a contração por 1 segundo' || CHR(10) || '9. Retorne a corda lentamente até a posição inicial',
    ARRAY['Usar carga excessiva', 'Baixar os cotovelos', 'Puxar muito baixo', 'Balançar o corpo']::text[],
    NULL,
    12.0,
    7,
    ARRAY['Cabo', 'Academia completa']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Remada alta com cabo em posição de meio ajoelhado',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides frontais e trapézio realizado com cabo na posição de meio ajoelhado para maior estabilidade.',
    '1. Ajoelhe-se em um joelho na frente da máquina de cabos' || CHR(10) || '2. Ajuste a polia para a altura dos joelhos' || CHR(10) || '3. Segure a alça com pegada pronada' || CHR(10) || '4. Mantenha o tronco ereto e o core contraído' || CHR(10) || '5. Puxe o cabo verticalmente em direção ao peito' || CHR(10) || '6. Mantenha os cotovelos acima dos punhos durante o movimento' || CHR(10) || '7. Contraia os deltoides frontais e trapézios no topo' || CHR(10) || '8. Mantenha a contração por 1 segundo' || CHR(10) || '9. Desça o cabo lentamente até a posição inicial',
    ARRAY['Usar carga excessiva', 'Balançar o corpo', 'Baixar os cotovelos', 'Perder estabilidade']::text[],
    NULL,
    12.0,
    7,
    ARRAY['Cabo', 'Academia completa']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Elevação com halteres',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides frontais e trapézio realizado com halteres, elevando os braços à frente.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Segure halteres com pegada pronada' || CHR(10) || '3. Mantenha os braços estendidos à frente do corpo' || CHR(10) || '4. Mantenha as costas retas e o core contraído' || CHR(10) || '5. Eleve os halteres à frente até a altura dos ombros' || CHR(10) || '6. Contraia os deltoides frontais e trapézios no topo' || CHR(10) || '7. Mantenha a contração por 1 segundo' || CHR(10) || '8. Desça os halteres lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Balançar o corpo', 'Elevar muito alto', 'Arquear as costas']::text[],
    NULL,
    8.0,
    7,
    ARRAY['Halteres', 'Academia completa']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Remada vertical com halteres',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides frontais e trapézio realizado com halteres, puxando verticalmente.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Segure halteres com pegada pronada' || CHR(10) || '3. Mantenha as costas retas e o core contraído' || CHR(10) || '4. Puxe os halteres verticalmente em direção ao peito' || CHR(10) || '5. Mantenha os cotovelos acima dos punhos durante o movimento' || CHR(10) || '6. Contraia os deltoides frontais e trapézios no topo' || CHR(10) || '7. Mantenha a contração por 1 segundo' || CHR(10) || '8. Desça os halteres lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Balançar o corpo', 'Baixar os cotovelos', 'Puxar muito alto']::text[],
    NULL,
    10.0,
    7,
    ARRAY['Halteres', 'Academia completa']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Desenvolvimento militar com peso corporal',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides e trapézio realizado apenas com o peso corporal, sem necessidade de equipamentos.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Coloque as mãos no chão à frente do corpo' || CHR(10) || '3. Mantenha os braços estendidos e o corpo em posição de flexão' || CHR(10) || '4. Mantenha as costas retas e o core contraído' || CHR(10) || '5. Flexione os braços e desça o corpo em direção ao chão' || CHR(10) || '6. Empurre o corpo de volta à posição inicial' || CHR(10) || '7. Ao empurrar, eleve os quadris e empurre o corpo para cima e para trás' || CHR(10) || '8. Contraia os deltoides e trapézios durante o movimento' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Arquear as costas', 'Não completar o movimento', 'Perder alinhamento', 'Movimento muito rápido']::text[],
    NULL,
    0.0,
    7,
    ARRAY['Ginásio completo', 'SEM EQUIPAMENTOS']::text[],
    true,
    'Avançado',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Remada alta de joelhos',
    'Ombros',
    ARRAY['Trapézio', 'Costas']::text[],
    'Exercício de deltoides frontais, trapézio e costas realizado com cabo na posição de joelhos.',
    '1. Ajoelhe-se na frente da máquina de cabos' || CHR(10) || '2. Ajuste a polia para a altura dos joelhos' || CHR(10) || '3. Segure a alça com pegada pronada' || CHR(10) || '4. Mantenha o tronco ereto e o core contraído' || CHR(10) || '5. Puxe o cabo verticalmente em direção ao peito' || CHR(10) || '6. Mantenha os cotovelos acima dos punhos durante o movimento' || CHR(10) || '7. Contraia os deltoides frontais, trapézios e costas no topo' || CHR(10) || '8. Mantenha a contração por 1 segundo' || CHR(10) || '9. Desça o cabo lentamente até a posição inicial',
    ARRAY['Usar carga excessiva', 'Balançar o corpo', 'Baixar os cotovelos', 'Perder estabilidade']::text[],
    NULL,
    12.0,
    7,
    ARRAY['Cabo', 'Academia completa']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Remada vertical com barra EZ',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides frontais e trapézio realizado com barra EZ, proporcionando pegada mais confortável.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Segure a barra EZ com pegada pronada' || CHR(10) || '3. Mantenha as costas retas e o core contraído' || CHR(10) || '4. Puxe a barra verticalmente em direção ao peito' || CHR(10) || '5. Mantenha os cotovelos acima dos punhos durante o movimento' || CHR(10) || '6. Contraia os deltoides frontais e trapézios no topo' || CHR(10) || '7. Mantenha a contração por 1 segundo' || CHR(10) || '8. Desça a barra lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Balançar o corpo', 'Baixar os cotovelos', 'Puxar muito alto']::text[],
    NULL,
    15.0,
    7,
    ARRAY['Barra', 'Academia completa']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Band Pull-Apart',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides posteriores e trapézio realizado com faixa de resistência, puxando as extremidades.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Segure a faixa de resistência com as mãos afastadas na largura dos ombros' || CHR(10) || '3. Mantenha os braços estendidos à frente do corpo' || CHR(10) || '4. Mantenha as costas retas e o core contraído' || CHR(10) || '5. Puxe a faixa separando as mãos, mantendo os braços estendidos' || CHR(10) || '6. Contraia os deltoides posteriores e trapézios no final do movimento' || CHR(10) || '7. Mantenha a contração por 1 segundo' || CHR(10) || '8. Retorne as mãos lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar faixa muito resistente', 'Flexionar os braços', 'Balançar o corpo', 'Não completar o movimento']::text[],
    NULL,
    0.0,
    6,
    ARRAY['Cabo', 'Aparelho de musculação completo', 'Faixa de resistência']::text[],
    false,
    'Iniciante',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Voo de cabo reverso dobrado',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides posteriores e trapézio realizado com cabos, com o tronco dobrado para frente.',
    '1. Posicione-se em pé entre duas máquinas de cabos' || CHR(10) || '2. Ajuste as polias para a altura dos joelhos' || CHR(10) || '3. Incline o tronco para frente a aproximadamente 45 graus' || CHR(10) || '4. Segure as alças com pegada neutra' || CHR(10) || '5. Mantenha os braços levemente flexionados' || CHR(10) || '6. Abra os braços em movimento de voo, contraindo os deltoides posteriores' || CHR(10) || '7. Mantenha a contração por 1 segundo' || CHR(10) || '8. Retorne os braços lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Arquear as costas', 'Estender completamente os braços', 'Balançar o corpo']::text[],
    NULL,
    8.0,
    7,
    ARRAY['Cabo', 'Aparelho de musculação completo', 'Faixa de resistência']::text[],
    false,
    'Intermediário',
    ARRAY[]::text[],
    true,
    transaction_timestamp(),
    transaction_timestamp()
),
(
    gen_random_uuid(),
    'Elevação inversa com barra inclinada',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides posteriores e trapézio realizado com barra em banco inclinado.',
    '1. Deite-se de bruços em um banco inclinado a 30-45 graus' || CHR(10) || '2. Segure a barra com pegada pronada' || CHR(10) || '3. Mantenha os braços estendidos pendurados' || CHR(10) || '4. Mantenha a cabeça alinhada com a coluna' || CHR(10) || '5. Eleve a barra em movimento de voo, contraindo os deltoides posteriores' || CHR(10) || '6. Mantenha os braços levemente flexionados durante o movimento' || CHR(10) || '7. Mantenha a contração por 1 segundo' || CHR(10) || '8. Desça a barra lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Arquear as costas', 'Estender completamente os braços', 'Levantar a cabeça demais']::text[],
    NULL,
    15.0,
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
    'Elevação posterior com barra',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides posteriores e trapézio realizado com barra, elevando os braços para trás.',
    '1. Fique em pé com os pés na largura dos ombros' || CHR(10) || '2. Incline o tronco para frente a aproximadamente 45 graus' || CHR(10) || '3. Segure a barra com pegada pronada' || CHR(10) || '4. Mantenha os braços estendidos pendurados' || CHR(10) || '5. Eleve a barra para trás, contraindo os deltoides posteriores' || CHR(10) || '6. Mantenha os braços levemente flexionados durante o movimento' || CHR(10) || '7. Mantenha a contração por 1 segundo' || CHR(10) || '8. Desça a barra lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Arquear as costas', 'Estender completamente os braços', 'Balançar o corpo']::text[],
    NULL,
    20.0,
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
    'Voador inverso com halteres inclinado',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides posteriores e trapézio realizado com halteres em banco inclinado.',
    '1. Deite-se de bruços em um banco inclinado a 30-45 graus' || CHR(10) || '2. Segure halteres com pegada neutra' || CHR(10) || '3. Mantenha os braços estendidos pendurados' || CHR(10) || '4. Mantenha a cabeça alinhada com a coluna' || CHR(10) || '5. Abra os braços em movimento de voo, contraindo os deltoides posteriores' || CHR(10) || '6. Mantenha os braços levemente flexionados durante o movimento' || CHR(10) || '7. Mantenha a contração por 1 segundo' || CHR(10) || '8. Retorne os braços lentamente até a posição inicial' || CHR(10) || '9. Execute o movimento de forma controlada',
    ARRAY['Usar carga excessiva', 'Arquear as costas', 'Estender completamente os braços', 'Levantar a cabeça demais']::text[],
    NULL,
    8.0,
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
    'Elevação em Y com halteres inclinados',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides e trapézio realizado com halteres em movimento em formato de Y.',
    '1. Deite-se de bruços em um banco inclinado a 30-45 graus' || CHR(10) || '2. Segure halteres com pegada neutra' || CHR(10) || '3. Mantenha os braços estendidos pendurados' || CHR(10) || '4. Mantenha a cabeça alinhada com a coluna' || CHR(10) || '5. Eleve os halteres em movimento em formato de Y' || CHR(10) || '6. Mantenha os braços estendidos durante o movimento' || CHR(10) || '7. Contraia os deltoides e trapézios no topo' || CHR(10) || '8. Mantenha a contração por 1 segundo' || CHR(10) || '9. Desça os halteres lentamente até a posição inicial',
    ARRAY['Usar carga excessiva', 'Arquear as costas', 'Flexionar os braços', 'Levantar a cabeça demais']::text[],
    NULL,
    5.0,
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
    'Elevação em T inclinada com halteres',
    'Ombros',
    ARRAY['Trapézio']::text[],
    'Exercício de deltoides e trapézio realizado com halteres em movimento em formato de T.',
    '1. Deite-se de bruços em um banco inclinado a 30-45 graus' || CHR(10) || '2. Segure halteres com pegada neutra' || CHR(10) || '3. Mantenha os braços estendidos pendurados' || CHR(10) || '4. Mantenha a cabeça alinhada com a coluna' || CHR(10) || '5. Eleve os halteres em movimento em formato de T' || CHR(10) || '6. Mantenha os braços estendidos durante o movimento' || CHR(10) || '7. Contraia os deltoides e trapézios no topo' || CHR(10) || '8. Mantenha a contração por 1 segundo' || CHR(10) || '9. Desça os halteres lentamente até a posição inicial',
    ARRAY['Usar carga excessiva', 'Arquear as costas', 'Flexionar os braços', 'Levantar a cabeça demais']::text[],
    NULL,
    5.0,
    7,
    ARRAY['Halteres', 'Academia completa']::text[],
    false,
    'Intermediário',
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

