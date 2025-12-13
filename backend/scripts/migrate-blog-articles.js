"use strict";
/**
 * Script de Migração de Artigos do Blog
 *
 * Migra os artigos do arquivo estático para o banco de dados.
 * Converte conteúdo JSX para HTML e mapeia todos os campos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Artigos estáticos - dados extraídos e convertidos do arquivo frontend/src/data/blog/articles.tsx
 * Conteúdo JSX convertido para HTML
 */
const staticArticles = [
    {
        id: '1',
        slug: 'guia-completo-treino-iniciantes-academia',
        title: 'Guia Completo de Treino para Iniciantes: Como Começar na Academia sem Erros',
        metaTitle: 'Guia Completo de Treino para Iniciantes | AthletIA Blog',
        metaDescription: 'Aprenda como começar na academia sem erros. Guia completo com dicas práticas, exercícios essenciais e estratégias para iniciantes evoluírem com segurança.',
        keywords: ['treino iniciante', 'academia iniciantes', 'como começar treinar', 'exercícios para iniciantes', 'treino personalizado'],
        author: 'Equipe AthletIA',
        publishedAt: '2025-01-15',
        readingTime: 12,
        category: 'Iniciantes',
        featuredImage: '/images/blog/iniciantes-academia.webp',
        featuredImageAlt: 'Pessoa iniciante treinando na academia com orientação profissional',
        excerpt: 'Começar na academia pode ser intimidador. Este guia completo te ensina tudo que você precisa saber para começar sem erros e evoluir com segurança.',
        content: `<p class="text-lg text-light-muted mb-6">Começar na academia é um passo importante para sua saúde e evolução física. Mas a verdade é que muitos iniciantes desistem nas primeiras semanas por falta de orientação adequada ou por cometerem erros básicos que poderiam ser facilmente evitados.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Por Que Muitos Iniciantes Desistem?</h2>

<p class="mb-4">Estudos mostram que cerca de 50% das pessoas que começam a treinar abandonam nos primeiros 6 meses. Os principais motivos são:</p>

<ul class="list-disc list-inside space-y-2 mb-6 text-light-muted ml-4">
  <li>Falta de orientação personalizada</li>
  <li>Treinos muito complexos ou intensos desde o início</li>
  <li>Expectativas irreais sobre resultados</li>
  <li>Dores e lesões por técnica incorreta</li>
  <li>Falta de progressão clara</li>
</ul>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Os 5 Erros Mais Comuns de Iniciantes</h2>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">1. Querer Treinar Todos os Dias</h3>
<p class="mb-4">Seu corpo precisa de tempo para se recuperar, especialmente quando você está começando. Treinar 7 dias por semana não acelera resultados - na verdade, aumenta o risco de lesões e overtraining.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">2. Copiar Treinos de Influencers</h3>
<p class="mb-4">Treinos de pessoas avançadas não são adequados para iniciantes. Cada corpo é único e precisa de uma abordagem personalizada baseada no seu nível atual, objetivos e limitações.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">3. Ignorar a Técnica</h3>
<p class="mb-4">Executar exercícios com técnica incorreta é uma das principais causas de lesões. Priorize sempre a execução correta sobre a quantidade de peso levantado.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">4. Não Ter um Plano</h3>
<p class="mb-4">Chegar na academia sem saber o que fazer é um caminho certo para a frustração. Você precisa de um plano estruturado que evolua junto com você.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">5. Comparar-se com Outros</h3>
<p class="mb-4">Cada pessoa tem um ritmo de evolução diferente. Foque no seu progresso, não no progresso dos outros.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Como Começar Corretamente</h2>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">Passo 1: Defina Seus Objetivos</h3>
<p class="mb-4">Antes de tudo, tenha clareza sobre o que você quer alcançar. Perder gordura? Ganhar massa muscular? Melhorar condicionamento? Objetivos claros facilitam a criação de um treino adequado.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">Passo 2: Comece com Frequência Adequada</h3>
<p class="mb-4">Para iniciantes, 3 vezes por semana é ideal. Isso permite recuperação adequada e aprendizado da técnica sem sobrecarregar o corpo.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">Passo 3: Foque em Exercícios Compostos</h3>
<p class="mb-4">Exercícios como agachamento, supino, levantamento terra e remada trabalham múltiplos grupos musculares ao mesmo tempo, oferecendo mais resultados em menos tempo.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">Passo 4: Aprenda a Técnica Primeiro</h3>
<p class="mb-4">Antes de aumentar a carga, domine a técnica. Use pesos leves ou até mesmo apenas o peso corporal nas primeiras semanas para criar memória motora correta.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">Passo 5: Tenha um Plano de Progressão</h3>
<p class="mb-4">Seu treino precisa evoluir junto com você. Aumente gradualmente a carga, volume ou intensidade conforme seu corpo se adapta.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Estrutura de Treino Ideal para Iniciantes</h2>

<p class="mb-4">Um treino completo para iniciantes deve incluir:</p>

<ul class="list-disc list-inside space-y-2 mb-6 text-light-muted ml-4">
  <li><strong class="text-light">Aquecimento:</strong> 5-10 minutos de cardio leve</li>
  <li><strong class="text-light">Exercícios principais:</strong> 4-6 exercícios compostos</li>
  <li><strong class="text-light">Volume:</strong> 3 séries de 8-12 repetições</li>
  <li><strong class="text-light">Descanso:</strong> 60-90 segundos entre séries</li>
  <li><strong class="text-light">Alongamento:</strong> 5-10 minutos ao final</li>
</ul>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">A Importância da Personalização</h2>

<p class="mb-4">Cada pessoa tem necessidades diferentes. Um treino genérico pode funcionar no início, mas para resultados consistentes e duradouros, você precisa de algo adaptado ao seu corpo, objetivos, tempo disponível e limitações.</p>

<p class="mb-4">É por isso que sistemas inteligentes de treino estão se tornando essenciais. Eles analisam seu perfil completo e criam um plano que evolui junto com você, ajustando automaticamente conforme você progride.</p>`,
        cta: {
            title: 'Treino Personalizado para Iniciantes',
            description: 'O AthletIA cria seu treino completo em 2 minutos, adaptado ao seu nível atual e objetivos. Sem complicação, sem erros.',
            buttonText: 'Criar meu treino agora'
        }
    },
    {
        id: '2',
        slug: 'como-perder-gordura-eficiente-ciencia-estrategias',
        title: 'Como Perder Gordura de Forma Eficiente: Ciência e Estratégias Práticas',
        metaTitle: 'Como Perder Gordura de Forma Eficiente | Guia Científico | AthletIA',
        metaDescription: 'Aprenda como perder gordura de forma eficiente baseado em ciência. Estratégias práticas de treino e nutrição para queima de gordura sustentável.',
        keywords: ['perder gordura', 'queima de gordura', 'emagrecimento', 'treino para emagrecer', 'déficit calórico'],
        author: 'Equipe AthletIA',
        publishedAt: '2025-01-16',
        readingTime: 14,
        category: 'Emagrecimento',
        featuredImage: '/images/blog/perder-gordura.webp',
        featuredImageAlt: 'Pessoa treinando para queima de gordura com foco em exercícios eficientes',
        excerpt: 'Perder gordura não é sobre dietas milagrosas. É sobre entender a ciência por trás do déficit calórico e aplicar estratégias práticas de treino e nutrição.',
        content: `<p class="text-lg text-light-muted mb-6">Perder gordura é um dos objetivos mais comuns nas academias, mas também um dos mais mal compreendidos. Muitas pessoas passam anos tentando diferentes dietas e treinos sem resultados consistentes, simplesmente porque não entendem os princípios fundamentais.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">A Verdade Sobre Perder Gordura</h2>

<p class="mb-4">A perda de gordura acontece quando você está em déficit calórico - ou seja, quando você gasta mais calorias do que consome. Simples assim. Não existem atalhos mágicos, mas existem estratégias que tornam esse processo mais eficiente e sustentável.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Os 3 Pilares da Perda de Gordura</h2>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">1. Déficit Calórico Moderado</h3>
<p class="mb-4">Um déficit muito agressivo pode queimar músculo junto com gordura e tornar o processo insustentável. Um déficit de 300-500 calorias por dia é ideal para a maioria das pessoas.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">2. Treino de Força</h3>
<p class="mb-4">Muitos pensam que cardio é a solução, mas treino de força é essencial. Ele preserva massa muscular durante o déficit calórico e aumenta seu metabolismo basal.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">3. Consistência</h3>
<p class="mb-4">Perder gordura é um processo gradual. Mudanças drásticas raramente são sustentáveis. Pequenas mudanças consistentes geram resultados duradouros.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Como Estruturar Seu Treino para Queima de Gordura</h2>

<p class="mb-4">Um treino eficiente para queima de gordura deve:</p>

<ul class="list-disc list-inside space-y-2 mb-6 text-light-muted ml-4">
  <li>Priorizar exercícios compostos que queimam mais calorias</li>
  <li>Manter intensidade alta com descansos controlados</li>
  <li>Incluir algum cardio estratégico, mas não excessivo</li>
  <li>Ser adaptado ao seu nível e tempo disponível</li>
</ul>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Erros Comuns que Impedem a Perda de Gordura</h2>

<p class="mb-4"><strong class="text-light">Erro 1:</strong> Fazer apenas cardio e ignorar treino de força. Isso pode resultar em perda de massa muscular junto com gordura.</p>

<p class="mb-4"><strong class="text-light">Erro 2:</strong> Déficit calórico muito agressivo. Pode funcionar no curto prazo, mas é insustentável e prejudica o metabolismo.</p>

<p class="mb-4"><strong class="text-light">Erro 3:</strong> Não ter um plano estruturado. Treinos aleatórios não geram progressão consistente.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">A Importância da Personalização</h2>

<p class="mb-4">Cada pessoa tem um metabolismo, composição corporal e rotina diferentes. Um treino genérico pode não ser otimizado para suas necessidades específicas. Um sistema que adapta o treino ao seu perfil e objetivos maximiza a eficiência da queima de gordura.</p>`,
        cta: {
            title: 'Treino Otimizado para Queima de Gordura',
            description: 'O AthletIA cria treinos personalizados focados em queima de gordura, adaptados ao seu perfil e objetivos. Maximize seus resultados com um plano que evolui junto com você.',
            buttonText: 'Criar meu treino agora'
        }
    },
    {
        id: '3',
        slug: 'progressao-carga-evoluir-consistentemente-academia',
        title: 'Progressão de Carga: Como Evoluir Consistentemente na Academia',
        metaTitle: 'Progressão de Carga: Como Evoluir Consistentemente | AthletIA',
        metaDescription: 'Aprenda como fazer progressão de carga de forma inteligente. Estratégias práticas para evoluir consistentemente na academia sem platôs.',
        keywords: ['progressão de carga', 'evolução física', 'periodização', 'como evoluir treino', 'progressão treino'],
        author: 'Equipe AthletIA',
        publishedAt: '2025-01-17',
        readingTime: 11,
        category: 'Progressão',
        featuredImage: '/images/blog/progressao-carga.webp',
        featuredImageAlt: 'Pessoa aumentando progressivamente o peso nos exercícios na academia',
        excerpt: 'A progressão de carga é fundamental para resultados consistentes. Aprenda como evoluir seu treino de forma inteligente e sustentável.',
        content: `<p class="text-lg text-light-muted mb-6">Um dos maiores desafios na academia é manter a progressão constante. Muitas pessoas começam bem, mas depois de algumas semanas ou meses, param de evoluir. Isso acontece porque a progressão precisa ser planejada e estruturada, não aleatória.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Por Que a Progressão É Essencial</h2>

<p class="mb-4">Seu corpo se adapta rapidamente aos estímulos. Se você sempre treina com a mesma carga, volume e intensidade, seu corpo para de evoluir. A progressão é o que força seu corpo a se adaptar continuamente, gerando resultados duradouros.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Tipos de Progressão</h2>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">1. Progressão de Carga</h3>
<p class="mb-4">Aumentar o peso levantado é a forma mais comum de progressão. Mas precisa ser gradual - aumentar 2,5kg a 5kg por semana é um bom ritmo para a maioria dos exercícios.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">2. Progressão de Volume</h3>
<p class="mb-4">Aumentar o número de séries ou repetições também é uma forma eficiente de progressão, especialmente quando aumentar a carga não é mais viável.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">3. Progressão de Intensidade</h3>
<p class="mb-4">Reduzir o tempo de descanso, aumentar a velocidade de execução ou usar técnicas avançadas são formas de aumentar a intensidade sem necessariamente aumentar a carga.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Como Fazer Progressão Inteligente</h2>

<p class="mb-4">A progressão deve ser:</p>

<ul class="list-disc list-inside space-y-2 mb-6 text-light-muted ml-4">
  <li><strong class="text-light">Gradual:</strong> Mudanças pequenas e consistentes</li>
  <li><strong class="text-light">Registrada:</strong> Anote seus treinos para acompanhar progresso</li>
  <li><strong class="text-light">Adaptada:</strong> Diferentes exercícios podem ter ritmos diferentes</li>
  <li><strong class="text-light">Sustentável:</strong> Não adianta progredir rápido se não conseguir manter</li>
</ul>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">A Importância da Automação</h2>

<p class="mb-4">Fazer progressão manualmente requer disciplina e conhecimento técnico. Um sistema inteligente que ajusta automaticamente carga, volume e intensidade baseado no seu desempenho real elimina a necessidade de você pensar nisso, permitindo que você foque apenas em treinar.</p>`,
        cta: {
            title: 'Progressão Automática de Carga',
            description: 'O AthletIA ajusta automaticamente peso, repetições e volume a cada treino baseado no seu desempenho. Você só treina, o sistema evolui.',
            buttonText: 'Criar meu treino agora'
        }
    },
    {
        id: '4',
        slug: 'treino-casa-vs-academia-qual-escolher-otimizar',
        title: 'Treino em Casa vs Academia: Qual Escolher e Como Otimizar',
        metaTitle: 'Treino em Casa vs Academia: Qual Escolher? | AthletIA',
        metaDescription: 'Compare treino em casa e academia. Descubra qual é melhor para você e como otimizar seus treinos em qualquer ambiente.',
        keywords: ['treino em casa', 'treino academia', 'treino sem equipamento', 'treino adaptado', 'treino flexível'],
        author: 'Equipe AthletIA',
        publishedAt: '2025-01-18',
        readingTime: 10,
        category: 'Treino',
        featuredImage: '/images/blog/casa-vs-academia.webp',
        featuredImageAlt: 'Comparação entre treino em casa e na academia mostrando diferentes ambientes',
        excerpt: 'Treino em casa ou academia? Ambos têm vantagens. Descubra qual se adapta melhor à sua rotina e como otimizar seus treinos em qualquer ambiente.',
        content: `<p class="text-lg text-light-muted mb-6">Uma das dúvidas mais comuns é: treinar em casa ou na academia? A verdade é que ambos podem ser eficientes, desde que você saiba como otimizar cada ambiente para seus objetivos.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Vantagens da Academia</h2>

<ul class="list-disc list-inside space-y-2 mb-6 text-light-muted ml-4">
  <li>Equipamentos variados e especializados</li>
  <li>Ambiente focado no treino</li>
  <li>Possibilidade de cargas mais altas</li>
  <li>Maior variedade de exercícios</li>
</ul>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Vantagens do Treino em Casa</h2>

<ul class="list-disc list-inside space-y-2 mb-6 text-light-muted ml-4">
  <li>Economia de tempo e dinheiro</li>
  <li>Flexibilidade de horário</li>
  <li>Privacidade e conforto</li>
  <li>Sem desculpas para faltar</li>
</ul>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">A Solução: Treino Adaptado ao Seu Ambiente</h2>

<p class="mb-4">O ideal é ter um treino que se adapte ao ambiente que você tem disponível. Se você tem acesso a academia, aproveite os equipamentos. Se treina em casa, use exercícios com peso corporal ou equipamentos básicos. O importante é ter um plano estruturado para cada situação.</p>

<p class="mb-4">Sistemas inteligentes de treino podem criar planos diferentes para diferentes ambientes, garantindo que você sempre tenha um treino otimizado, independente de onde esteja.</p>`,
        cta: {
            title: 'Treino Adaptado ao Seu Ambiente',
            description: 'O AthletIA cria treinos personalizados para academia, casa ou ambiente misto. Você escolhe onde treinar, nós adaptamos o treino.',
            buttonText: 'Criar meu treino agora'
        }
    },
    {
        id: '5',
        slug: 'mentalidade-disciplina-manter-consistencia-treinos',
        title: 'Mentalidade e Disciplina: Como Manter Consistência nos Treinos',
        metaTitle: 'Mentalidade e Disciplina nos Treinos | Como Manter Consistência | AthletIA',
        metaDescription: 'Aprenda como desenvolver mentalidade e disciplina para manter consistência nos treinos. Estratégias práticas de psicologia do exercício.',
        keywords: ['disciplina treino', 'consistência treino', 'mentalidade fitness', 'motivação treino', 'hábitos fitness'],
        author: 'Equipe AthletIA',
        publishedAt: '2025-01-19',
        readingTime: 13,
        category: 'Mentalidade',
        featuredImage: '/images/blog/mentalidade-disciplina.webp',
        featuredImageAlt: 'Pessoa meditando e treinando mostrando conexão entre mentalidade e exercício',
        excerpt: 'A disciplina é mais importante que a motivação. Aprenda estratégias práticas para desenvolver mentalidade forte e manter consistência nos treinos.',
        content: `<p class="text-lg text-light-muted mb-6">Você já começou a treinar várias vezes, mas sempre para depois de algumas semanas? O problema provavelmente não é falta de motivação - é falta de sistemas que facilitem a consistência.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Motivação vs Disciplina</h2>

<p class="mb-4">A motivação é temporária. Ela aparece e desaparece. A disciplina, por outro lado, é o que te faz treinar mesmo quando não está motivado. E a boa notícia é que disciplina pode ser desenvolvida através de sistemas e hábitos.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Como Desenvolver Disciplina</h2>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">1. Reduza Fricção</h3>
<p class="mb-4">Quanto mais fácil for treinar, mais você vai treinar. Tenha um plano claro, roupas prontas, horário definido. Elimine decisões desnecessárias.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">2. Comece Pequeno</h3>
<p class="mb-4">Não tente mudar tudo de uma vez. Comece com 2-3 treinos por semana. Depois que isso virar hábito, aumente gradualmente.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">3. Use Sistemas, Não Força de Vontade</h3>
<p class="mb-4">Sistemas inteligentes que criam seu treino automaticamente eliminam a necessidade de você decidir o que fazer. Isso reduz drasticamente a fricção mental.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">A Importância de Simplificar</h2>

<p class="mb-4">Quanto mais complexo for seu treino, mais fácil é desistir. Um sistema que simplifica o processo - criando treinos, ajustando progressão, adaptando ao seu desempenho - remove barreiras mentais e facilita a consistência.</p>`,
        cta: {
            title: 'Sistema que Facilita Consistência',
            description: 'O AthletIA remove a complexidade dos treinos. Você só abre o app e treina. Sem decisões, sem complicação, apenas resultados.',
            buttonText: 'Criar meu treino agora'
        }
    },
    {
        id: '6',
        slug: 'erros-comuns-impedem-resultados-academia-evitar',
        title: 'Erros Comuns que Impedem Resultados na Academia (e Como Evitá-los)',
        metaTitle: 'Erros Comuns na Academia que Impedem Resultados | AthletIA',
        metaDescription: 'Descubra os erros mais comuns que impedem resultados na academia e aprenda como evitá-los para acelerar sua evolução física.',
        keywords: ['erros academia', 'erros treino', 'por que não evolui', 'erros comuns treino', 'como evitar erros treino'],
        author: 'Equipe AthletIA',
        publishedAt: '2025-01-20',
        readingTime: 15,
        category: 'Erros',
        featuredImage: '/images/blog/erros-comuns.webp',
        featuredImageAlt: 'Pessoa cometendo erros comuns no treino e depois corrigindo a técnica',
        excerpt: 'Muitas pessoas treinam por meses sem resultados. Descubra os erros mais comuns que impedem evolução e aprenda como evitá-los.',
        content: `<p class="text-lg text-light-muted mb-6">Você treina há meses, mas não vê resultados? Provavelmente está cometendo algum desses erros comuns que a maioria das pessoas não percebe.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Os 7 Erros Mais Comuns</h2>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">1. Não Ter um Plano</h3>
<p class="mb-4">Chegar na academia sem saber o que fazer é garantia de resultados medíocres. Você precisa de um plano estruturado que evolua.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">2. Não Fazer Progressão</h3>
<p class="mb-4">Se você sempre treina igual, seu corpo para de evoluir. Progressão é essencial para resultados contínuos.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">3. Técnica Incorreta</h3>
<p class="mb-4">Executar exercícios com técnica ruim não só reduz resultados como aumenta risco de lesões.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">4. Treinar Demais ou de Menos</h3>
<p class="mb-4">O volume ideal varia por pessoa. Muito pouco não gera estímulo suficiente, muito pode causar overtraining.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">5. Não Descansar Adequadamente</h3>
<p class="mb-4">Seu corpo evolui durante o descanso, não durante o treino. Sono e recuperação são fundamentais.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">6. Comparar-se com Outros</h3>
<p class="mb-4">Cada pessoa tem um ritmo diferente. Foque no seu progresso, não no dos outros.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">7. Usar Treinos Genéricos</h3>
<p class="mb-4">Treinos que não foram feitos para você dificilmente vão gerar resultados ideais. Personalização é chave.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">A Solução: Sistema Inteligente</h2>

<p class="mb-4">Um sistema inteligente de treino evita todos esses erros automaticamente. Ele cria um plano personalizado, ajusta progressão, garante técnica adequada e se adapta ao seu desempenho real.</p>`,
        cta: {
            title: 'Treino que Evita Erros Automaticamente',
            description: 'O AthletIA cria treinos personalizados que evitam os erros mais comuns. Você treina certo desde o primeiro dia.',
            buttonText: 'Criar meu treino agora'
        }
    },
    {
        id: '7',
        slug: 'treino-inteligente-ia-acelerar-evolucao-fisica',
        title: 'Treino Inteligente: Como a IA Pode Acelerar Sua Evolução Física',
        metaTitle: 'Treino Inteligente com IA | Acelere Evolução Física | AthletIA',
        metaDescription: 'Descubra como inteligência artificial está revolucionando treinos personalizados. Veja como IA pode acelerar sua evolução física.',
        keywords: ['treino IA', 'treino inteligente', 'IA fitness', 'treino personalizado IA', 'tecnologia fitness'],
        author: 'Equipe AthletIA',
        publishedAt: '2025-01-21',
        readingTime: 12,
        category: 'Tecnologia',
        featuredImage: '/images/blog/treino-ia.webp',
        featuredImageAlt: 'Interface de treino inteligente com IA mostrando personalização automática',
        excerpt: 'A inteligência artificial está transformando como treinamos. Descubra como IA pode criar treinos personalizados que aceleram sua evolução física.',
        content: `<p class="text-lg text-light-muted mb-6">A inteligência artificial está revolucionando o fitness. Sistemas inteligentes podem analisar seu perfil completo e criar treinos que se adaptam em tempo real, algo que seria impossível fazer manualmente.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Como IA Transforma Treinos</h2>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">Análise Profunda do Perfil</h3>
<p class="mb-4">IA analisa seu corpo, objetivos, histórico, limitações e preferências para criar um treino verdadeiramente personalizado.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">Ajuste Automático</h3>
<p class="mb-4">A cada treino, o sistema aprende com seu desempenho e ajusta automaticamente carga, volume e intensidade.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">Otimização Contínua</h3>
<p class="mb-4">O sistema não para de otimizar. Quanto mais você treina, melhor ele fica em criar treinos ideais para você.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Por Que Isso Funciona Melhor</h2>

<p class="mb-4">Um personal trainer humano precisa lembrar de tudo, fazer cálculos mentais e pode esquecer detalhes. IA processa milhares de variáveis simultaneamente e nunca esquece. O resultado é um treino mais preciso e eficiente.</p>`,
        cta: {
            title: 'Conheça o AthletIA',
            description: 'O AthletIA usa inteligência artificial para criar treinos personalizados que evoluem junto com você. Experimente a diferença.',
            buttonText: 'Criar meu treino agora'
        }
    },
    {
        id: '8',
        slug: 'treino-pouco-tempo-maximizar-resultados-30-45-minutos',
        title: 'Treino com Pouco Tempo: Como Maximizar Resultados em 30-45 Minutos',
        metaTitle: 'Treino com Pouco Tempo | Maximize Resultados em 30-45 Min | AthletIA',
        metaDescription: 'Aprenda como fazer treinos eficientes em 30-45 minutos. Estratégias para maximizar resultados mesmo com pouco tempo disponível.',
        keywords: ['treino rápido', 'treino eficiente', 'treino 30 minutos', 'treino pouco tempo', 'treino otimizado'],
        author: 'Equipe AthletIA',
        publishedAt: '2025-01-22',
        readingTime: 10,
        category: 'Eficiência',
        featuredImage: '/images/blog/treino-rapido.webp',
        featuredImageAlt: 'Pessoa fazendo treino eficiente em pouco tempo com foco em resultados',
        excerpt: 'Não tem tempo para treinos longos? Aprenda como maximizar resultados em apenas 30-45 minutos com estratégias de treino eficiente.',
        content: `<p class="text-lg text-light-muted mb-6">Muitas pessoas desistem de treinar porque acham que não têm tempo. Mas a verdade é que você não precisa de 2 horas na academia para ter resultados. Treinos de 30-45 minutos, quando bem estruturados, podem ser extremamente eficientes.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Como Otimizar Treinos Curtos</h2>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">1. Priorize Exercícios Compostos</h3>
<p class="mb-4">Exercícios que trabalham múltiplos músculos ao mesmo tempo são mais eficientes. Agachamento, supino, remada - esses exercícios dão mais resultado por minuto.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">2. Reduza Descansos</h3>
<p class="mb-4">Com treinos curtos, você precisa otimizar o tempo. Descansos de 60 segundos entre séries mantêm intensidade alta sem comprometer recuperação.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">3. Elimine Exercícios Desnecessários</h3>
<p class="mb-4">Foque no essencial. 4-6 exercícios bem escolhidos são mais eficientes que 10 exercícios aleatórios.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">A Importância da Estrutura</h2>

<p class="mb-4">Um treino de 30 minutos precisa ser perfeitamente estruturado. Cada minuto conta. Sistemas inteligentes podem criar treinos otimizados especificamente para seu tempo disponível, maximizando resultados.</p>`,
        cta: {
            title: 'Treinos Otimizados para Seu Tempo',
            description: 'O AthletIA cria treinos eficientes adaptados ao seu tempo disponível. Maximize resultados mesmo com apenas 30 minutos por dia.',
            buttonText: 'Criar meu treino agora'
        }
    },
    {
        id: '9',
        slug: 'saude-alem-estetica-beneficios-reais-treino-regular',
        title: 'Saúde Além da Estética: Benefícios Reais do Treino Regular',
        metaTitle: 'Benefícios do Treino Regular para Saúde | Além da Estética | AthletIA',
        metaDescription: 'Descubra os benefícios reais do treino regular para saúde física e mental. Vá além da estética e entenda o impacto na qualidade de vida.',
        keywords: ['benefícios treino', 'saúde treino', 'qualidade de vida', 'treino saúde mental', 'benefícios exercício'],
        author: 'Equipe AthletIA',
        publishedAt: '2025-01-23',
        readingTime: 11,
        category: 'Saúde',
        featuredImage: '/images/blog/saude-estetica.webp',
        featuredImageAlt: 'Pessoa treinando mostrando benefícios de saúde além da estética',
        excerpt: 'O treino vai muito além da estética. Descubra os benefícios reais para saúde física e mental que o exercício regular proporciona.',
        content: `<p class="text-lg text-light-muted mb-6">Muitas pessoas começam a treinar pensando apenas na estética, mas os benefícios reais do exercício regular vão muito além da aparência física.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Benefícios Físicos</h2>

<ul class="list-disc list-inside space-y-2 mb-6 text-light-muted ml-4">
  <li>Melhora da saúde cardiovascular</li>
  <li>Fortalecimento do sistema imunológico</li>
  <li>Melhora da densidade óssea</li>
  <li>Controle de pressão arterial</li>
  <li>Melhora da qualidade do sono</li>
</ul>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Benefícios Mentais</h2>

<ul class="list-disc list-inside space-y-2 mb-6 text-light-muted ml-4">
  <li>Redução de ansiedade e depressão</li>
  <li>Melhora da autoestima</li>
  <li>Aumento de energia e disposição</li>
  <li>Melhora da função cognitiva</li>
  <li>Redução de estresse</li>
</ul>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">A Importância da Consistência</h2>

<p class="mb-4">Para obter esses benefícios, você precisa de consistência. E a melhor forma de manter consistência é ter um sistema que facilite o processo, removendo barreiras e tornando o treino parte natural da sua rotina.</p>`,
        cta: {
            title: 'Sistema que Ajuda a Manter Consistência',
            description: 'O AthletIA facilita a consistência criando treinos personalizados que se adaptam à sua rotina. Transforme o treino em hábito natural.',
            buttonText: 'Criar meu treino agora'
        }
    },
    {
        id: '10',
        slug: 'periodizacao-inteligente-estruturar-treinos-resultados-duradouros',
        title: 'Periodização Inteligente: Como Estruturar Seus Treinos para Resultados Duradouros',
        metaTitle: 'Periodização Inteligente de Treinos | Resultados Duradouros | AthletIA',
        metaDescription: 'Aprenda sobre periodização de treinos e como estruturar seus treinos para resultados duradouros. Guia completo de planejamento de longo prazo.',
        keywords: ['periodização treino', 'planejamento treino', 'estrutura treino', 'periodização inteligente', 'treino longo prazo'],
        author: 'Equipe AthletIA',
        publishedAt: '2025-01-24',
        readingTime: 14,
        category: 'Periodização',
        featuredImage: '/images/blog/periodizacao.webp',
        featuredImageAlt: 'Gráfico mostrando periodização e evolução de treinos ao longo do tempo',
        excerpt: 'Periodização é a chave para resultados duradouros. Aprenda como estruturar seus treinos em ciclos para evolução contínua e sustentável.',
        content: `<p class="text-lg text-light-muted mb-6">Muitas pessoas treinam sem um plano de longo prazo. Fazem o mesmo treino por meses e depois se perguntam por que pararam de evoluir. A solução é periodização - estruturar seus treinos em ciclos que evoluem estrategicamente.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">O Que É Periodização</h2>

<p class="mb-4">Periodização é o planejamento estratégico de treinos em ciclos (macrociclos, mesociclos, microciclos) que variam volume, intensidade e foco ao longo do tempo para maximizar adaptação e evitar platôs.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Por Que É Importante</h2>

<p class="mb-4">Sem periodização, seu corpo se adapta e para de evoluir. Com periodização, você força adaptações contínuas através de variações estratégicas, gerando resultados duradouros.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">Tipos de Periodização</h2>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">Periodização Linear</h3>
<p class="mb-4">Aumento gradual e constante de intensidade ao longo do tempo. Simples, mas pode ser limitada.</p>

<h3 class="text-xl font-display font-bold text-light mt-6 mb-3">Periodização Ondulatória</h3>
<p class="mb-4">Variação de volume e intensidade em ondas. Mais complexa, mas geralmente mais eficiente.</p>

<h2 class="text-2xl md:text-3xl font-display font-bold text-light mt-8 mb-4">A Complexidade da Periodização Manual</h2>

<p class="mb-4">Fazer periodização manualmente requer conhecimento técnico avançado e muito planejamento. É por isso que sistemas inteligentes estão se tornando essenciais - eles fazem a periodização automaticamente, ajustando ciclos baseado no seu desempenho real.</p>`,
        cta: {
            title: 'Periodização Automática',
            description: 'O AthletIA faz periodização automaticamente, estruturando seus treinos em ciclos que evoluem estrategicamente. Resultados duradouros sem complicação.',
            buttonText: 'Criar meu treino agora'
        }
    }
];
/**
 * Função principal de migração
 */
