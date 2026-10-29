import { LIMITES } from '../fatos'
import type { PaginaGuia } from '../tipos'

const tema = 'objetivos'

export const paginasObjetivos: PaginaGuia[] = [
  {
    tema,
    slug: 'perder-peso',
    pergunta: 'Como o treino entra na perda de peso?',
    resposta: 'Perder peso depende sobretudo do que a pessoa come ao longo da semana. O treino de força e o cardio ajudam a manter músculo e a aumentar o gasto, mas não apagam uma rotina alimentar que a pessoa não controla. O AthletIA monta o treino. Não monta a dieta.',
    fatos: [
      '“Perder peso” é um objetivo do cadastro.',
      'A OMS recomenda, para adultos, atividade aeróbica e fortalecimento muscular em dois ou mais dias da semana.',
      LIMITES,
    ],
    corpo: [
      'Um treino só de esteira, sem força, não é a única forma de emagrecer, e um treino só de força também não substitui o balanço do que se come. O cadastro deixa a pessoa marcar perder peso e, ao mesmo tempo, dizer se cabe dois dias ou seis, e se a sessão tem 30 a 45 minutos ou mais.',
      'Prometer quilos em um número de semanas seria inventar um resultado. Este guia não faz isso. O que dá para organizar é a semana de treino, no local real, para a pessoa não faltar por não saber o que fazer naquele dia.',
    ],
    foco: 'Quem marca perder peso no AthletIA recebe um plano de treino, não um cardápio.',
    faq: [
      { pergunta: 'O app diz quantos quilos vou perder?', resposta: 'Não. Não há prazo nem quantidade de peso prometidos.' },
      { pergunta: 'Preciso de academia para perder peso?', resposta: 'Não. O local do cadastro pode ser casa.' },
    ],
  },
  {
    tema,
    slug: 'ganhar-massa',
    pergunta: 'O que o treino precisa ter para ganhar massa muscular?',
    resposta: 'Ganhar massa pede treino de força repetido por semanas, com progresso de esforço, sono e comida suficientes. O aplicativo organiza o treino desse objetivo. Não calcula dieta nem garante centímetros.',
    fatos: [
      '“Ganhar massa muscular” é um objetivo do cadastro.',
      'A frequência pode ser de 2 a 6 vezes por semana.',
      'O local pode ser casa, academia ou os dois.',
    ],
    corpo: [
      'Músculo não aparece porque a pessoa baixou uma lista de exercícios uma vez. Aparece, quando aparece, porque o estímulo volta, com descanso entre as sessões e com carga ou dificuldade um pouco maiores ao longo do tempo. Sem comida e sem sono, o treino sozinho não fecha a conta. O AthletIA não controla esses dois.',
      'Em casa, o progresso pode ser repetição, pausa mais curta com boa forma, ou um elástico mais forte. Na academia, pode ser a anilha. O cadastro precisa dizer onde a pessoa está, senão o plano pede um aparelho que não existe.',
    ],
    foco: 'Quem quer ganhar massa marca esse objetivo no AthletIA e informa dias, tempo e local.',
    faq: [
      { pergunta: 'Dois dias por semana servem para hipertrofia?', resposta: 'Dois dias é uma opção do cadastro e cabe em quem tem pouco tempo. Mais dias existem, até seis, se a rotina permitir. Não há um número de semanas prometido.' },
      { pergunta: 'O app passa a quantidade de proteína?', resposta: 'Não. O AthletIA não passa dieta.' },
    ],
  },
  {
    tema,
    slug: 'ficar-mais-forte',
    pergunta: 'Como treinar para ficar mais forte?',
    resposta: 'Ficar mais forte é treinar movimentos com esforço suficiente e recuperar entre as sessões. No cadastro do AthletIA esse objetivo existe separado de perder peso e de ganhar massa. O plano usa a escolha, mais os dias e o local.',
    fatos: [
      '“Ficar mais forte” é um objetivo do cadastro, ao lado de perder peso e ganhar massa.',
      'A experiência pode ser iniciante, intermediário ou avançado.',
      LIMITES,
    ],
    corpo: [
      'Força não é fazer o máximo no primeiro dia. Para quem começa, a prioridade é aprender o movimento e parar se doer. Para quem já treina, a prioridade é progredir sem pular o descanso. O guia não publica percentual de uma repetição máxima.',
      'Academia facilita carga externa. Casa pede variação de alavanca e de repetição. Os dois são locais válidos no cadastro. Nenhum deles substitui alguém que olha a execução de perto quando a pessoa tem dor ou uma lesão antiga.',
    ],
    foco: 'O objetivo de ficar mais forte no AthletIA organiza o treino em volta de força, com a agenda que a pessoa marcar.',
    faq: [
      { pergunta: 'Força e massa são a mesma opção?', resposta: 'Não. O cadastro separa ganhar massa muscular e ficar mais forte.' },
      { pergunta: 'Posso treinar força em casa?', resposta: 'Sim. O local casa está disponível para esse objetivo.' },
    ],
  },
  {
    tema,
    slug: 'pouco-tempo',
    pergunta: 'Dá para treinar com pouco tempo?',
    resposta: 'Dá, se a sessão for curta e couber na semana de verdade. O cadastro tem sessão de 30 a 45 minutos e frequência a partir de duas vezes. Um plano de uma hora que a pessoa não faz não vale mais do que meia hora feita.',
    fatos: [
      'A duração mais curta do cadastro é 30 a 45 minutos.',
      'A menor frequência do cadastro é 2 vezes por semana.',
      'Falta de tempo é uma das dificuldades anteriores listadas no cadastro.',
    ],
    corpo: [
      'Pouco tempo não pede um treino com vinte exercícios. Pede poucos movimentos, feitos com atenção, e um horário que não dependa de “quando sobrar”. Duas sessões de 30 a 45 minutos já são uma opção explícita do produto.',
      'Alongar a sessão no papel para mais de 75 minutos, quando a pessoa só tem meia hora, é o motivo de muita gente abandonar. O cadastro existe para evitar isso. O resultado em quilos ou em carga não tem data marcada neste guia.',
    ],
    foco: 'Quem tem pouco tempo marca 30 a 45 minutos e a frequência real no AthletIA.',
    faq: [
      { pergunta: 'Trinta minutos contam?', resposta: 'A opção de 30 a 45 minutos existe no cadastro. Conta como a sessão que a pessoa consegue cumprir.' },
      { pergunta: 'Preciso treinar todo dia para compensar a sessão curta?', resposta: 'Não. Treinar todos os dias não é obrigatório, e seis vezes é o máximo oferecido, não a meta de quem tem pouco tempo.' },
    ],
  },
  {
    tema,
    slug: 'consistencia',
    pergunta: 'Como manter a consistência no treino?',
    resposta: 'Consistência é repetir uma semana que cabe, não aguentar uma semana perfeita por sete dias. Falta de motivação e falta de um plano claro estão entre as dificuldades que o cadastro do AthletIA registra.',
    fatos: [
      'Dificuldades no cadastro: falta de motivação, falta de plano, treino duro demais e falta de tempo.',
      'A frequência vai de 2 a 6 vezes por semana.',
      'O serviço inclui histórico de treinos, conforme os Termos de Uso.',
    ],
    corpo: [
      'A pessoa falta quando não sabe o que fazer ou quando o treino é longo demais para o dia. Um plano escrito para aquela frequência reduz a decisão das seis da tarde. O histórico mostra se a semana aconteceu, sem transformar falha em culpa.',
      'Motivação oscila. O que segura a sequência é o horário menor e possível. Este texto não promete que a motivação volta em um prazo. Promete só que o produto guarda o plano e o que foi registrado.',
    ],
    foco: 'O AthletIA guarda o plano e o histórico para a semana não recomeçar do zero toda segunda.',
    faq: [
      { pergunta: 'Faltar uma semana estraga o treino?', resposta: 'Não há, neste guia, uma punição numérica por faltar. O caminho é voltar na frequência que cabe, não dobrar o treino no dia seguinte.' },
      { pergunta: 'O app cobra presença?', resposta: 'Não. A pessoa registra o treino na conta. A assinatura é dos planos publicados, não uma multa por ausência.' },
    ],
  },
  {
    tema,
    slug: 'voltar-a-treinar',
    pergunta: 'Como voltar a treinar depois de parar?',
    resposta: 'Voltar pede menos volume do que a pessoa fazia no auge. No cadastro, isso aparece como experiência real de hoje, frequência baixa e sessão mais curta. Retomar a planilha antiga na primeira semana é um motivo clássico de desistência.',
    fatos: [
      'A experiência pode ser marcada como iniciante mesmo que a pessoa já tenha treinado antes.',
      'Duas vezes por semana e 30 a 45 minutos são opções do cadastro.',
      'Treino duro demais é uma dificuldade listada no produto.',
    ],
    corpo: [
      'O corpo não guarda a carga de um ano atrás como se a pausa não existisse. Começar de novo com dois ou três dias, em casa ou na academia, deixa espaço para a técnica voltar. Dor é sinal para parar, não para “completar a série”. Os Termos de Uso dizem isso.',
      'O objetivo pode continuar o mesmo: perder peso, ganhar massa ou ficar mais forte. O que muda na volta é a dose da semana. O guia não diz em quantos dias a pessoa “recupera tudo”.',
    ],
    foco: 'Na volta, o cadastro do AthletIA deve refletir a condição de hoje, não a de quando a pessoa parou.',
    faq: [
      { pergunta: 'Devo marcar avançado se já treinei muito no passado?', resposta: 'Só se isso for verdade agora. O nível do cadastro descreve o momento, não a memória.' },
      { pergunta: 'Preciso de liberação médica?', resposta: 'Se houver dúvida, dor ou doença, sim. O aplicativo não dá essa liberação.' },
    ],
  },
  {
    tema,
    slug: 'treino-em-casa',
    pergunta: 'Treinar em casa dá resultado?',
    resposta: 'Pode dar, se o treino for repetido e progredir com o que a pessoa tem em casa, inclusive sem equipamento. Casa não é um resultado menor por definição. É um local do cadastro. O que não dá resultado é um treino que não acontece.',
    fatos: [
      'O local casa inclui equipamento básico ou nenhum equipamento.',
      'Objetivos de perder peso, ganhar massa e ficar mais forte aceitam esse local.',
      'Não há prazo de resultado publicado neste guia.',
    ],
    corpo: [
      'Em casa, a progressão é mais discreta do que colocar anilha. Pode ser mais repetições com a mesma forma, uma variação mais difícil, ou um elástico. Isso ainda é treino de força. A OMS inclui fortalecimento muscular na recomendação de atividade para adultos, sem exigir uma academia comercial.',
      'O limite de casa é o espaço e o equipamento, não a validade do esforço. Quem precisa de aparelho específico marca academia ou misto. Quem só tem a sala marca casa e não copia uma ficha de leg press.',
    ],
    foco: 'Quem vai treinar na sala marca casa no AthletIA para o plano não pedir aparelho de academia.',
    faq: [
      { pergunta: 'Sem halter ainda conta?', resposta: 'Sim. A descrição do local casa inclui treino sem equipamentos.' },
      { pergunta: 'Em casa eu emagreço menos?', resposta: 'O guia não publica comparação de quilos entre casa e academia. O emagrecimento não é um número prometido pelo aplicativo.' },
    ],
  },
  {
    tema,
    slug: 'academia-vale-a-pena',
    pergunta: 'Academia vale a pena?',
    resposta: 'Vale quando a pessoa usa o equipamento e consegue ir. Não vale como mensalidade parada. Para o treino, academia é o local com aparelhos completos. O AthletIA monta o que fazer lá. Não vende o plano da academia.',
    fatos: [
      'Local academia: acesso a equipamentos completos.',
      'A ida pode ser de 2 a 6 vezes por semana.',
      'O preço do AthletIA é a assinatura do aplicativo, separada da mensalidade da academia.',
    ],
    corpo: [
      'Aparelho ajuda a progredir carga com mais clareza. Também ajuda quem gosta de sair de casa para treinar. Não corrige falta de plano: muita gente chega na academia e repete o mesmo circuito porque não decidiu o treino antes.',
      'Se a academia fica longe e a pessoa falta, o local casa ou o misto pode ser mais honesto. O cadastro deixa essa escolha. Este texto não diz que um lugar é obrigatório para ter resultado.',
    ],
    foco: 'Quem já paga academia pode usar o AthletIA para chegar sabendo o treino da sessão.',
    faq: [
      { pergunta: 'O AthletIA substitui a mensalidade da academia?', resposta: 'Não. Ele não é uma academia. É o plano de treino.' },
      { pergunta: 'Quantas vezes por semana na academia?', resposta: 'O cadastro oferece de 2 a 6. A resposta certa é a que a pessoa cumpre.' },
    ],
  },
]
