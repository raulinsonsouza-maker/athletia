import { LIMITES } from '../fatos'
import type { PaginaGuia } from '../tipos'

const tema = 'treino'

export const paginasTreino: PaginaGuia[] = [
  {
    tema,
    slug: 'quantos-dias-por-semana',
    pergunta: 'Quantos dias por semana devo treinar?',
    resposta: 'Não existe um número único. A OMS fala em fortalecimento em dois ou mais dias para adultos, além da atividade aeróbica da semana. No AthletIA, a pessoa escolhe de 2 a 6 vezes, e a escolha certa é a que ela repete.',
    fatos: [
      'Opções do cadastro: 2, 3, 4, 5 ou 6 vezes por semana.',
      'Dois ou mais dias de fortalecimento aparecem na recomendação da OMS para adultos.',
      'Marcar seis e fazer dois não melhora o plano. Só o torna falso.',
    ],
    corpo: [
      'Dois dias organizados batem cinco dias imaginários. Três e quatro cabem em quem já tem horário. Cinco e seis são para quem de fato treina quase todo dia e recupera. O cadastro descreve duas vezes como opção de pouco tempo e seis como opção de quem é dedicado. Não é uma escada obrigatória.',
      'Descanso faz parte da semana. Treinar os sete dias não é uma opção do produto. O teto é seis.',
    ],
    foco: 'No AthletIA a frequência é uma pergunta do cadastro, de 2 a 6 vezes, não um palpite depois.',
    faq: [
      { pergunta: 'Três vezes é pouco?', resposta: 'Três vezes é uma opção do cadastro, descrita como progressão constante. Pouco ou muito depende do que a pessoa consegue manter.' },
      { pergunta: 'Posso mudar a frequência?', resposta: 'Os dados de treino ficam na conta. O plano deve seguir a frequência verdadeira, não a desejada.' },
    ],
  },
  {
    tema,
    slug: 'duas-vezes-por-semana',
    pergunta: 'Treinar duas vezes por semana funciona?',
    resposta: 'Funciona como semana mínima e honesta. Duas vezes é a menor frequência do cadastro e a descrição do produto liga essa opção a iniciante ou a quem tem pouco tempo. Não é um teto de resultado, porque resultado não tem número aqui.',
    fatos: [
      '2 vezes por semana é a primeira opção de frequência.',
      'A descrição no produto: ideal para iniciantes ou quem tem pouco tempo.',
      'A sessão ainda pode durar de 30 a 45 minutos até mais de 75.',
    ],
    corpo: [
      'Em dois dias, o treino tende a cobrir o corpo na sessão, senão um músculo só aparece de quinze em quinze dias. Isso não exige academia. Exige escolha de poucos movimentos bem feitos, em casa ou com aparelho.',
      'Quem só pode ir duas vezes e marca cinco se sabota. O plano de cinco dias vira três faltas e uma sensação de fracasso. Marcar dois alinha o texto com a vida.',
    ],
    foco: 'Quem só tem dois dias marca essa frequência no AthletIA.',
    faq: [
      { pergunta: 'Dois dias servem para ganhar massa?', resposta: 'O objetivo de ganhar massa pode ser combinado com duas vezes. O guia não promete o quanto de massa isso produz.' },
      { pergunta: 'Preciso compensar com treino extra no domingo?', resposta: 'Não é obrigatório. O sétimo dia nem existe como opção de frequência.' },
    ],
  },
  {
    tema,
    slug: 'tres-vezes-por-semana',
    pergunta: 'Treinar três vezes por semana é suficiente?',
    resposta: 'Três vezes é uma frequência do cadastro, descrita como progressão constante. É suficiente para muita gente manter força e não faltar. Suficiente não quer dizer resultado máximo, porque esse máximo não é um número do produto.',
    fatos: [
      '3 vezes por semana é uma opção explícita.',
      'Pode combinar com sessão de 45 a 60 minutos.',
      'O local continua sendo casa, academia ou os dois.',
    ],
    corpo: [
      'Três dias permitem um intervalo entre sessões. A pessoa não precisa treinar segunda, terça e quarta e sumir no resto da semana por cansaço. Espalhar, por exemplo, segunda, quarta e sexta, é uma organização comum e compatível com essa frequência.',
      'O conteúdo de cada dia depende do objetivo. Perder peso, ganhar massa e ficar mais forte não preenchem os três dias do mesmo jeito. O cadastro separa isso.',
    ],
    foco: 'Três vezes por semana é uma escolha direta no cadastro do AthletIA.',
    faq: [
      { pergunta: 'Três dias seguidos ou alternados?', resposta: 'O cadastro pede quantas vezes, não o nome do dia. Alternar costuma deixar recuperação. Não é uma regra médica deste guia.' },
      { pergunta: 'Iniciante pode marcar três?', resposta: 'Pode, se for cumprir. A opção de duas vezes continua disponível.' },
    ],
  },
  {
    tema,
    slug: 'quatro-vezes-por-semana',
    pergunta: 'Treinar quatro vezes por semana é melhor?',
    resposta: 'Quatro vezes é uma opção do cadastro, descrita para quem quer mais estímulo na semana. Só é melhor se as quatro acontecem. Quatro no papel e duas na prática perdem para três cumpridas.',
    fatos: [
      '4 vezes por semana está no cadastro.',
      'A descrição do produto fala em resultados mais rápidos apenas como texto da opção, sem prazo numérico.',
      'Este guia não converte essa frase em semanas de resultado.',
    ],
    corpo: [
      'Com quatro dias dá para separar um pouco os estímulos, por exemplo dois dias de ênfase em empurrar e puxar e dois de pernas e núcleo, ou repetir um treino de corpo inteiro mais curto. A divisão exata depende do tempo da sessão. Quarenta e cinco minutos não cabem o mesmo que setenta e cinco.',
      'Recuperação ainda existe. Quatro não é sete. Dormir mal a semana inteira anula a vantagem de ter um dia a mais.',
    ],
    foco: 'Quatro vezes só entra no AthletIA se a pessoa realmente tem quatro horários.',
    faq: [
      { pergunta: 'Quatro é obrigatório para hipertrofia?', resposta: 'Não. Duas, três, cinco e seis também são opções. O objetivo de ganhar massa não trava a frequência.' },
      { pergunta: 'Posso fazer dois dias seguidos e dois de descanso?', resposta: 'A distribuição dos dias não é um campo separado. A pessoa organiza os quatro horários que marcou.' },
    ],
  },
  {
    tema,
    slug: 'cinco-vezes-por-semana',
    pergunta: 'Treinar cinco vezes por semana faz mal?',
    resposta: 'Cinco vezes não faz mal por ser cinco. Faz mal se a pessoa não recupera, sente dor que não é esforço ou copia volume de atleta. No cadastro, cinco vezes está descrita para quem já é experiente.',
    fatos: [
      '5 vezes por semana é opção do cadastro, com a descrição “para atletas experientes”.',
      'A experiência avançada existe separada da frequência.',
      'Dor é motivo para parar, conforme os Termos de Uso.',
    ],
    corpo: [
      'Cinco idas pedem sessão que caiba. Cinco vezes mais de 75 minutos é muito tempo. Cinco vezes de 45 a 60 minutos já é uma semana cheia. O cadastro deixa combinar as duas escolhas com honestidade.',
      'Iniciante pode até marcar cinco, mas a descrição do produto não aponta essa opção para quem está começando. Dois ou três dias costumam ser o começo sustentável.',
    ],
    foco: 'Cinco vezes no AthletIA combina com quem já treina e consegue recuperar.',
    faq: [
      { pergunta: 'Iniciante deve marcar cinco?', resposta: 'A própria descrição da opção fala em pessoas experientes. Iniciante tem duas e três vezes à disposição.' },
      { pergunta: 'O quinto dia tem que ser corrida?', resposta: 'Não está definido assim. Cardio e força podem coexistir. O aplicativo não passa dieta nem prova de corrida.' },
    ],
  },
  {
    tema,
    slug: 'seis-vezes-por-semana',
    pergunta: 'Treinar seis vezes por semana é necessário?',
    resposta: 'Não é necessário. Seis é o máximo do cadastro e a descrição chama isso de opção para quem é dedicado. A maior parte das pessoas não precisa desse teto para ter um plano sério.',
    fatos: [
      '6 vezes por semana é a frequência mais alta do cadastro.',
      'Não existe opção de 7 vezes.',
      LIMITES,
    ],
    corpo: [
      'Seis dias deixam pouco espaço para um imprevisto. Uma gripe zera a semana “perfeita” e a pessoa desiste. Quem marca seis deve ter sessão compatível, não um treino longo em todos eles. O dia que sobra sem treino de força ainda pode existir fora dessa conta.',
      'Descansar não é perder o plano. É o que permite a próxima sessão. O guia não diz que seis dias produzem o dobro de três.',
    ],
    foco: 'Seis vezes só deve ser marcada no AthletIA por quem já vive essa rotina.',
    faq: [
      { pergunta: 'Seis dias aceleram o resultado?', resposta: 'O guia não publica essa conta. Mais dias sem recuperação não são um atalho com data.' },
      { pergunta: 'Posso treinar domingo também?', resposta: 'Sete vezes não é uma frequência do cadastro. O teto é seis.' },
    ],
  },
  {
    tema,
    slug: 'duracao-da-sessao',
    pergunta: 'Quanto tempo deve durar um treino?',
    resposta: 'O tempo é o que cabe. O cadastro oferece 30 a 45 minutos, 45 a 60, 60 a 75 e mais de 75. A sessão marcada precisa ser a sessão que a pessoa termina, não a que ela gostaria de ter.',
    fatos: [
      'Quatro faixas de duração, da mais curta (30 a 45 minutos) à mais longa (mais de 75).',
      'A faixa de 45 a 60 minutos é descrita no produto como duração para treinos completos.',
      'Falta de tempo é uma dificuldade à parte, ligada à faixa curta.',
    ],
    corpo: [
      'Treino longo demais é um motivo conhecido de abandono. A opção “meus treinos eram muito duros” está no cadastro por isso. Encurtar a sessão e manter a frequência segura melhor a semana do que alongar o papel.',
      'Aquecimento entra nesse relógio. Uma hora marcada não é uma hora só de série. Quem tem 30 a 45 minutos escolhe menos exercícios, não encurta o cuidado com a dor.',
    ],
    foco: 'A duração da sessão é um campo do AthletIA. Ela deve ser a duração real.',
    faq: [
      { pergunta: 'Uma hora é obrigatória?', resposta: 'Não. Há faixa abaixo e acima de uma hora.' },
      { pergunta: 'Conta o deslocamento?', resposta: 'Não. A duração é da sessão de treino, não do caminho até a academia. Quem perde tempo no trânsito pode marcar casa ou misto.' },
    ],
  },
  {
    tema,
    slug: 'treino-de-30-minutos',
    pergunta: 'Treino de 30 minutos funciona?',
    resposta: 'Funciona como sessão curta e repetível. A faixa de 30 a 45 minutos existe no cadastro para quem tem pouco tempo. Ela não inclui dezenas de exercícios. Inclui poucos, feitos por completo.',
    fatos: [
      '30 a 45 minutos é a menor duração oferecida.',
      'A descrição do produto: treinos rápidos para quem tem pouco tempo.',
      'Pode ser em casa, sem equipamento.',
    ],
    corpo: [
      'Em meia hora, dois ou três movimentos compostos, com séries e descanso, ocupam o relógio. Encaixar um treino de academia inteira nesse intervalo só existe no papel. A pessoa marca a faixa curta e o plano precisa respeitar isso.',
      'Trinta minutos não são uma promessa de emagrecimento. São um horário. O gasto e a força dependem do que é feito dentro deles, da semana inteira e, no caso do peso corporal, da alimentação, que o aplicativo não prescreve.',
    ],
    foco: 'Quem só tem meia hora marca 30 a 45 minutos no AthletIA.',
    faq: [
      { pergunta: 'Preciso suar muito nesses 30 minutos?', resposta: 'Suor não é a medida do treino. Esforço e boa forma são. O guia não usa suor como meta.' },
      { pergunta: 'Posso fazer 30 minutos todo dia?', resposta: 'A frequência máxima continua sendo 6 vezes, não 7. E nem todo dia é obrigatório.' },
    ],
  },
  {
    tema,
    slug: 'treinar-todos-os-dias',
    pergunta: 'Treinar todos os dias faz mal?',
    resposta: 'Treinar os sete dias, sem folga, aumenta a chance de a pessoa não recuperar e parar. O cadastro não oferece sete vezes. O máximo é seis. Um dia sem treino de força não apaga a semana.',
    fatos: [
      'A frequência vai até 6, não até 7.',
      'Treino duro demais é uma dificuldade reconhecida no cadastro.',
      'Os Termos pedem interromper o exercício se houver dor.',
    ],
    corpo: [
      'Há diferença entre caminhar todo dia e repetir o mesmo treino pesado todo dia. Atividade leve pode existir fora da sessão de força. O plano de força precisa de intervalo. A recomendação da OMS separa atividade aeróbica ao longo da semana e fortalecimento em dois ou mais dias, não um máximo diário.',
      'Quem sente que “perder um dia é fracasso” costuma abandonar o mês inteiro depois da primeira falha. O plano de dois a seis dias já admite que a semana tem vida fora do treino.',
    ],
    foco: 'O AthletIA não pede treino em todos os dias. A pessoa escolhe até seis.',
    faq: [
      { pergunta: 'Caminhar no dia de folga conta como errar?', resposta: 'Não. Folga do treino de força não é proibição de se mover. O aplicativo não controla a caminhada.' },
      { pergunta: 'Se eu faltei ontem, treino dobrado hoje?', resposta: 'Não é o que este guia recomenda. Voltar na sessão normal evita o treino duro demais.' },
    ],
  },
  {
    tema,
    slug: 'dia-de-descanso',
    pergunta: 'Para que serve o dia de descanso?',
    resposta: 'O dia de descanso deixa o corpo recuperar o treino de força. Sem ele, a próxima sessão começa pior, não melhor. Como a frequência máxima do cadastro é seis, pelo menos um dia da semana fica fora do plano de treino.',
    fatos: [
      'Não há opção de treinar 7 vezes.',
      'Quem marca 2 vezes descansa os outros cinco dias da sessão marcada.',
      'Dor persistente não é “descanso curto”. É motivo para procurar profissional.',
    ],
    corpo: [
      'Descanso não é sofá obrigatório o dia inteiro. É ausência daquela sessão pesada. Dormir pouco no dia de descanso anula parte do intervalo. O AthletIA não monitora sono.',
      'Iniciante em geral precisa de mais dias fora do treino do que alguém que marca avançado e seis vezes. As duas combinações existem no cadastro. Nenhuma vem com data de resultado.',
    ],
    foco: 'O descanso já está implícito na frequência que a pessoa marca no AthletIA.',
    faq: [
      { pergunta: 'Descanso perde músculo?', resposta: 'Um dia sem treino não é o tema de perda de músculo que este guia vai numerar. O que prejudica é sumir por semanas e voltar no máximo.' },
      { pergunta: 'Posso fazer alongamento na folga?', resposta: 'Pode. Alongamento leve não substitui avaliação de dor.' },
    ],
  },
  {
    tema,
    slug: 'descanso-entre-series',
    pergunta: 'Quanto descansar entre as séries?',
    resposta: 'O descanso entre séries muda com o objetivo e com o fôlego da pessoa. Força pede mais tempo para repetir o esforço com forma. Um circuito curto descansa menos. Este guia não fixa um único número de segundos para todo mundo.',
    fatos: [
      'Os objetivos do cadastro são perder peso, ganhar massa e ficar mais forte. Eles não compartilham o mesmo ritmo.',
      'A duração da sessão inclui o descanso. Sem isso, a hora estoura.',
      LIMITES,
    ],
    corpo: [
      'Descansar “até o relógio apitar” sem ar e com a técnica caindo não é eficiência. É série mal feita. Se a sessão é de 30 a 45 minutos, o descanso longo de vários minutos em muitos exercícios não cabe. A pessoa reduz a quantidade de exercícios, não a segurança.',
      'Não publicamos aqui 30, 60 ou 180 segundos como regra do AthletIA. O aplicativo organiza o treino. A pessoa ajusta a pausa para conseguir a próxima série com controle.',
    ],
    foco: 'O tempo de sessão marcado no AthletIA já tem que incluir o descanso entre as séries.',
    faq: [
      { pergunta: 'Descansar demais atrapalha o emagrecimento?', resposta: 'O guia não usa a pausa como estratégia de emagrecimento. O aplicativo não passa dieta nem um tempo oficial de intervalo.' },
      { pergunta: 'Posso conversar e alongar a pausa?', resposta: 'A pausa serve para a próxima série sair com forma. Se a forma cai, a pausa estava curta, não longa.' },
    ],
  },
  {
    tema,
    slug: 'corpo-inteiro-ou-divisao',
    pergunta: 'Treino de corpo inteiro ou treino dividido?',
    resposta: 'Corpo inteiro cabe melhor em duas ou três vezes por semana, porque cada ida cobre os principais movimentos. Divisão por grupo cabe melhor quando há mais dias, quatro a seis, senão um músculo espera demais pela próxima sessão.',
    fatos: [
      'Frequências baixas (2 e 3) e altas (4, 5 e 6) existem no mesmo cadastro.',
      'A sessão curta não comporta uma divisão longa de um músculo só com vinte exercícios.',
      'O local muda os exercícios, não a lógica dos dias.',
    ],
    corpo: [
      'Quem treina duas vezes e divide “peito na segunda, perna na próxima segunda” treina perna uma vez a cada duas semanas se faltar uma ida. Corpo inteiro reduz esse buraco. Quem treina cinco vezes consegue separar empurrar, puxar e pernas sem deixar um grupo de fora por muito tempo.',
      'O AthletIA recebe a frequência antes de montar a semana. A divisão tem que servir a esse número. Não o contrário.',
    ],
    foco: 'A frequência marcada no AthletIA decide se a semana é de corpo inteiro ou dividida.',
    faq: [
      { pergunta: 'Iniciante deve dividir por músculo?', resposta: 'Com poucos dias, corpo inteiro é a organização mais estável. Divisão fina pede mais idas.' },
      { pergunta: 'Existe divisão obrigatória do app?', resposta: 'O guia não publica uma grade única. Publica a regra de combinar a divisão com os dias informados.' },
    ],
  },
  {
    tema,
    slug: 'musculacao-e-cardio',
    pergunta: 'Devo fazer musculação e cardio?',
    resposta: 'Os dois têm papéis diferentes. A força preserva e desenvolve músculo. O cardio entra na atividade aeróbica da semana, que a OMS descreve para adultos. Um não cancela o outro. O AthletIA é o plano de treino, não um relógio de esteira obrigatório.',
    fatos: [
      'A OMS descreve atividade aeróbica na semana e fortalecimento em dois ou mais dias.',
      'Perder peso é um objetivo do cadastro e não se resume a cardio.',
      'O aplicativo não passa dieta.',
    ],
    corpo: [
      'Fazer só cardio e abandonar a força costuma ser o plano de quem quer emagrecer e não quer “ficar grande”. Ganhar massa e perder peso são objetivos separados justamente para a pessoa não misturar isso. Força cabe nos dois.',
      'O cardio pode ser caminhada fora da sessão, se a sessão de 30 a 45 minutos já está cheia de força. Enfiar os dois sem relógio estoura a duração marcada. O plano precisa caber no tempo.',
    ],
    foco: 'No AthletIA o objetivo e o tempo da sessão definem quanto cabe além da força.',
    faq: [
      { pergunta: 'Cardio antes ou depois da força?', resposta: 'Se a prioridade é força, a força vem primeiro na sessão, enquanto a pessoa está descansada. Não é uma lei clínica. É organização.' },
      { pergunta: 'Esteira emagrece sozinha?', resposta: 'Não é o que este guia afirma. Perda de peso não é um número prometido e não vem só da esteira.' },
    ],
  },
  {
    tema,
    slug: 'como-progredir',
    pergunta: 'Como progredir no treino?',
    resposta: 'Progredir é fazer a sessão um pouco mais difícil quando a forma está estável: mais repetição, mais carga, ou uma variação mais exigente. Não é trocar o treino todo semana. O AthletIA registra histórico para o ajuste descrito nos Termos. Não publica um percentual de aumento.',
    fatos: [
      'Os Termos de Uso falam em ajuste do treino conforme o progresso.',
      'Em casa, a progressão pode acontecer sem anilha.',
      'Dor não é o sinal para aumentar carga.',
    ],
    corpo: [
      'Quem aumenta tudo ao mesmo tempo não sabe o que funcionou e machuca o que ainda não estava firme. Uma mudança de cada vez, na frequência que a pessoa já cumpre, é progresso. Falhar uma semana e dobrar a carga na volta não é.',
      'O histórico serve para a pessoa ver se repetiu a semana. Sem registro, a memória inventa que “treinou pesado”. O aplicativo oferece esse registro na conta. Não oferece um gráfico de resultado garantido.',
    ],
    foco: 'O progresso no AthletIA depende do que a pessoa registra, não de um aumento automático de carga publicado neste guia.',
    faq: [
      { pergunta: 'Devo subir a carga toda semana?', resposta: 'Não há essa regra numérica aqui. Sobe quando a série sai com forma e sem dor.' },
      { pergunta: 'Sem equipamento, como progrido?', resposta: 'Com mais repetições controladas ou com uma variação mais difícil do mesmo movimento. O local casa prevê treino sem equipamento.' },
    ],
  },
  {
    tema,
    slug: 'por-que-nao-vejo-resultado',
    pergunta: 'Por que eu treino e não vejo resultado?',
    resposta: 'Em geral a semana feita não é a semana planejada, o esforço não progride, ou a expectativa tem uma data que ninguém pode prometer. Falta de plano, treino duro demais, falta de tempo e falta de motivação estão no cadastro porque são causas comuns de parar antes de qualquer mudança visível.',
    fatos: [
      'O guia não publica prazo de resultado.',
      'O aplicativo não controla alimentação nem sono.',
      'A frequência marcada precisa ser a frequência cumprida.',
    ],
    corpo: [
      'Treinar “há um mês” com faltas, sem registrar e sem aumentar nada não é o mesmo que treinar um mês. A comparação justa é a semana que aconteceu. O histórico da conta existe para essa comparação.',
      'Espelho e balança também dependem de comida. Como o AthletIA não passa dieta, atribuir ao treino um número de quilos é misturar duas coisas. O treino organiza o estímulo. O resto não está no aplicativo.',
    ],
    foco: 'Quando o resultado não aparece, o primeiro passo no AthletIA é conferir se os dias e o tempo do cadastro são os dias e o tempo reais.',
    faq: [
      { pergunta: 'Trocar o treino toda semana resolve?', resposta: 'Não. Trocar sempre impede a progressão. Repetir e dificultar um pouco é o caminho descrito nesta página.' },
      { pergunta: 'Pode ser um problema de saúde?', resposta: 'Pode. Isso não se resolve no aplicativo. Procure um profissional.' },
    ],
  },
  {
    tema,
    slug: 'quanto-tempo-para-ver-resultado',
    pergunta: 'Em quanto tempo o treino dá resultado?',
    resposta: 'Não há um número de semanas que este guia possa publicar. Quem promete prazo está inventando. O que se pode dizer é que uma semana isolada não muda o corpo, e que a mudança, quando vem, pede repetição, progresso e recuperação.',
    fatos: [
      'Nenhum plano do AthletIA inclui prazo de resultado.',
      'Os preços são de assinatura, não de um pacote com data de transformação.',
      'Alimentação e sono não são controlados pelo aplicativo.',
    ],
    corpo: [
      'Força em um movimento pode ser percebida antes da mudança no espelho, porque a pessoa aprendeu a fazer o gesto. Isso não é o mesmo que uma medida de cintura. Medida depende de mais fatores do que a sessão.',
      'O uso útil do tempo é cumprir a frequência escolhida por tempo suficiente para o histórico existir. Cobrar o espelho na segunda semana e abandonar é o ciclo que o cadastro chama de falta de plano e de motivação. Não há data de virada neste texto.',
    ],
    foco: 'O AthletIA organiza o treino contínuo. Não vende um resultado com data.',
    faq: [
      { pergunta: 'Trinta dias bastam?', resposta: 'O guia não confirma nem nega um prazo de 30 dias, porque qualquer prazo fixo seria inventado.' },
      { pergunta: 'O plano semestral garante mais resultado?', resposta: `Não. O Semestral custa o valor publicado de assinatura. Não é um prazo de corpo.` },
    ],
  },
  {
    tema,
    slug: 'aquecimento',
    pergunta: 'Preciso aquecer antes do treino?',
    resposta: 'Sim, de forma curta e específica: mover as articulações que vão trabalhar e fazer algumas repetições leves do primeiro exercício. Aquecimento longo que consome a sessão de 30 a 45 minutos deixa o treino sem tempo.',
    fatos: [
      'A duração marcada inclui o que acontece antes da série principal.',
      'Dor durante o aquecimento é motivo para não “forçar o restante”.',
      'O aplicativo não substitui avaliação de lesão.',
    ],
    corpo: [
      'Chegar e puxar a carga máxima no primeiro movimento é um jeito comum de irritar ombro, lombar e joelho. Duas séries leves do mesmo padrão resolvem melhor do que vinte minutos de esteira sem relação com o treino, quando o relógio é curto.',
      'Quem tem 60 a 75 minutos pode separar um pouco mais o começo. Quem tem meia hora reduz o aquecimento ao necessário e reduz também a lista de exercícios. Não pula os dois.',
    ],
    foco: 'A sessão marcada no AthletIA precisa ter espaço para começar leve.',
    faq: [
      { pergunta: 'Esteira é obrigatória?', resposta: 'Não. O aquecimento pode ser o próprio movimento, leve, no local casa ou na academia.' },
      { pergunta: 'Alongar até doer antes conta?', resposta: 'Não. Dor não é aquecimento. Os Termos pedem interrupção se houver dor.' },
    ],
  },
  {
    tema,
    slug: 'treino-duro-demais',
    pergunta: 'O que fazer quando o treino está duro demais?',
    resposta: 'Diminuir o volume: menos exercícios, menos dias ou menos tempo. “Meus treinos eram muito duros” é uma dificuldade do cadastro. Insistir no plano que a pessoa não termina é o caminho para parar de vez.',
    fatos: [
      'Treino duro demais está listado nas dificuldades anteriores.',
      'A frequência pode cair até 2 vezes e a sessão até 30 a 45 minutos.',
      'Dor não se resolve aumentando a dureza.',
    ],
    corpo: [
      'Duro demais às vezes é carga. Às vezes é simplesmente uma lista que não cabe em 45 minutos. Cortar pela metade e completar a sessão vale mais do que falhar no meio. O cadastro deve ser atualizado para a dose que cabe, senão o próximo plano repete o excesso.',
      'Há dureza que é doença ou lesão. Isso não se ajusta no aplicativo. A pessoa para e procura profissional, como os Termos de Uso já pedem diante de dor.',
    ],
    foco: 'Se o plano não cabe, a correção no AthletIA é marcar menos dias ou menos tempo, não aguentar no orgulho.',
    faq: [
      { pergunta: 'Treino fácil não dá resultado?', resposta: 'O guia não mede resultado por sofrimento. Mede por sessão feita e progresso sem dor.' },
      { pergunta: 'Devo trocar de objetivo?', resposta: 'Só se o objetivo estiver errado. Dureza demais em geral é dose, não o fato de querer ganhar massa ou perder peso.' },
    ],
  },
  {
    tema,
    slug: 'falta-de-motivacao',
    pergunta: 'Como treinar sem motivação?',
    resposta: 'Motivação não é o plano. O plano é um horário curto e uma lista já decidida. Falta de motivação está no cadastro como dificuldade de manter consistência. Esperar vontade para escolher o treino na hora é o que faz a pessoa faltar.',
    fatos: [
      'Falta de motivação é uma dificuldade anterior do cadastro.',
      'Sessão de 30 a 45 minutos reduz a negociação com a vontade.',
      'O histórico mostra o que foi feito, sem transformar falta em diagnóstico.',
    ],
    corpo: [
      'Vontade oscila de manhã para a noite. Um treino que depende de decidir vinte coisas na academia perde para um treino que já está escrito. O aplicativo entrega essa lista a partir do cadastro. A pessoa ainda precisa aparecer. Nenhum serviço faz o movimento no lugar dela.',
      'Se a falta de ânimo vem com tristeza persistente, isso é assunto de saúde, não de série. O guia não trata isso e o aplicativo não é terapia.',
    ],
    foco: 'O AthletIA tira a decisão do treino da hora em que a motivação some.',
    faq: [
      { pergunta: 'Música e pré-treino resolvem?', resposta: 'Não são funções do produto. O que o produto oferece é o plano e o histórico.' },
      { pergunta: 'Faltar quando não estou animado é normal?', resposta: 'Acontece. O retorno é na próxima sessão marcada, não num treino punitivo.' },
    ],
  },
  {
    tema,
    slug: 'serie-e-repeticao',
    pergunta: 'O que são série e repetição?',
    resposta: 'Repetição é uma execução do movimento. Série é um bloco de repetições feito antes de descansar. “3 séries de 10” significa repetir o movimento dez vezes, descansar, e fazer isso três vezes. O número exato muda com o exercício e com a pessoa. Este guia não fixa 10 para todo mundo.',
    fatos: [
      'A sessão inteira, séries e descansos, precisa caber no tempo marcado.',
      'Iniciante prioriza a forma da repetição, não o recorde.',
      'O aplicativo não publica uma tabela única de séries.',
    ],
    corpo: [
      'Contar repetição com pressa e com o corpo despencando não é a décima repetição. É pressa. Melhor oito repetições com controle do que doze pela metade. Quando as repetições ficam fáceis e estáveis, aí se progride, em casa ou na academia.',
      'Série até não conseguir se mexer no dia seguinte não é meta de iniciante. A dificuldade “treino duro demais” existe porque esse excesso afasta. O plano deve deixar a pessoa capaz de voltar na frequência que ela mesma marcou.',
    ],
    foco: 'O treino do AthletIA organiza séries dentro do tempo e do nível que a pessoa informou.',
    faq: [
      { pergunta: 'Todo exercício é 3 de 10?', resposta: 'Não. Esse é só um exemplo de linguagem. Não é a regra do produto.' },
      { pergunta: 'Repetição parcial conta?', resposta: 'Conta menos do que a repetição completa com controle. Não é o padrão para quem está aprendendo o movimento.' },
    ],
  },
  {
    tema,
    slug: 'o-que-e-hipertrofia',
    pergunta: 'O que é hipertrofia no treino?',
    resposta: 'Hipertrofia é o aumento do músculo por treino de força repetido, com recuperação e com comida suficiente. No cadastro do AthletIA o nome do objetivo é ganhar massa muscular. O aplicativo monta o treino. Não mede o músculo nem passa a dieta que acompanha esse objetivo.',
    fatos: [
      'Ganhar massa muscular é um objetivo do cadastro feminino e do masculino.',
      'A frequência desse objetivo ainda é escolhida de 2 a 6 vezes.',
      LIMITES,
    ],
    corpo: [
      'Hipertrofia não é sinônimo de treinar todo dia nem de sentir dor extrema. É tensão suficiente, várias vezes na semana que a pessoa tem, com sono. Sem esses intervalos, o nome do objetivo não produz o tecido.',
      'Casa e academia servem, com progressões diferentes. Quem promete centímetros em um pacote de semanas não está repetindo um fato deste guia.',
    ],
    foco: 'Quem quer hipertrofia marca ganhar massa muscular no AthletIA.',
    faq: [
      { pergunta: 'Hipertrofia e força são iguais?', resposta: 'Não no cadastro. Ficar mais forte é outra opção.' },
      { pergunta: 'Mulher que treina hipertrofia fica igual a fisiculturista?', resposta: 'O guia não afirma isso. Ganhar massa é o objetivo marcado. O quanto muda não tem número publicado.' },
    ],
  },
  {
    tema,
    slug: 'emagrecimento-no-treino',
    pergunta: 'O que é emagrecimento no treino?',
    resposta: 'Emagrecimento, no cadastro, é o objetivo perder peso: queimar gordura e definir, na descrição do produto. O treino ajuda o gasto e a manutenção de músculo. A perda de gordura continua dependendo da alimentação, e o AthletIA não passa dieta.',
    fatos: [
      'Perder peso é objetivo do cadastro, com a descrição de queimar gordura e definir.',
      'Não há meta de quilos no guia nem no preço do plano.',
      'Cardio não é o único conteúdo possível desse objetivo.',
    ],
    corpo: [
      'Treino de força permanece útil quando o objetivo é perder peso, para a perda não ser só “fazer esteira”. O tempo da sessão e os dias vêm do cadastro. Uma pessoa com 30 a 45 minutos não recebe uma maratona disfarçada de emagrecimento.',
      'Definir, na frase do produto, não é um protocolo de competição. É a descrição curta da opção. Qualquer número de percentual de gordura estaria fora dos fatos publicáveis.',
    ],
    foco: 'Quem quer emagrecer marca perder peso no AthletIA e entende que o app entrega treino, não cardápio.',
    faq: [
      { pergunta: 'Abdominal local queima a barriga?', resposta: 'Este guia não afirma perda localizada. Perder peso é um objetivo geral, sem zona prometida.' },
      { pergunta: 'Preciso suar para emagrecer?', resposta: 'Suor não é a medida. O objetivo no cadastro organiza o treino. A comida, que pesa nessa conta, não vem do aplicativo.' },
    ],
  },
]
