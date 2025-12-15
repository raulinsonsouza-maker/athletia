import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateBlog() {
  console.log('🚀 Iniciando migração do blog...');

  try {
    // 1. Criar autor padrão "Equipe AthletIA"
    console.log('📝 Criando autor padrão...');
    let defaultAuthor = await prisma.blogAuthor.findFirst({
      where: { name: 'Equipe AthletIA' }
    });

    if (!defaultAuthor) {
      defaultAuthor = await prisma.blogAuthor.create({
        data: {
          name: 'Equipe AthletIA',
          role: 'Equipe Editorial',
          bio: 'Equipe de especialistas da AthletIA dedicada a produzir conteúdo de qualidade sobre treino, saúde e evolução física.'
        }
      });
      console.log('✅ Autor padrão criado:', defaultAuthor.id);
    } else {
      console.log('✅ Autor padrão já existe:', defaultAuthor.id);
    }

    // 2. Buscar todas as categorias únicas dos posts existentes
    console.log('📂 Migrando categorias...');
    const existingArticles = await prisma.blogArticle.findMany({
      select: { category: true }
    });

    const uniqueCategories = [...new Set(existingArticles.map(a => a.category).filter(Boolean))];
    console.log(`📊 Encontradas ${uniqueCategories.length} categorias únicas`);

    const categoryMap = new Map<string, string>(); // category name -> category id

    for (const categoryName of uniqueCategories) {
      if (!categoryName) continue;

      const slug = categoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      let category = await prisma.blogCategory.findUnique({
        where: { slug }
      });

      if (!category) {
        category = await prisma.blogCategory.create({
          data: {
            name: categoryName,
            slug,
            description: `Artigos sobre ${categoryName.toLowerCase()}`,
            metaTitle: `${categoryName} | Blog AthletIA`,
            metaDescription: `Explore nossos artigos sobre ${categoryName.toLowerCase()} e descubra estratégias práticas para acelerar seus resultados.`
          }
        });
        console.log(`✅ Categoria criada: ${category.name} (${category.slug})`);
      } else {
        console.log(`✅ Categoria já existe: ${category.name}`);
      }

      categoryMap.set(categoryName, category.id);
    }

    // 3. Atualizar posts existentes com as novas FKs
    console.log('📄 Atualizando posts existentes...');
    let updatedCount = 0;

    for (const article of existingArticles) {
      if (!article.category) continue;

      const categoryId = categoryMap.get(article.category);
      if (!categoryId) continue;

      await prisma.blogArticle.updateMany({
        where: {
          category: article.category,
          categoryId: null
        },
        data: {
          categoryId,
          authorId: defaultAuthor.id,
          status: 'published' // Se estava publicado, manter como published
        }
      });

      updatedCount++;
    }

    console.log(`✅ ${updatedCount} posts atualizados`);

    // 4. Criar configurações iniciais do blog
    console.log('⚙️ Criando configurações iniciais do blog...');
    let settings = await prisma.blogSettings.findUnique({
      where: { id: 'global' }
    });

    if (!settings) {
      // Buscar primeiro post publicado como hero padrão
      const firstPublished = await prisma.blogArticle.findFirst({
        where: { published: true },
        orderBy: { publishedAt: 'desc' }
      });

      // Buscar categorias para exibir na home (primeiras 6)
      const categoriesForHome = await prisma.blogCategory.findMany({
        take: 6,
        orderBy: { name: 'asc' }
      });

      settings = await prisma.blogSettings.create({
        data: {
          id: 'global',
          heroPostId: firstPublished?.id || null,
          featuredCount: 3,
          categoriesDisplay: categoriesForHome.map(c => c.id),
          blogIntroText: 'Conteúdo sobre treino, saúde, evolução física e qualidade de vida. Aprenda estratégias práticas para acelerar seus resultados.',
          globalMetaTitle: 'Blog AthletIA | Treino, Saúde e Evolução Física',
          globalMetaDescription: 'Descubra estratégias práticas de treino, saúde e evolução física. Conteúdo especializado para acelerar seus resultados na academia.'
        }
      });
      console.log('✅ Configurações iniciais criadas');
    } else {
      console.log('✅ Configurações já existem');
    }

    console.log('✅ Migração do blog concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migrateBlog()
  .then(() => {
    console.log('🎉 Migração finalizada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal na migração:', error);
    process.exit(1);
  });
