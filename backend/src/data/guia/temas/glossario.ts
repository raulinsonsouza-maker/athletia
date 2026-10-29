import { LIMITES } from '../fatos'
import type { PaginaGuia } from '../tipos'

const tema = 'glossario'

export const paginasGlossario: PaginaGuia[] = [
  {
    tema,
    slug: 'serie',
    pergunta: 'O que é uma série no treino?',
    resposta: 'Série é um bloco de repetições do mesmo exercício, seguido de pausa. Fazer três séries é repetir esse bloco três vezes. A quantidade não é universal: cabe no tempo da sessão e no nível da pessoa.',
    fatos: [
      'A sessão do cadastro vai de 30 a 45 minutos a mais de 75 minutos e inclui as séries e as pausas.',
      'Iniciante não precisa copiar o número de séries de quem marca avançado.',
      LIMITES,
    ],
    corpo: [
      'Uma série termina quando as repetições combinadas acabam com a forma ainda aceitável, ou quando a forma cai. Continuar sem controle para “fechar o número” não melhora a série. Encurta a segurança.',
      'Muitas séries em pouco tempo só existem se cada uma for curta e o descanso for curto. Em 30 a 45 minutos, a lista de exercícios é pequena. O plano que ignora isso não cabe no relógio que a pessoa marcou.',
    ],
    foco: 'No AthletIA as séries precisam caber na duração e na frequência informadas.',
    faq: [
      { pergunta: 'Série e exercício são a mesma coisa?', resposta: 'Não. O exercício é o movimento. A série é o bloco de repetições desse movimento.' },
      { pergunta: 'Quantas séries o app manda?', resposta: 'Este glossário não fixa um número oficial. O plano da conta é que organiza a sessão.' },
    ],
  },
  {
    tema,
    slug: 'repeticao',
    pergunta: 'O que é uma repetição?',
    resposta: 'Repetição é uma ida e volta do movimento, do início ao fim, com controle. Dez repetições são esse caminho feito dez vezes dentro da mesma série. Repetição pela metade não é o mesmo estímulo.',
    fatos: [
      'A forma da repetição vem antes de aumentar a dificuldade.',
      'Em casa, sem equipamento, a repetição usa o peso do corpo.',
      'Dor no meio da repetição é motivo para parar, não para completar a conta.',
    ],
    corpo: [
      'Contar rápido, quicando no fundo do agachamento, infla o número e tira o trabalho do músculo. Contar devagar, com o mesmo caminho na ida e na volta, é a repetição que o progresso usa depois.',
      'Quando a última repetição combinada sai fácil por mais de uma sessão, aí se dificulta. Antes disso, repetir o mesmo número com forma melhor já é avanço, principalmente para quem marcou iniciante.',
    ],
    foco: 'O treino do AthletIA vale pela repetição que a pessoa controla, não pela contagem apressada.',
    faq: [
      { pergunta: 'Repetição negativa é obrigatória?', resposta: 'Não. Este glossário não prescreve técnica avançada. A prioridade publicada é o movimento completo e sem dor.' },
      { pergunta: 'Todo mundo faz 12?', resposta: 'Não. Doze é um exemplo comum de conversa, não um fato do produto.' },
    ],
  },
  {
    tema,
    slug: 'descanso',
    pergunta: 'O que é descanso no treino?',
    resposta: 'Descanso é a pausa entre séries e também o dia em que aquela sessão de força não acontece. A pausa deixa a próxima série sair com forma. O dia livre deixa a semana caber na frequência marcada, no máximo seis vezes.',
    fatos: [
      'A frequência máxima do cadastro é 6, então há pelo menos um dia fora do plano.',
      'O descanso entre séries consome o tempo da sessão.',
      'Descanso não trata lesão. Lesão pede profissional.',
    ],
    corpo: [
      'Pausa curta demais faz a série seguinte nascer torta. Pausa longa demais, numa sessão de 30 a 45 minutos, come o treino. A pessoa ajusta para conseguir repetir o movimento, sem um número único de segundos neste glossário.',
      'Folga da semana não é castigo nem prêmio. É o que sobra quando a frequência é honesta. Treinar no dia de folga “para compensar” costuma produzir o treino duro demais que o cadastro lista como problema.',
    ],
    foco: 'O AthletIA já deixa o descanso da semana implícito na frequência de 2 a 6 vezes.',
    faq: [
      { pergunta: 'Descanso é ficar sem se mexer?', resposta: 'É ficar sem a sessão pesada. Caminhar não está proibido. O app não policia o dia.' },
      { pergunta: 'Qual o segundo oficial de pausa?', resposta: 'Não há um segundo oficial neste guia.' },
    ],
  },
  {
    tema,
    slug: 'hipertrofia',
    pergunta: 'O que significa hipertrofia?',
    resposta: 'Hipertrofia significa o músculo aumentar de tamanho com treino de força, recuperação e energia suficiente vinda da comida. No AthletIA o objetivo correspondente se chama ganhar massa muscular. O app não mede o músculo e não passa a dieta.',
    fatos: [
      'Ganhar massa muscular está no cadastro feminino e no masculino.',
      'Ficar mais forte é um objetivo diferente.',
      LIMITES,
    ],
    corpo: [
      'Usar a palavra hipertrofia não cria um protocolo secreto. Cria uma intenção: o treino de força volta várias vezes na frequência escolhida e fica um pouco mais difícil quando a forma permite. Sem sono e sem comida, a palavra continua sendo só a palavra.',
      'Não há, nos fatos publicáveis, uma medida de centímetro ou um prazo. Quem oferece isso não está citando este glossário.',
    ],
    foco: 'Para hipertrofia, a pessoa marca ganhar massa muscular no AthletIA.',
    faq: [
      { pergunta: 'Hipertrofia é só para homem?', resposta: 'Não. O objetivo existe nos dois cadastros.' },
      { pergunta: 'Hipertrofia precisa de academia?', resposta: 'Não. O local pode ser casa.' },
    ],
  },
  {
    tema,
    slug: 'forca',
    pergunta: 'O que é treino de força?',
    resposta: 'Treino de força é praticar movimentos contra uma resistência, que pode ser o corpo, um elástico ou uma anilha, para conseguir fazer mais do que antes com boa forma. No cadastro, o objetivo se chama ficar mais forte.',
    fatos: [
      'Ficar mais forte é um objetivo distinto de perder peso e de ganhar massa.',
      'A OMS inclui fortalecimento muscular na recomendação para adultos.',
      'O guia não publica percentual de carga máxima.',
    ],
    corpo: [
      'Força não é sinônimo de gritar na última repetição. É repetir um padrão estável e progredir. Iniciante constrói isso com poucos dias. Quem marca avançado pode ter mais dias, até seis, se recuperar.',
      'Teste de uma repetição máxima não é um fato do produto e não deve ser a primeira sessão de quem voltou a treinar. Dor no teste é um mau começo, e os Termos pedem parar.',
    ],
    foco: 'Quem quer força marca ficar mais forte no AthletIA e informa o local onde a resistência existe.',
    faq: [
      { pergunta: 'Força e hipertrofia são o mesmo cadastro?', resposta: 'Não. São objetivos separados.' },
      { pergunta: 'Caminhada é treino de força?', resposta: 'Não, neste glossário. Caminhada é atividade aeróbica. Força é o trabalho contra resistência.' },
    ],
  },
  {
    tema,
    slug: 'emagrecimento',
    pergunta: 'O que é emagrecimento?',
    resposta: 'Emagrecimento, aqui, é o objetivo perder peso: reduzir gordura ao longo do tempo. O treino participa. A comida participa tanto ou mais, e o AthletIA não cuida da comida. Não há meta de quilos nos fatos do produto.',
    fatos: [
      'A descrição do objetivo no cadastro fala em queimar gordura e definir.',
      'Definir não é um percentual de gordura publicado.',
      LIMITES,
    ],
    corpo: [
      'Emagrecer não é suar nem fazer só abdominal. Suor é calor. Abdominal é um exercício. A perda de gordura é um processo do corpo inteiro, sem zona que este guia prometa secar primeiro.',
      'O plano de treino desse objetivo ainda respeita dias e minutos. Uma pessoa ocupada marca 30 a 45 minutos em vez de um protocolo que não abre.',
    ],
    foco: 'Emagrecimento, no AthletIA, começa marcando perder peso. O cardápio não vem junto.',
    faq: [
      { pergunta: 'Emagrecimento local funciona?', resposta: 'Este glossário não descreve perda localizada como fato.' },
      { pergunta: 'O plano semestral emagrece mais?', resposta: 'Não. O período da assinatura não é uma dose de emagrecimento.' },
    ],
  },
  {
    tema,
    slug: 'carga',
    pergunta: 'O que é carga no treino?',
    resposta: 'Carga é a dificuldade do exercício: anilha, elástico ou a alavanca do próprio corpo. Aumentar carga é uma forma de progredir quando a repetição já está estável. Não é a primeira instrução de quem sente dor.',
    fatos: [
      'Na academia a carga externa é mais óbvia.',
      'Em casa, sem equipamento, a carga é o peso do corpo e a variação do movimento.',
      'O guia não publica quilos de barra nem percentual de máximo.',
    ],
    corpo: [
      'Subir carga com a técnica caindo transfere o esforço para a articulação. A série que “pesa mais” e sai torta não é progresso. A série que pesa o mesmo e sai melhor pode ser, principalmente no começo.',
      'O histórico ajuda a não esquecer o que foi feito. Chutar a carga de memória, para cima, é um jeito comum de transformar a volta ao treino em dor. O aplicativo registra. Não decide um teste máximo.',
    ],
    foco: 'A carga no AthletIA depende do local marcado: casa, academia ou os dois.',
    faq: [
      { pergunta: 'Sem carga não há treino?', resposta: 'Há. O local casa inclui nenhum equipamento. A dificuldade ainda existe.' },
      { pergunta: 'Qual a carga inicial?', resposta: 'A que permite completar a série com forma. Não há um quilo inicial neste glossário.' },
    ],
  },
  {
    tema,
    slug: 'aquecimento',
    pergunta: 'O que é aquecimento?',
    resposta: 'Aquecimento é preparar o corpo para a sessão com movimento leve, em geral o próprio exercício em versão fácil. Não é um treino à parte que consome os 30 minutos de quem marcou uma sessão curta.',
    fatos: [
      'O tempo de aquecimento entra na duração escolhida no cadastro.',
      'Esteira longa não é obrigatória.',
      'Dor no aquecimento cancela o restante da sessão.',
    ],
    corpo: [
      'O objetivo é chegar na primeira série de trabalho com controle, não suado e cansado antes de começar. Duas passagens leves do movimento cumprem isso na maior parte das sessões de força.',
      'Alongar até o desconforto antes de carregar a articulação não é o aquecimento descrito aqui. Se há lesão, o aquecimento não trata. O profissional trata.',
    ],
    foco: 'A duração marcada no AthletIA já deve incluir um começo leve.',
    faq: [
      { pergunta: 'Quantos minutos oficiais?', resposta: 'Não há um minuto oficial. Há o limite da sessão que a pessoa escolheu.' },
      { pergunta: 'Aquecimento evita toda lesão?', resposta: 'Não. Reduz o susto da primeira série pesada. Não substitui critério nem médico.' },
    ],
  },
  {
    tema,
    slug: 'cardio',
    pergunta: 'O que é cardio?',
    resposta: 'Cardio, neste guia, é a atividade em que o fôlego sustenta o esforço por um tempo contínuo, como caminhar, pedalar ou correr. A OMS descreve atividade aeróbica na semana do adulto. Isso é diferente do treino de força, e os dois podem coexistir.',
    fatos: [
      'Cardio não substitui o objetivo de força ou de massa no cadastro.',
      'A sessão tem duração limitada. Os dois juntos precisam caber nela.',
      'O AthletIA não passa prova de corrida nem dieta.',
    ],
    corpo: [
      'Usar cardio como único plano de quem quer perder peso deixa a força de fora. Usar força como único plano deixa de lado a recomendação de atividade aeróbica da OMS. Nenhum dos dois fatos vira um minuto obrigatório dentro do aplicativo.',
      'Se a sessão é curta, a caminhada pode ficar fora dela, no resto do dia. Não é obrigação. É um jeito de não estourar os 30 a 45 minutos.',
    ],
    foco: 'O cardio não é um plano separado do AthletIA. O plano principal continua sendo o treino montado no cadastro.',
    faq: [
      { pergunta: 'Cardio em jejum emagrece mais?', resposta: 'Este glossário não afirma isso e o app não passa estratégia alimentar.' },
      { pergunta: 'Corrida é obrigatória?', resposta: 'Não. Caminhar já é atividade aeróbica. Corrida pede condição que o app não avalia.' },
    ],
  },
  {
    tema,
    slug: 'consistencia',
    pergunta: 'O que é consistência no treino?',
    resposta: 'Consistência é repetir a frequência escolhida por tempo bastante para existir histórico, não ter uma semana heroica. Duas vezes cumpridas toda semana são consistência. Seis vezes escritas e duas feitas não são.',
    fatos: [
      'Falta de motivação e falta de plano são dificuldades do cadastro ligadas a parar.',
      'O histórico de treinos faz parte do serviço.',
      'Não há número de semanas consistentes que garanta resultado.',
    ],
    corpo: [
      'Consistência mora no calendário, não no humor. Por isso a sessão curta ajuda: é mais fácil repetir. O plano escrito ajuda pelo mesmo motivo: não há decisão nova a cada ida.',
      'Uma falta não zera a consistência. A pessoa volta na próxima sessão marcada. Dobrar o treino para “compensar” costuma quebrar a semana seguinte.',
    ],
    foco: 'O AthletIA apoia a consistência com um plano que cabe e com o registro do que foi feito.',
    faq: [
      { pergunta: 'Consistência é nunca falhar?', resposta: 'Não. É voltar à frequência real, não à perfeição.' },
      { pergunta: 'Um mês consistente garante o quê?', resposta: 'Nada numérico. O guia não publica garantia.' },
    ],
  },
  {
    tema,
    slug: 'progressao',
    pergunta: 'O que é progressão no treino?',
    resposta: 'Progressão é aumentar aos poucos a dificuldade de uma sessão que já sai com forma: mais repetição, mais carga ou uma variação mais exigente. Trocar o treino inteiro toda semana não é progressão. É recomeço.',
    fatos: [
      'Os Termos descrevem ajuste conforme o progresso registrado.',
      'Não há percentual semanal de aumento neste guia.',
      'Progressão para se houver dor.',
    ],
    corpo: [
      'Sem registro, a progressão vira chute. A pessoa acha que subiu a carga e só mudou o exercício. O histórico da conta existe para a comparação ser o mesmo movimento.',
      'Em casa, a progressão visível é menor do que colocar 2 kg na barra, e ainda assim existe. Negar progresso sem anilha é negar o local casa, que o produto oferece.',
    ],
    foco: 'A progressão no AthletIA usa o que foi registrado na conta, não um aumento automático publicado aqui.',
    faq: [
      { pergunta: 'Progressão é obrigatória toda sessão?', resposta: 'Não. Há sessões em que manter a mesma dificuldade com forma melhor já é o passo.' },
      { pergunta: 'Quem voltou de pausa progride na primeira ida?', resposta: 'Não é o recomendado. A volta começa abaixo do que a memória acha que ainda vale.' },
    ],
  },
  {
    tema,
    slug: 'treino-personalizado',
    pergunta: 'O que é treino personalizado?',
    resposta: 'Treino personalizado, neste produto, é o plano montado com os dados daquela pessoa: faixa etária, objetivo, experiência, frequência, duração e local. Não é um profissional ao lado. Não é uma ficha igual enviada para toda a base.',
    fatos: [
      'Os Termos descrevem planos baseados em dados físicos e objetivos.',
      'Local casa, academia ou misto muda o que é possível fazer.',
      LIMITES,
    ],
    corpo: [
      '“Personalizado” vira marketing vazio se o cadastro não muda o treino. Aqui a palavra fica amarrada aos campos que existem. Duas pessoas com os mesmos campos podem receber estruturas parecidas. Duas pessoas com dias e locais diferentes não deveriam receber a mesma lista.',
      'Personalizado também não significa exclusivo de lesão, gestação ou doença. Esses casos continuam com o profissional. O aplicativo não cruza essa linha só porque o treino tem o nome da conta.',
    ],
    foco: 'O treino personalizado do AthletIA começa quando o cadastro é preenchido de verdade.',
    faq: [
      { pergunta: 'Personalizado é o mesmo que personal trainer?', resposta: 'Não. Um é o plano gerado com os dados. O outro é o profissional presencial.' },
      { pergunta: 'Sem cadastro o treino ainda é personalizado?', resposta: 'Não, no sentido usado nesta página. Sem dados, não há o que personalizar.' },
    ],
  },
]
