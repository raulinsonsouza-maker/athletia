-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "blog_articles_slug_key" ON "blog_articles"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "blog_articles_slug_idx" ON "blog_articles"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "blog_articles_published_idx" ON "blog_articles"("published");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "blog_articles_category_idx" ON "blog_articles"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "blog_articles_published_at_idx" ON "blog_articles"("published_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "blog_articles_published_published_at_idx" ON "blog_articles"("published", "published_at");

