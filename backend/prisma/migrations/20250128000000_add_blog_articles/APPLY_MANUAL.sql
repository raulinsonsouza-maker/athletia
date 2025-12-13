-- ============================================================================
-- MIGRAÇÃO: Adicionar Tabela blog_articles
-- Data: 2025-01-28
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Conecte-se ao banco de dados PostgreSQL
-- 2. Execute este script completo
-- 3. Verifique se a tabela foi criada: SELECT * FROM blog_articles LIMIT 1;
--
-- ============================================================================

-- Criar tabela blog_articles
CREATE TABLE IF NOT EXISTS "blog_articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "meta_title" TEXT NOT NULL,
    "meta_description" TEXT NOT NULL,
    "keywords" TEXT[],
    "author" TEXT NOT NULL DEFAULT 'Equipe AthletIA',
    "published_at" TIMESTAMP(3),
    "reading_time" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "featured_image" TEXT,
    "featured_image_alt" TEXT,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cta_title" TEXT,
    "cta_description" TEXT,
    "cta_button_text" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_articles_pkey" PRIMARY KEY ("id")
);

-- Criar índice único para slug
CREATE UNIQUE INDEX IF NOT EXISTS "blog_articles_slug_key" ON "blog_articles"("slug");

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS "blog_articles_slug_idx" ON "blog_articles"("slug");
CREATE INDEX IF NOT EXISTS "blog_articles_published_idx" ON "blog_articles"("published");
CREATE INDEX IF NOT EXISTS "blog_articles_category_idx" ON "blog_articles"("category");
CREATE INDEX IF NOT EXISTS "blog_articles_published_at_idx" ON "blog_articles"("published_at");
CREATE INDEX IF NOT EXISTS "blog_articles_published_published_at_idx" ON "blog_articles"("published", "published_at");

-- Verificar se a tabela foi criada
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'blog_articles') THEN
        RAISE NOTICE 'Tabela blog_articles criada com sucesso!';
    ELSE
        RAISE EXCEPTION 'Erro ao criar tabela blog_articles';
    END IF;
END $$;

