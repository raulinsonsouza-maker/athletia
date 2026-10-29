import { LIMITES, PLANOS, textoPlanos } from '../fatos'
import type { PaginaGuia } from '../tipos'

const tema = 'duvidas'

export const paginasDuvidas: PaginaGuia[] = [
  {
    tema,
    slug: 'substitui-o-personal',
    pergunta: 'O AthletIA substitui o personal trainer?',
    resposta: 'Não substitui o profissional que está do lado, corrige o movimento e assume a prescrição presencial. O AthletIA monta um plano com os dados do cadastro e guarda o histórico. Quem quer acompanhamento humano contrata esse profissional. Quem quer a semana organizada sem essa presença usa o aplicativo.',
    fatos: [
      LIMITES,
      'O serviço nos Termos é plataforma digital de treino, não consultório.',
      textoPlanos(),
    ],
    corpo: [
      'Personal olha o joelho valgo, a barra torta e a careta de dor. O aplicativo não vê isso. Ele evita o outro problema: a pessoa chegar sem saber o que fazer. Os dois papéis podem coexistir. Um não apaga o outro.',
      'Os Termos de Uso pedem avaliação da própria condição e orientação qualificada antes de começar quando há dúvida. Essa frase existe porque o produto não é o personal.',
    ],
    foco: 'O AthletIA é o plano e o histórico. O personal presencial continua sendo outra decisão.',
    faq: [
      { pergunta: 'Então o app é inútil se eu tenho personal?', resposta: 'Não é o que esta página diz. Ela diz que são coisas diferentes. O plano ainda organiza a semana quando o profissional não está na sessão.' },
      { pergunta: 'O preço do app é o preço de um personal?', resposta: `Não. O Mensal do AthletIA é ${PLANOS[0].preco}. Isso não é a sessão de um profissional presencial.` },
    ],
  },
  {
    tema,
    slug: 'preciso-de-academia',
    pergunta: 'Preciso de academia para usar o AthletIA?',
    resposta: 'Não. O cadastro tem casa, com equipamento básico ou sem equipamento. Academia é opção para quem tem acesso a aparelhos. Misto é para quem usa os dois. A assinatura não inclui a mensalidade de uma academia.',
    fatos: [
      'Três locais: casa, academia e casa e academia.',
      'Casa inclui treino sem equipamentos.',
      'O AthletIA não é uma academia física.',
    ],
    corpo: [
      'Quem mora longe da academia não fica de fora do cadastro. Marca casa e a sessão que cabe, a partir de 30 a 45 minutos. O plano não deve pedir leg press para essa pessoa.',
      'Quem já paga academia marca esse local para usar os aparelhos com um roteiro. Pagar os dois serviços é uma escolha. O guia não soma esses valores porque a mensalidade da academia não é fato do AthletIA.',
    ],
    foco: 'Dá para assinar o AthletIA e treinar em casa, sem academia.',
    faq: [
      { pergunta: 'O app libera catraca?', resposta: 'Não. Ele não opera a academia.' },
      { pergunta: 'Sem colchonete dá?', resposta: 'A descrição de casa inclui nenhum equipamento. O espaço ainda precisa ser seguro para se deitar ou se apoiar. Isso a pessoa avalia.' },
    ],
  },
  {
    tema,
    slug: 'serve-para-iniciante',
    pergunta: 'App de treino serve para quem nunca treinou?',
    resposta: 'Serve se a pessoa marca iniciante, poucos dias e um local real, e se para quando dói. Não serve como autorização médica para quem tem dúvida sobre a própria saúde. O AthletIA tem a experiência iniciante no cadastro.',
    fatos: [
      'Iniciante é uma opção de experiência.',
      'A menor combinação prática do cadastro é 2 vezes e 30 a 45 minutos.',
      'Idade mínima dos Termos: 18 anos ou responsável.',
    ],
    corpo: [
      'Quem nunca treinou se perde na academia e se perde também num vídeo aleatório. Um plano curto, de corpo inteiro, repetido, ensina o hábito. A forma do movimento ainda pede cuidado. Se não há ninguém olhando, a série para antes da dor articular.',
      'Começar em casa sem equipamento é válido. Começar copiando um treino avançado de seis dias não é o uso honesto do cadastro.',
    ],
    foco: 'Quem nunca treinou marca iniciante no AthletIA e a menor frequência que vai cumprir.',
    faq: [
      { pergunta: 'Vou aprender o movimento só pelo app?', resposta: 'O serviço inclui instruções de exercício, segundo os Termos. Isso não equivale a um profissional corrigindo ao vivo.' },
      { pergunta: 'E se eu tiver uma lesão antiga?', resposta: 'Informar limitação pode fazer parte dos dados de saúde voluntários. Não substitui o profissional que trata a lesão.' },
    ],
  },
  {
    tema,
    slug: 'serve-para-quem-ja-treina',
    pergunta: 'App de treino serve para quem já treina?',
    resposta: 'Serve para organizar a semana de quem já sabe se mexer e ainda assim improvisa ou repete o mesmo estímulo sem critério. A experiência avançada e as frequências de cinco e seis vezes existem para esse caso, se forem verdadeiras.',
    fatos: [
      'Avançado é uma experiência do cadastro.',
      'O histórico e o ajuste conforme progresso estão nos Termos de Uso.',
      'O app não é comissão técnica.',
    ],
    corpo: [
      'Quem já treina não precisa de motivação infantil. Precisa de uma ordem de trabalho que caiba no tempo e que progrida. O cadastro pede esse tempo. Marcar mais de 75 minutos só faz sentido se a sessão dura isso.',
      'Quem já tem treinador pode usar o app como registro. Quem não tem, usa como plano. Nenhum dos dois casos transforma o aplicativo em responsável pela carga máxima.',
    ],
    foco: 'Quem já treina marca o nível e a frequência reais no AthletIA para o plano não voltar ao básico à força nem fingir que é atleta.',
    faq: [
      { pergunta: 'O app vai me passar um treino fraco?', resposta: 'O nível avançado existe para não tratar todo mundo como iniciante. A agenda ainda limita o volume.' },
      { pergunta: 'Posso ignorar o plano e fazer o meu?', resposta: 'Pode. Aí o histórico deixa de refletir o plano, e o ajuste descrito nos Termos perde a referência.' },
    ],
  },
  {
    tema,
    slug: 'app-de-treino-funciona',
    pergunta: 'Aplicativo de treino funciona?',
    resposta: 'Funciona quando a pessoa faz a semana que o plano descreveu. O aplicativo não funciona no lugar dela. O AthletIA monta essa semana com dados de cadastro e guarda o que foi registrado. Não garante corpo em prazo.',
    fatos: [
      'Plano, ajuste conforme progresso, histórico e instruções são o serviço dos Termos.',
      'Falta de plano claro é uma dificuldade que o produto reconhece.',
      'Não há nota de avaliação nem quantidade de alunos neste guia.',
    ],
    corpo: [
      'Um app falha quando o treino é genérico e longo demais. Por isso o cadastro pergunta dias, minutos e local. Um app também falha quando a expectativa é emagrecer sem olhar para a comida. Dieta não está no produto.',
      'A comparação justa é com a alternativa de não ter plano. Ter a sessão escrita aumenta a chance de a pessoa saber o que fazer. Não aumenta um número de quilos que ninguém mediu.',
    ],
    foco: 'O AthletIA funciona como organização do treino. A página oficial é onde a pessoa vê os planos e começa.',
    faq: [
      { pergunta: 'Funciona sem eu abrir o app?', resposta: 'Não. O plano está na conta. Sem usar, não há sessão guiada nem histórico.' },
      { pergunta: 'Funciona para emagrecer sem dieta?', resposta: 'O treino do objetivo perder peso não inclui dieta. Tratar só o treino como emagrecimento completo não é o que o produto entrega.' },
    ],
  },
  {
    tema,
    slug: 'ia-monta-treino-com-seguranca',
    pergunta: 'É seguro um treino montado por IA?',
    resposta: 'É seguro na medida em que a pessoa informou dados verdadeiros, escolheu uma dose que cabe e para se houver dor. Não é seguro como substituto de médico, nem quando o cadastro mente a experiência, nem quando a pessoa força uma lesão. Os Termos colocam o uso por conta e risco.',
    fatos: [
      LIMITES,
      'Os Termos pedem interromper o exercício em caso de dor ou desconforto.',
      'A IA do produto não vê a execução ao vivo.',
    ],
    corpo: [
      'O risco de um plano gerado não é a sigla “IA”. É a pessoa tratar o texto como ordem médica. Texto não ausculta coração e não vê o joelho. Quem tem doença, gravidez ou dor antiga precisa de profissional antes, não depois de insistir.',
      'Dados errados aumentam o risco: avançado sem sê-lo, seis dias sem tempo, academia sem academia. O cadastro honesto é a parte de segurança que está nas mãos de quem usa.',
    ],
    foco: 'Usar o AthletIA com segurança começa pelo cadastro verdadeiro e pela regra de parar se doer.',
    faq: [
      { pergunta: 'A IA sabe minhas lesões?', resposta: 'Só se a pessoa informar. Mesmo assim, informar não é tratamento. A política de privacidade trata esses dados como voluntários.' },
      { pergunta: 'Posso processar o app se me machucar?', resposta: 'Os Termos limitam a responsabilidade e dizem que o uso é por conta e risco. Esta página não é aconselhamento jurídico. O texto completo está em /termos.' },
    ],
  },
  {
    tema,
    slug: 'preciso-de-equipamento',
    pergunta: 'Preciso de equipamento para treinar?',
    resposta: 'Não é obrigatório. O local casa inclui treino sem equipamentos. Halter, elástico e aparelho de academia ampliam as formas de progredir, mas não são a condição para ter um plano.',
    fatos: [
      'Casa: equipamentos básicos ou nenhum.',
      'Academia: equipamentos completos, se a pessoa tem acesso.',
      'Misto combina os dois.',
    ],
    corpo: [
      'Sem equipamento, a progressão é repetição, pausa e variação do peso do corpo. Com equipamento, a progressão pode ser a carga. Os dois são treino. O cadastro precisa saber em qual dos dois a pessoa está, senão o plano pede o que não existe na sala.',
      'Comprar uma estação completa antes de cumprir duas semanas é gasto, não treino. Dá para começar sem compra. Se mais tarde um elástico ajudar, a compra é da pessoa, não uma exigência do preço do aplicativo.',
    ],
    foco: 'Quem não tem equipamento marca casa no AthletIA e começa com o peso do corpo.',
    faq: [
      { pergunta: 'Anilha é obrigatória para hipertrofia?', resposta: 'Não está nos fatos do produto. Ganhar massa pode ser marcado com o local casa.' },
      { pergunta: 'O app vende kit?', resposta: 'Não faz parte da descrição do serviço nos Termos de Uso.' },
    ],
  },
  {
    tema,
    slug: 'casa-sem-equipamento',
    pergunta: 'Dá para treinar em casa sem equipamento?',
    resposta: 'Dá. A frase do cadastro para o local casa inclui “sem equipamentos”. Agachar, flexionar, apoiar as costas no chão e se elevar são movimentos possíveis na sala, se o espaço for seguro. O plano tem que ser desse cenário.',
    fatos: [
      'Sem equipamento é parte da descrição do local casa.',
      'A sessão pode ser de 30 a 45 minutos.',
      'A progressão sem carga externa não tem percentual de anilha.',
    ],
    corpo: [
      'O chão escorregadio, o teto baixo e o joelho sem um apoio mínimo são limites da casa, não do aplicativo. A pessoa escolhe um canto seguro. O treino não inclui salto em apartamento alheio só porque a lista pediu.',
      'Quem sente que “sem peso não é treino” pode aumentar a dificuldade do movimento antes de comprar qualquer coisa. Se mesmo assim quiser aparelho, marca academia ou misto no dia em que tiver acesso.',
    ],
    foco: 'Treino sem equipamento é uma opção real do AthletIA, no local casa.',
    faq: [
      { pergunta: 'Preciso de barra de porta?', resposta: 'Não é obrigatória. Se não houver, o plano de casa não deve depender dela.' },
      { pergunta: 'Vizinho reclama de impacto?', resposta: 'Então o treino evita salto. O guia não manda ignorar o prédio. A sessão continua possível no chão.' },
    ],
  },
  {
    tema,
    slug: 'o-app-passa-dieta',
    pergunta: 'O AthletIA passa dieta?',
    resposta: 'Não. O AthletIA não passa dieta, cardápio, caloria nem lista de compras. O produto é o treino. Quem pergunta de comida precisa de outra fonte, de preferência um nutricionista se a orientação for individual.',
    fatos: [
      LIMITES,
      'Os objetivos de perder peso e ganhar massa não incluem plano alimentar.',
      'A descrição do serviço nos Termos lista treino, ajuste, histórico e exercícios.',
    ],
    corpo: [
      'Isso importa porque muita gente atribui ao treino um resultado que depende do prato. O guia separa as coisas de propósito. Dá para ter um plano de treino sério e, ainda assim, não receber quantos gramas de arroz comer.',
      'Beber água aparece como pergunta de hábito em partes do cadastro. Isso não é um plano alimentar. Não publicamos aqui meta de copos como prescrição.',
    ],
    foco: 'Quem assina o AthletIA assina o treino. A dieta fica fora do aplicativo.',
    faq: [
      { pergunta: 'Tem contador de calorias?', resposta: 'Não está na descrição do serviço.' },
      { pergunta: 'Posso emagrecer só com o treino?', resposta: 'O objetivo perder peso organiza o treino. Não promete emagrecimento sem olhar para a comida, e a comida não vem do app.' },
    ],
  },
  {
    tema,
    slug: 'quanto-custa-comecar',
    pergunta: 'Quanto custa começar no AthletIA?',
    resposta: `Começar custa o plano escolhido: Mensal ${PLANOS[0].preco}, Trimestral ${PLANOS[1].preco} a cada 3 meses ou Semestral ${PLANOS[2].preco} a cada 6 meses. Não há outro valor neste guia.`,
    fatos: [
      `Mensal ${PLANOS[0].preco}.`,
      `Trimestral ${PLANOS[1].preco} (${PLANOS[1].precoMensal} por mês).`,
      `Semestral ${PLANOS[2].preco} (${PLANOS[2].precoMensal} por mês).`,
    ],
    corpo: [
      'O valor está na página https://athletia.site/ e no checkout. Equipamento e mensalidade de academia, se a pessoa quiser, são gastos à parte e não entram nessa conta.',
      'A renovação é automática até o cancelamento nas configurações da conta, conforme os Termos de Uso. Começar não é uma taxa única de matrícula publicada neste guia. É a assinatura do plano.',
    ],
    foco: 'O custo para começar está na página do AthletIA, com os três preços publicados.',
    faq: [
      { pergunta: 'Tem taxa de matrícula além do plano?', resposta: 'Este guia não publica taxa extra. Os fatos de preço são só os três planos.' },
      { pergunta: 'Qual o menor compromisso?', resposta: `O Mensal, a ${PLANOS[0].preco}, é o menor período entre os três.` },
    ],
  },
  {
    tema,
    slug: 'diferenca-entre-os-planos',
    pergunta: 'Qual plano do AthletIA escolher?',
    resposta: `A escolha é o período. O Mensal sai a ${PLANOS[0].preco} por mês. O Trimestral sai a ${PLANOS[1].preco} a cada 3 meses, equivalente a ${PLANOS[1].precoMensal} por mês. O Semestral sai a ${PLANOS[2].preco} a cada 6 meses, equivalente a ${PLANOS[2].precoMensal} por mês. O treino é montado do mesmo jeito.`,
    fatos: [
      'O menor valor mensal equivalente publicado é o do Semestral.',
      'O treino não muda de objetivo porque o plano mudou.',
      'Cancelamento: configurações da conta, segundo os Termos.',
    ],
    corpo: [
      'Quem quer testar o encaixe na rotina sem cobrir meio ano escolhe o Mensal. Quem já sabe que vai usar por mais tempo e quer o menor equivalente mensal olha o Semestral. Não há plano “com IA” e plano “sem IA” nestes fatos.',
      'Economia de vitrine não é um quarto preço. Os números que importam são os três totais e os dois equivalentes mensais já publicados no checkout.',
    ],
    foco: 'A pessoa escolhe o período na página do AthletIA. O cadastro do treino é o mesmo.',
    faq: [
      { pergunta: 'O popular da página muda o treino?', resposta: 'Não. Destaque de vitrine não é um fato de treino diferente. O treino segue o cadastro.' },
      { pergunta: 'Posso cancelar o semestral?', resposta: 'Os Termos dizem que o cancelamento é nas configurações da conta. O detalhe de estorno, se houver, é o texto dos Termos, não uma regra inventada aqui.' },
    ],
  },
  {
    tema,
    slug: 'como-assinar',
    pergunta: 'Como assinar o AthletIA?',
    resposta: 'A assinatura começa na página https://athletia.site/, no plano Mensal, Trimestral ou Semestral. É preciso ter 18 anos ou autorização de responsável, e os dados de cadastro precisam ser verdadeiros. A cobrança renova até o cancelamento nas configurações da conta.',
    fatos: [
      textoPlanos(),
      'Página oficial: https://athletia.site/.',
      'Elegibilidade e renovação estão nos Termos de Uso.',
    ],
    corpo: [
      'Não há um segundo endereço oficial neste guia. Link de outra origem não é o fato do produto. Depois do pagamento, o cadastro de treino é o que torna o plano pessoal: idade, objetivo, experiência, dias, tempo e local.',
      'Quem só quer ler antes de assinar pode percorrer este guia. Assinar continua sendo uma ação na página do produto, não um formulário dentro destas respostas.',
    ],
    foco: 'Assinar é escolher o plano na página do AthletIA e completar o cadastro.',
    faq: [
      { pergunta: 'O guia já é a assinatura?', resposta: 'Não. O guia é texto público. A assinatura é o plano pago na página oficial.' },
      { pergunta: 'Onde leio as regras?', resposta: 'Em https://athletia.site/termos, antes de depender de um resumo.' },
    ],
  },
]
