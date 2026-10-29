import { LIMITES, PLANOS, textoPlanos } from '../fatos'
import type { PaginaGuia } from '../tipos'

const tema = 'athletia'

export const paginasAthletia: PaginaGuia[] = [
  {
    tema,
    slug: 'o-que-e',
    pergunta: 'O que é o AthletIA?',
    resposta: 'O AthletIA é um aplicativo que monta um plano de treino com os dados que a pessoa informa no cadastro: idade, objetivo, experiência, dias, duração e local. Não é uma consulta médica e não entrega dieta.',
    fatos: [
      'O serviço descrito nos Termos de Uso é uma plataforma de treinos personalizados.',
      textoPlanos(),
      LIMITES,
    ],
    corpo: [
      'Quem abre o AthletIA não recebe uma ficha igual para todo mundo. O cadastro separa faixa etária, objetivo, nível, quantas vezes por semana a pessoa pode treinar, quanto tempo cabe na sessão e se o treino será em casa, na academia ou nos dois.',
      'O plano de treino sai desses dados. O acompanhamento de histórico existe dentro da conta, para a pessoa registrar o que fez. O que o aplicativo não faz é substituir um profissional que avalia a pessoa presencialmente, nem indicar cardápio.',
    ],
    foco: 'Quem procura um treino montado com os próprios dados, e não uma lista genérica, encontra isso no cadastro do AthletIA.',
    faq: [
      { pergunta: 'O AthletIA é uma academia?', resposta: 'Não. É um aplicativo de treino. A pessoa escolhe treinar em casa, na academia ou nos dois.' },
      { pergunta: 'O AthletIA passa dieta?', resposta: 'Não. O produto é o treino. Alimentação não faz parte do que o aplicativo entrega.' },
    ],
  },
  {
    tema,
    slug: 'como-o-treino-e-montado',
    pergunta: 'Como o AthletIA monta o treino?',
    resposta: 'O treino é montado com o que a pessoa declara: faixa etária, objetivo, experiência, frequência, duração da sessão e local. Sem esses dados, o aplicativo não tem como diferenciar um plano de outro.',
    fatos: [
      'Faixas de idade no cadastro: 18-29, 30-39, 40-49 e 50+.',
      'Objetivos: perder peso, ganhar massa muscular ou ficar mais forte.',
      'Experiência: iniciante, intermediário ou avançado.',
    ],
    corpo: [
      'A montagem começa pelo objetivo. Perder peso, ganhar massa e ficar mais forte não pedem a mesma organização de séries e de dias. Em seguida entram o nível e a agenda: de 2 a 6 vezes por semana, com sessão de 30 a 45 minutos até mais de 75 minutos.',
      'O local fecha o plano. Em casa o treino usa o que a pessoa tem, inclusive a opção sem equipamento. Na academia entram os aparelhos. No modo misto, os dois cenários. O ajuste posterior usa o histórico de treinos da conta, não um prazo prometido de resultado.',
    ],
    foco: 'O treino do AthletIA só fica pessoal porque o cadastro registra objetivo, nível, dias, tempo e local.',
    faq: [
      { pergunta: 'Preciso informar lesão?', resposta: 'A política de privacidade prevê dados de saúde, como lesões e limitações, quando a pessoa fornece. Isso não transforma o aplicativo em atendimento médico.' },
      { pergunta: 'O treino muda sozinho?', resposta: 'Os Termos de Uso descrevem ajuste do treino conforme o progresso registrado. Não há garantia de resultado em um número de semanas.' },
    ],
  },
  {
    tema,
    slug: 'quanto-custa',
    pergunta: 'Quanto custa o AthletIA?',
    resposta: `O Mensal custa ${PLANOS[0].preco}. O Trimestral custa ${PLANOS[1].preco} a cada 3 meses, o equivalente a ${PLANOS[1].precoMensal} por mês. O Semestral custa ${PLANOS[2].preco} a cada 6 meses, o equivalente a ${PLANOS[2].precoMensal} por mês.`,
    fatos: [
      `Mensal: ${PLANOS[0].preco} ${PLANOS[0].periodo}.`,
      `Trimestral: ${PLANOS[1].preco} ${PLANOS[1].periodo} (${PLANOS[1].precoMensal} por mês).`,
      `Semestral: ${PLANOS[2].preco} ${PLANOS[2].periodo} (${PLANOS[2].precoMensal} por mês).`,
    ],
    corpo: [
      'Os três valores são os preços publicados na página de venda e no checkout. Não existe outro preço neste guia. A assinatura, conforme os Termos de Uso, renova até a pessoa cancelar nas configurações da conta.',
      'O valor não inclui promessa de resultado, consulta com profissional de educação física nem plano alimentar. Quem compara os planos está comparando o período de cobrança, não um produto diferente.',
    ],
    foco: 'O preço para começar está na página do AthletIA, com os três planos publicados.',
    faq: [
      { pergunta: 'Qual plano é mais barato por mês?', resposta: `O Semestral sai a ${PLANOS[2].precoMensal} por mês. O Trimestral sai a ${PLANOS[1].precoMensal} por mês. O Mensal é ${PLANOS[0].preco}.` },
      { pergunta: 'A assinatura renova sozinha?', resposta: 'Sim. Os Termos de Uso dizem que a renovação é automática até o cancelamento nas configurações da conta.' },
    ],
  },
  {
    tema,
    slug: 'comparar-planos',
    pergunta: 'Qual a diferença entre os planos do AthletIA?',
    resposta: 'A diferença publicada é o período e o valor: Mensal, Trimestral e Semestral. O treino continua sendo montado com os mesmos dados de cadastro nos três.',
    fatos: [
      `Mensal ${PLANOS[0].preco}, trimestral ${PLANOS[1].preco}, semestral ${PLANOS[2].preco}.`,
      `Por mês, o trimestral equivale a ${PLANOS[1].precoMensal} e o semestral a ${PLANOS[2].precoMensal}.`,
      'O cadastro de objetivo, dias, tempo e local é o mesmo em qualquer plano.',
    ],
    corpo: [
      'Não há, neste guia, um plano “com treino” e outro “sem treino”. A escolha é quanto tempo a pessoa quer cobrir de uma vez e quanto paga por isso. O semestral tem o menor valor mensal equivalente entre os três números publicados.',
      'Cancelar, segundo os Termos de Uso, pode ser feito a qualquer momento nas configurações da conta. O que muda com o cancelamento é o acesso da assinatura, não o fato de o treino ter sido montado com os dados informados.',
    ],
    foco: 'Os três planos do AthletIA estão na página de venda para a pessoa escolher o período.',
    faq: [
      { pergunta: 'O plano muda o objetivo do treino?', resposta: 'Não. O objetivo vem do cadastro: perder peso, ganhar massa muscular ou ficar mais forte.' },
      { pergunta: 'Onde eu vejo o valor atual?', resposta: 'Na página https://athletia.site/, que é a mesma fonte destes preços.' },
    ],
  },
  {
    tema,
    slug: 'o-que-o-cadastro-pergunta',
    pergunta: 'O que o cadastro do AthletIA pergunta?',
    resposta: 'O cadastro pergunta faixa etária, objetivo, experiência, quantas vezes por semana, quanto tempo dura a sessão e onde a pessoa vai treinar. Também há perguntas sobre dificuldades anteriores, como falta de plano, falta de tempo, treino duro demais e falta de motivação.',
    fatos: [
      'Idade: 18-29, 30-39, 40-49 ou 50+.',
      'Objetivo: perder peso, ganhar massa muscular ou ficar mais forte.',
      'Local: casa, academia ou os dois.',
    ],
    corpo: [
      'Essas perguntas existem para o treino não ignorar a agenda nem o lugar. Uma pessoa de 50+ que treina em casa duas vezes por semana, 30 a 45 minutos, não recebe o mesmo ponto de partida de quem marca avançado, academia e seis dias.',
      'Dificuldades anteriores não são um diagnóstico. Elas registram o que já atrapalhou: não saber o que fazer, não caber na rotina, intensidade alta demais ou dificuldade de manter o ritmo. O aplicativo usa isso no plano. Não trata saúde mental nem passa dieta.',
    ],
    foco: 'Responder o cadastro do AthletIA é o que permite o treino sair com dias, tempo e local reais.',
    faq: [
      { pergunta: 'Preciso ter academia para concluir o cadastro?', resposta: 'Não. O local pode ser casa, academia ou os dois.' },
      { pergunta: 'Posso marcar iniciante?', resposta: 'Sim. As opções de experiência são iniciante, intermediário e avançado.' },
    ],
  },
  {
    tema,
    slug: 'treino-para-casa',
    pergunta: 'O AthletIA monta treino para casa?',
    resposta: 'Sim. No cadastro, o local “casa” significa treino em casa com equipamento básico ou sem equipamento. O plano usa essa escolha, não uma ficha de academia.',
    fatos: [
      'Local “casa”: equipamentos básicos ou nenhum equipamento.',
      'A frequência continua de 2 a 6 vezes por semana.',
      'A sessão pode ser de 30 a 45 minutos até mais de 75 minutos.',
    ],
    corpo: [
      'Treinar em casa não exige que a pessoa invente o treino do dia. O cadastro já separa esse cenário dos aparelhos de academia. Quem tem elástico, halter ou só o peso do corpo informa o contexto de casa, e o plano parte daí.',
      'Casa não significa resultado mais rápido nem mais lento. O guia não publica prazo. O que muda é o tipo de exercício possível no espaço que a pessoa tem.',
    ],
    foco: 'Quem treina em casa escolhe esse local no AthletIA e recebe um plano compatível com pouco ou nenhum equipamento.',
    faq: [
      { pergunta: 'Preciso comprar aparelho?', resposta: 'Não é obrigatório. A descrição do local casa inclui treino sem equipamentos.' },
      { pergunta: 'Posso treinar em casa e na academia?', resposta: 'Sim. Existe a opção de local misto, casa e academia.' },
    ],
  },
  {
    tema,
    slug: 'treino-para-academia',
    pergunta: 'O AthletIA monta treino para academia?',
    resposta: 'Sim. O local “academia” no cadastro é para quem tem acesso a equipamentos completos. O plano de treino parte dessa condição, junto com objetivo, nível, dias e tempo.',
    fatos: [
      'Local “academia”: equipamentos completos.',
      'Objetivos disponíveis: perder peso, ganhar massa muscular ou ficar mais forte.',
      LIMITES,
    ],
    corpo: [
      'Na academia, o limite deixa de ser a falta de aparelho e passa a ser a escolha do que fazer em cada ida. O AthletIA organiza essa ida com a frequência que a pessoa marcou, de duas a seis vezes por semana, e com a duração que cabe, a partir de 30 a 45 minutos.',
      'Ter academia não dispensa critério. Dor, doença e liberação para esforço são assuntos de profissional de saúde. O aplicativo não faz essa avaliação.',
    ],
    foco: 'Quem já frequenta academia pode usar o AthletIA para sair de casa sabendo o treino daquele dia.',
    faq: [
      { pergunta: 'O aplicativo reserva horário na academia?', resposta: 'Não. Ele monta o treino. A ida à academia é da pessoa.' },
      { pergunta: 'Serve para quem quer ganhar massa?', resposta: 'Sim. Ganhar massa muscular é um dos objetivos do cadastro.' },
    ],
  },
  {
    tema,
    slug: 'treino-misto',
    pergunta: 'Dá para treinar em casa e na academia no AthletIA?',
    resposta: 'Dá. O cadastro tem o local misto: a pessoa treina tanto em casa quanto na academia. O plano precisa cobrir os dois cenários, não só um deles.',
    fatos: [
      'Local misto: casa e academia.',
      'Casa pode ser com equipamento básico ou sem equipamento.',
      'Academia considera equipamentos completos.',
    ],
    corpo: [
      'A semana mista é comum para quem vai à academia em alguns dias e completa o resto em casa. Sem separar os dois locais, o treino de casa pede aparelho que não está lá, ou o dia de academia fica igual ao treino de peso corporal.',
      'A frequência marcada, de 2 a 6 vezes, vale para a semana inteira. A pessoa não precisa de dois aplicativos. Um cadastro guarda o objetivo e os dois lugares.',
    ],
    foco: 'O local misto do AthletIA existe para a semana que mistura casa e academia.',
    faq: [
      { pergunta: 'O preço muda no plano misto?', resposta: `Não. Os preços continuam Mensal ${PLANOS[0].preco}, Trimestral ${PLANOS[1].preco} e Semestral ${PLANOS[2].preco}.` },
      { pergunta: 'Posso mudar o local depois?', resposta: 'Os dados de treino fazem parte da conta. O ajuste do plano segue o que está descrito nos Termos de Uso sobre progresso e dados informados.' },
    ],
  },
  {
    tema,
    slug: 'para-iniciante',
    pergunta: 'O AthletIA serve para iniciante?',
    resposta: 'Serve. “Iniciante” é uma das três experiências do cadastro. A descrição usada no produto é de quem ainda tem dificuldade em movimentos simples, não de quem já treina toda semana.',
    fatos: [
      'Experiências: iniciante, intermediário e avançado.',
      'A frequência pode começar em 2 vezes por semana.',
      'A sessão mais curta do cadastro é de 30 a 45 minutos.',
    ],
    corpo: [
      'Iniciante não precisa abrir a semana em seis dias. O cadastro deixa marcar duas vezes e uma sessão curta. O local pode ser casa, sem equipamento. Isso reduz a chance de copiar um treino de quem já treina há anos.',
      'Começar não elimina risco. Quem tem dor, doença cardiovascular ou dúvida sobre esforço deve falar com um profissional antes. O AthletIA não faz essa liberação.',
    ],
    foco: 'Quem está começando marca iniciante no AthletIA e escolhe poucos dias, sessão curta e o local real.',
    faq: [
      { pergunta: 'Iniciante precisa de academia?', resposta: 'Não. O local pode ser casa.' },
      { pergunta: 'O app garante que o iniciante não se machuca?', resposta: 'Não. Os Termos de Uso dizem que o uso é por conta e risco e que dor é motivo para parar e procurar orientação.' },
    ],
  },
  {
    tema,
    slug: 'para-intermediario',
    pergunta: 'O AthletIA serve para quem já treina de vez em quando?',
    resposta: 'Serve. “Intermediário” no cadastro é quem tenta se exercitar, mas ainda não mantém regularidade. O plano usa esse nível junto com os dias que a pessoa realmente consegue cumprir.',
    fatos: [
      'Intermediário: treino ainda irregular.',
      'Frequência disponível de 2 a 6 vezes por semana.',
      'Objetivos: perder peso, ganhar massa muscular ou ficar mais forte.',
    ],
    corpo: [
      'O erro comum nesse estágio é copiar a semana de quem treina cinco ou seis vezes. O cadastro pede a frequência possível. Três dias de 45 a 60 minutos, feitos, organizam mais do que uma planilha de seis dias abandonada na terceira semana.',
      'O histórico da conta serve para o ajuste descrito nos Termos. Não publicamos aqui em quantas semanas o corpo muda. Isso depende de sono, alimentação e constância, e o aplicativo não controla a alimentação.',
    ],
    foco: 'Quem treina sem regularidade pode marcar intermediário no AthletIA e fixar uma frequência que caiba na semana.',
    faq: [
      { pergunta: 'Intermediário é obrigado a treinar cinco vezes?', resposta: 'Não. Cinco e seis vezes existem no cadastro, mas dois, três e quatro também.' },
      { pergunta: 'O AthletIA conta a dieta do intermediário?', resposta: 'Não. O aplicativo não passa dieta.' },
    ],
  },
  {
    tema,
    slug: 'para-avancado',
    pergunta: 'O AthletIA serve para quem já treina sério?',
    resposta: 'Serve para quem se declara avançado no cadastro. Essa opção é de quem já está em boa forma e treina de verdade. O plano ainda depende dos dias, do tempo e do local informados.',
    fatos: [
      'Avançado é uma das três experiências do cadastro.',
      'A frequência pode chegar a 6 vezes por semana.',
      'A sessão pode passar de 75 minutos.',
    ],
    corpo: [
      'Quem já treina há tempo costuma travar por falta de organização, não por falta de um nome de exercício. O cadastro avançado combina com mais dias e sessões mais longas, se isso for verdade na rotina. Marcar avançado e só ter dois dias de 30 minutos produz um plano curto, porque a agenda também entra na conta.',
      'Avançado não é atleta acompanhado por comissão técnica. O aplicativo não substitui esse acompanhamento nem promete marca pessoal.',
    ],
    foco: 'Quem já treina pode marcar avançado no AthletIA e alinhar a frequência real, até seis vezes por semana.',
    faq: [
      { pergunta: 'Avançado precisa treinar todo dia?', resposta: 'Não. Seis vezes é o máximo do cadastro, não uma obrigação. O dia sem treino continua existindo.' },
      { pergunta: 'O app prescreve carga máxima?', resposta: 'O guia não publica percentual de carga. A progressão deve respeitar dor e técnica, e dúvida clínica fica com o profissional.' },
    ],
  },
  {
    tema,
    slug: 'como-comecar',
    pergunta: 'Como começar no AthletIA?',
    resposta: 'A pessoa abre a página do AthletIA, escolhe Mensal, Trimestral ou Semestral e completa o cadastro com idade, objetivo, experiência, dias, tempo e local. O treino sai desses dados.',
    fatos: [
      `Planos: ${PLANOS[0].preco}, ${PLANOS[1].preco} e ${PLANOS[2].preco}.`,
      'É preciso ter pelo menos 18 anos, ou autorização de responsável, conforme os Termos de Uso.',
      'A assinatura renova até o cancelamento nas configurações da conta.',
    ],
    corpo: [
      'Não há um segundo site para “ativar” o treino. A página oficial é https://athletia.site/. O checkout mostra os mesmos três preços deste guia. Dados falsos no cadastro geram um plano falso: se a pessoa marca seis dias e só tem dois, o plano não cabe na vida dela.',
      'Antes do primeiro esforço, os Termos pedem que a pessoa avalie a própria condição e procure um médico se houver dúvida. Interromper o exercício em caso de dor faz parte dessas condições de uso.',
    ],
    foco: 'Começar é escolher o plano na página do AthletIA e preencher o cadastro com a rotina verdadeira.',
    faq: [
      { pergunta: 'Tem idade mínima?', resposta: 'Os Termos de Uso pedem 18 anos ou autorização de um responsável legal.' },
      { pergunta: 'Onde cancelo?', resposta: 'Nas configurações da conta, conforme os Termos de Uso.' },
    ],
  },
  {
    tema,
    slug: 'o-que-nao-faz',
    pergunta: 'O que o AthletIA não faz?',
    resposta: 'O AthletIA não passa dieta, não faz diagnóstico, não substitui médico nem profissional de educação física e não promete resultado em um número de semanas. Também não é uma academia física.',
    fatos: [
      LIMITES,
      'Os Termos de Uso limitam a responsabilidade por lesões e pedem interrupção se houver dor.',
      'Este guia não publica nota de avaliação nem quantidade de alunos.',
    ],
    corpo: [
      'O que ele faz está nos Termos: plano de treino com os dados físicos e objetivos, ajuste conforme o progresso, histórico e instruções de exercício. O que fica de fora é cardápio, exame, liberação cardiológica e acompanhamento presencial.',
      'Promessa de prazo, de medida corporal ou de nota de loja não faz parte dos fatos deste guia. Se um texto citar isso, não é dado publicável do produto.',
    ],
    foco: 'O AthletIA é o plano de treino e o histórico. A decisão de assinar continua na página oficial.',
    faq: [
      { pergunta: 'O app trata lesão?', resposta: 'Não. Lesão é assunto de profissional de saúde. O uso do serviço é por conta e risco, segundo os Termos.' },
      { pergunta: 'O app vende suplemento?', resposta: 'Não está na descrição do serviço nos Termos de Uso.' },
    ],
  },
  {
    tema,
    slug: 'athletia-ou-planilha',
    pergunta: 'AthletIA ou planilha de treino?',
    resposta: 'A planilha é uma lista fixa. O AthletIA monta o plano com idade, objetivo, experiência, dias, duração e local, e guarda o histórico na conta. A planilha não faz esse cadastro.',
    fatos: [
      'O cadastro distingue casa, academia e os dois.',
      'A frequência vai de 2 a 6 vezes por semana.',
      textoPlanos(),
    ],
    corpo: [
      'Planilha ajuda quem já sabe montar a própria semana e só precisa anotar a carga. Ela falha quando a pessoa copia a aba de outra pessoa, com outros dias e outro equipamento. O aplicativo existe para esse caso: a semana sai do que foi declarado.',
      'Nenhum dos dois substitui profissional presencial. A diferença prática é o ponto de partida. Na planilha, a pessoa escreve o treino. No AthletIA, o treino é gerado a partir do cadastro e pode ser ajustado com o progresso registrado.',
    ],
    foco: 'Quem não quer manter uma planilha genérica pode deixar o AthletIA montar a semana com os dados do cadastro.',
    faq: [
      { pergunta: 'A planilha é de graça e o app não?', resposta: `O AthletIA cobra assinatura: Mensal ${PLANOS[0].preco}, Trimestral ${PLANOS[1].preco} ou Semestral ${PLANOS[2].preco}.` },
      { pergunta: 'Posso usar os dois?', resposta: 'Pode. O histórico que o produto usa para ajuste é o da conta, descrito nos Termos de Uso.' },
    ],
  },
]
