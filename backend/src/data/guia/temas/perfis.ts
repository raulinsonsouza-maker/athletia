import { LIMITES, PLANOS } from '../fatos'
import type { PaginaGuia } from '../tipos'

const tema = 'perfis'

export const paginasPerfis: PaginaGuia[] = [
  {
    tema,
    slug: 'iniciante',
    pergunta: 'Como é o treino para iniciante?',
    resposta: 'Para iniciante, o treino cabe em poucos dias, com movimentos que a pessoa consegue repetir e com sessão que pode ser de 30 a 45 minutos. No AthletIA, iniciante é uma experiência do cadastro, não um apelido.',
    fatos: [
      'Iniciante é uma das três experiências.',
      'A menor frequência é 2 vezes por semana.',
      LIMITES,
    ],
    corpo: [
      'Quem começa não precisa de uma divisão de seis dias com nome de músculo em cada um. Precisa aprender a agachar, empurrar, puxar e se apoiar com controle, em casa ou na academia, e parar se a dor não for só esforço.',
      'Copiar o treino de uma pessoa avançada é o caminho curto para achar que “treino não é para mim”. O cadastro existe para a semana começar menor. Não existe, neste guia, uma data em que o iniciante vira avançado.',
    ],
    foco: 'O iniciante marca essa experiência no AthletIA e escolhe uma frequência que consegue repetir.',
    faq: [
      { pergunta: 'Iniciante treina até a falha?', resposta: 'Não é o recomendado neste guia. A prioridade é a forma do movimento. Dor é motivo para interromper, segundo os Termos de Uso.' },
      { pergunta: 'Qual o preço para começar?', resposta: `A partir do plano Mensal, ${PLANOS[0].preco}. Também há Trimestral a ${PLANOS[1].preco} e Semestral a ${PLANOS[2].preco}.` },
    ],
  },
  {
    tema,
    slug: 'intermediario',
    pergunta: 'Como é o treino para intermediário?',
    resposta: 'Intermediário, no cadastro, é quem tenta treinar mas ainda não é regular. O plano precisa caber nessa vida irregular, com uma frequência escolhida de propósito, não com a semana de um atleta.',
    fatos: [
      'Intermediário: tentativa de treino ainda sem regularidade.',
      'Três ou quatro vezes por semana são opções do cadastro.',
      'O histórico de treinos faz parte do serviço descrito nos Termos.',
    ],
    corpo: [
      'Nesse ponto, a pessoa já conhece alguns exercícios e se perde na organização. Um plano com dias marcados e sessão de 45 a 60 minutos, se esse for o tempo real, segura melhor do que variar o treino todo dia por tédio.',
      'Progredir aqui é aumentar um pouco o esforço quando a forma está estável. Não é trocar o treino inteiro toda semana. O aplicativo não publica um percentual de carga.',
    ],
    foco: 'Quem treina sem constância marca intermediário no AthletIA e fixa os dias no cadastro.',
    faq: [
      { pergunta: 'Intermediário ainda pode treinar em casa?', resposta: 'Sim. O local é independente da experiência.' },
      { pergunta: 'Devo subir para avançado rápido?', resposta: 'Só quando a descrição de avançado for verdadeira. O rótulo não acelera resultado.' },
    ],
  },
  {
    tema,
    slug: 'avancado',
    pergunta: 'Como é o treino para avançado?',
    resposta: 'Avançado no cadastro é quem já está em boa forma e treina de verdade. A semana pode ter mais dias e sessões mais longas, até mais de 75 minutos, se isso for o que a pessoa faz. O plano continua dependente do local.',
    fatos: [
      'A frequência máxima do cadastro é 6 vezes por semana.',
      'A sessão mais longa passa de 75 minutos.',
      'O aplicativo não substitui comissão técnica nem médico.',
    ],
    corpo: [
      'Quem já treina trava quando repete a mesma carga e a mesma ordem sem critério, ou quando não descansa. Mais volume só ajuda se a pessoa recupera. Seis dias não são obrigatórios. São o teto da opção.',
      'Este guia não passa percentual de 1RM nem rotina de competição. Dúvida sobre dor articular fica fora do aplicativo.',
    ],
    foco: 'O avançado usa o AthletIA para organizar a semana real, inclusive se ela chega a seis treinos.',
    faq: [
      { pergunta: 'Avançado precisa de academia?', resposta: 'Não é obrigatório. Academia, casa e misto existem para qualquer experiência.' },
      { pergunta: 'O app mede performance de atleta?', resposta: 'O serviço descrito é plano, ajuste conforme progresso e histórico. Não é laboratório de performance.' },
    ],
  },
  {
    tema,
    slug: 'mulher',
    pergunta: 'Como a mulher monta o treino no AthletIA?',
    resposta: 'O cadastro feminino oferece perder peso, ganhar massa muscular e ficar mais forte. Não há um treino “leve por ser mulher”. Há o objetivo que ela marca, mais dias, tempo, idade e local.',
    fatos: [
      'Objetivos no cadastro feminino: perder peso, ganhar massa muscular e ficar mais forte.',
      'A experiência pode ser iniciante, intermediário ou avançado.',
      LIMITES,
    ],
    corpo: [
      'Ganhar massa não é um objetivo exclusivo de homem, e perder peso não é o único caminho no cadastro feminino. Os três estão lá. O plano muda com a agenda: duas sessões curtas em casa são diferentes de cinco idas à academia.',
      'Gestação, pós-parto e dor pélvica não são assuntos deste guia nem uma função descrita do aplicativo. Esses casos pedem profissional de saúde. O produto não faz essa avaliação.',
    ],
    foco: 'A mulher escolhe o objetivo no AthletIA e a semana que ela consegue cumprir.',
    faq: [
      { pergunta: 'Mulher pode marcar ganhar massa?', resposta: 'Sim. Essa opção existe no cadastro feminino.' },
      { pergunta: 'O app passa treino para gestante?', resposta: 'Não está descrito como um modo do produto. Gestação pede orientação profissional.' },
    ],
  },
  {
    tema,
    slug: 'homem',
    pergunta: 'Como o homem monta o treino no AthletIA?',
    resposta: 'O cadastro masculino oferece perder peso, ganhar massa muscular e ficar mais forte. O resto do plano vem da experiência, da frequência, do tempo e do local, não de um treino padrão de homem.',
    fatos: [
      'Objetivos no cadastro masculino: perder peso, ganhar massa muscular e ficar mais forte.',
      'Local: casa, academia ou os dois.',
      `Planos a partir de ${PLANOS[0].preco} no Mensal.`,
    ],
    corpo: [
      'O erro frequente é marcar ganhar massa, seis dias e mais de 75 minutos quando a vida real tem três noites livres. O cadastro aceita a resposta honesta. Um plano cumprido de hipertrofia em três dias organiza melhor do que uma divisão de seis abandonada.',
      'Força e massa estão separados de propósito. Quem quer carga e quem quer volume não precisam fingir que é o mesmo objetivo. Nenhum dos dois inclui dieta no aplicativo.',
    ],
    foco: 'O homem marca o objetivo real no AthletIA, inclusive perder peso, se for o caso.',
    faq: [
      { pergunta: 'Homem pode ter como objetivo perder peso?', resposta: 'Sim. Perder peso está no cadastro masculino.' },
      { pergunta: 'Precisa treinar todo dia para ganhar massa?', resposta: 'Não. A frequência é escolhida de 2 a 6 vezes.' },
    ],
  },
  {
    tema,
    slug: 'de-18-a-29',
    pergunta: 'Como treinar dos 18 aos 29 anos?',
    resposta: 'De 18 a 29 é a primeira faixa etária do cadastro. A idade não escolhe o treino sozinha. Objetivo, experiência e agenda escolhem. Nessa faixa ainda vale começar por uma frequência que a pessoa mantém, não pela semana máxima.',
    fatos: [
      'Faixa 18-29 existe no cadastro.',
      'A idade mínima dos Termos de Uso é 18 anos, ou autorização de responsável.',
      'Frequência de 2 a 6 vezes por semana.',
    ],
    corpo: [
      'Ter vinte e poucos anos não torna um treino de seis dias automaticamente adequado. Trabalho, estudo e sono furado derrubam semana cheia. O cadastro pergunta a frequência e o tempo justamente para a faixa etária não virar desculpa para um plano genérico de “jovem”.',
      'Quem tem menos de 18 anos não deve usar o serviço sem responsável, conforme os Termos. Este guia não é programa para adolescente.',
    ],
    foco: 'De 18 a 29, a pessoa marca essa faixa no AthletIA e completa objetivo, nível e dias.',
    faq: [
      { pergunta: 'Jovem precisa de um treino diferente de alguém de 40?', resposta: 'A faixa etária entra no cadastro. O plano também usa objetivo, experiência, tempo e local. Não publicamos aqui uma rotina exclusiva por década.' },
      { pergunta: 'Posso marcar avançado aos 18?', resposta: 'Só se a descrição de avançado for verdadeira: boa forma e treino de verdade, não a idade.' },
    ],
  },
  {
    tema,
    slug: 'de-30-a-39',
    pergunta: 'Como treinar dos 30 aos 39 anos?',
    resposta: 'De 30 a 39 é uma faixa do cadastro. Nessa idade a agenda costuma apertar, então a sessão de 30 a 45 minutos e uma frequência de dois a quatro dias cabem com mais honestidade do que uma ficha de atleta.',
    fatos: [
      'Faixa 30-39 existe no cadastro.',
      'Falta de tempo é uma dificuldade listada no produto.',
      LIMITES,
    ],
    corpo: [
      'Não há, nos fatos do produto, uma regra de que aos 30 o treino “precisa mudar de método”. O que muda na prática é o tempo livre. O cadastro registra isso. Ignorar e marcar seis dias produz um plano que a pessoa não abre.',
      'Dor nova, pressão e falta de fôlego não são detalhes para o aplicativo resolver. São motivos para procurar profissional. O guia não publica clearance médico.',
    ],
    foco: 'Dos 30 aos 39, o AthletIA usa essa faixa junto com o tempo real da sessão.',
    faq: [
      { pergunta: 'Aos 35 ainda dá para ganhar massa?', resposta: 'Ganhar massa muscular é um objetivo do cadastro em qualquer faixa adulta oferecida. Não há prazo prometido.' },
      { pergunta: 'A sessão tem que passar de uma hora?', resposta: 'Não. 30 a 45 minutos é uma opção.' },
    ],
  },
  {
    tema,
    slug: 'de-40-a-49',
    pergunta: 'Como treinar dos 40 aos 49 anos?',
    resposta: 'De 40 a 49 é uma faixa do cadastro. O treino continua dependente do objetivo e da experiência de hoje. Aquecimento, progressão gradual e permissão para sessão mais curta importam mais do que imitar a rotina de dez anos atrás.',
    fatos: [
      'Faixa 40-49 existe no cadastro.',
      'A sessão pode ser de 30 a 45 minutos.',
      'O serviço não substitui avaliação médica.',
    ],
    corpo: [
      'Quem volta a treinar nessa idade e puxa a carga antiga na primeira semana costuma parar por dor. O cadastro permite marcar a experiência real e poucos dias. Isso é o plano. Não é um veredito de que a pessoa “não pode mais”.',
      'Dois ou mais dias de fortalecimento aparecem na recomendação da OMS para adultos. Isso não é uma meta comercial do AthletIA. É uma referência pública de atividade, com link nas fontes da página.',
    ],
    foco: 'Dos 40 aos 49, a faixa etária entra no cadastro do AthletIA junto com uma agenda que a pessoa cumpre.',
    faq: [
      { pergunta: 'Preciso de exame antes?', resposta: 'Se houver dúvida clínica, sim, com um médico. O aplicativo não pede nem substitui exame.' },
      { pergunta: 'Posso treinar em casa nessa idade?', resposta: 'Sim. Casa é um local do cadastro, em qualquer faixa oferecida.' },
    ],
  },
  {
    tema,
    slug: 'cinquenta-ou-mais',
    pergunta: 'Como treinar depois dos 50?',
    resposta: '50+ é a faixa mais alta do cadastro. O treino pode e deve incluir força, com progressão lenta, frequência que cabe e local seguro. O aplicativo não avalia doença, remédio nem equilíbrio. Isso é com o profissional de saúde.',
    fatos: [
      'Faixa 50+ existe no cadastro.',
      'A OMS recomenda fortalecimento muscular para adultos, em dois ou mais dias da semana.',
      LIMITES,
    ],
    corpo: [
      'Parar de treinar força depois dos 50 não é uma exigência do produto. A exigência prática é não começar pelo máximo. Dois ou três dias, sessão de 30 a 45 minutos, em casa ou na academia, são combinações que o cadastro aceita.',
      'Queda, tontura e dor no peito não são “parte do treino”. A pessoa interrompe e procura ajuda. Os Termos de Uso já colocam o uso por conta e risco e pedem orientação qualificada antes do programa quando há dúvida.',
    ],
    foco: 'Depois dos 50, a pessoa marca 50+ no AthletIA e uma frequência que deixa espaço para recuperar.',
    faq: [
      { pergunta: '50+ só pode fazer caminhada?', resposta: 'Não está escrito assim no produto. Força faz parte dos objetivos possíveis. A liberação, se houver doença, é médica.' },
      { pergunta: 'Qual frequência começar?', resposta: 'A menor opção do cadastro é 2 vezes por semana. Não é obrigatória, é a mais baixa disponível.' },
    ],
  },
  {
    tema,
    slug: 'sem-plano',
    pergunta: 'O que fazer quando não se tem um plano de treino?',
    resposta: 'Sem plano, a pessoa chega e improvisa, ou repete o que viu. “Não tinha um plano claro” é uma das dificuldades do cadastro do AthletIA. O produto existe para a sessão daquele dia estar definida antes de começar.',
    fatos: [
      'Falta de plano claro é uma opção de dificuldade anterior.',
      'O serviço, nos Termos, inclui criação de plano com os dados e objetivos.',
      'O plano usa dias, tempo e local informados.',
    ],
    corpo: [
      'Improvisar funciona para quem já sabe montar treino. Para quem não sabe, vira passeio entre aparelhos. Um plano escrito reduz essa escolha. Ele não precisa ser complicado. Precisa dizer o que fazer nas vezes em que a pessoa marcou que vai.',
      'Plano claro não é plano eterno. O ajuste conforme o progresso está descrito nos Termos. Não há aqui uma promessa de que a falta de plano se resolve em um número de dias.',
    ],
    foco: 'Quem não sabe o que fazer na sessão usa o cadastro do AthletIA para sair com um plano.',
    faq: [
      { pergunta: 'Uma lista da internet substitui?', resposta: 'Substitui só se servir à frequência, ao tempo e ao local da pessoa. Caso contrário, é a planilha de outra rotina.' },
      { pergunta: 'O plano vem pronto sem cadastro?', resposta: 'Não. A personalização descrita no serviço depende dos dados informados.' },
    ],
  },
  {
    tema,
    slug: 'falta-de-tempo',
    pergunta: 'Como treinar quando falta tempo?',
    resposta: 'Falta de tempo é uma dificuldade do cadastro. A resposta do produto não é encaixar um treino de 75 minutos. É oferecer sessão de 30 a 45 minutos e frequência a partir de duas vezes por semana.',
    fatos: [
      'Falta de tempo está listada nas dificuldades anteriores.',
      'Duração mínima oferecida: 30 a 45 minutos.',
      'Frequência mínima oferecida: 2 vezes por semana.',
    ],
    corpo: [
      'Quem diz que não tem tempo e marca “mais de 75 minutos” mente para o próprio plano. A sessão curta, repetida, cabe entre trabalho e casa. Ela não produz o mesmo volume de uma sessão longa. Também não é zero. O guia não converte esses 30 minutos em quilos.',
      'O local casa evita o deslocamento até a academia nos dias em que o relógio não deixa. O local misto deixa a academia para o dia em que o deslocamento cabe.',
    ],
    foco: 'Quem falta tempo marca a sessão curta no AthletIA em vez de abandonar um plano longo.',
    faq: [
      { pergunta: 'Dois treinos de meia hora servem?', resposta: 'São opções válidas do cadastro. Servem como a semana que acontece. Não como garantia de resultado.' },
      { pergunta: 'Preciso acordar mais cedo?', resposta: 'O produto não exige horário. Exige que a duração marcada seja a duração real.' },
    ],
  },
]
