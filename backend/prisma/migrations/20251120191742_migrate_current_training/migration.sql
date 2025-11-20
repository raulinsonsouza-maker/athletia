-- Migração para popular currentTrainingId de usuários existentes
-- Busca o último treino não concluído, ou se não houver, o último treino (concluído ou não)

DO $$
DECLARE
    user_record RECORD;
    treino_id TEXT;
    treino_source TEXT;
BEGIN
    -- Para cada usuário
    FOR user_record IN SELECT id, modo_treino FROM users LOOP
        -- Buscar último treino não concluído do usuário
        SELECT id, criado_por INTO treino_id, treino_source
        FROM treinos
        WHERE user_id = user_record.id
          AND concluido = false
        ORDER BY created_at DESC
        LIMIT 1;

        -- Se não encontrou treino não concluído, buscar último treino (concluído ou não)
        IF treino_id IS NULL THEN
            SELECT id, criado_por INTO treino_id, treino_source
            FROM treinos
            WHERE user_id = user_record.id
            ORDER BY created_at DESC
            LIMIT 1;
        END IF;

        -- Se encontrou treino, atualizar usuário
        IF treino_id IS NOT NULL THEN
            -- Determinar source baseado no criado_por
            IF treino_source = 'IA' THEN
                treino_source := 'IA';
            ELSE
                treino_source := 'MANUAL';
            END IF;

            -- Atualizar usuário
            UPDATE users
            SET current_training_id = treino_id,
                current_training_source = treino_source
            WHERE id = user_record.id;
        END IF;
    END LOOP;
END $$;