async function migrateArticles() {
    console.log('🚀 Iniciando migração de artigos do blog...\n');
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    for (const article of staticArticles) {
        try {
            // Verificar se artigo já existe por slug
            const existing = await prisma.blogArticle.findUnique({
                where: { slug: article.slug }
            });
            // Preparar dados para inserção
            const articleData = {
                slug: article.slug,
                title: article.title,
                metaTitle: article.metaTitle,
                metaDescription: article.metaDescription,
                keywords: article.keywords,
                author: article.author,
                publishedAt: new Date(article.publishedAt),
                readingTime: article.readingTime,
                category: article.category,
                featuredImage: article.featuredImage,
                featuredImageAlt: article.featuredImageAlt,
                excerpt: article.excerpt,
                content: article.content,
                ctaTitle: article.cta.title,
                ctaDescription: article.cta.description,
                ctaButtonText: article.cta.buttonText,
                published: true
            };
            if (existing) {
                // Atualizar artigo existente
                await prisma.blogArticle.update({
                    where: { slug: article.slug },
                    data: articleData
                });
                updated++;
                console.log(`✅ Atualizado: ${article.title}`);
            }
            else {
                // Criar novo artigo
                await prisma.blogArticle.create({
                    data: articleData
                });
                created++;
                console.log(`✅ Criado: ${article.title}`);
            }
        }
        catch (error) {
            errors++;
            console.error(`❌ Erro ao processar "${article.title}":`, error.message);
        }
    }
    console.log('\n📊 Resumo da migração:');
    console.log(`   ✅ Criados: ${created}`);
    console.log(`   🔄 Atualizados: ${updated}`);
    console.log(`   ⏭️  Ignorados: ${skipped}`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log('\n✨ Migração concluída!');
}
// Executar migração
migrateArticles()
    .catch((error) => {
    console.error('\n❌ Erro fatal na migração:', error.message);
    if (error.message.includes('Authentication failed') || error.message.includes('database')) {
        console.error('\n💡 Dica: Verifique se:');
        console.error('   1. O banco de dados está rodando');
        console.error('   2. As credenciais no arquivo .env estão corretas');
        console.error('   3. A variável DATABASE_URL está configurada');
    }
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=migrate-blog-articles.js.map