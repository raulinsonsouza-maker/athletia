import { PAGINAS } from './paginas'
import type { PaginaGuia } from './tipos'

export type Camada = { leitura: string[]; passos: string[]; erros: string[] }

function c(leitura: string[], passos: string[], erros: string[]): Camada {
  return { leitura, passos, erros }
}

const CAMADAS: Record<string, Camada> = {
  'athletia/o-que-e': c(
    ['O AthletIA entra na vida da pessoa no momento em que ela já decidiu treinar e ainda não tem a semana escrita. Não é uma rede social de treino, não é uma academia e não é um consultório. É a conta em que o plano nasce dos dados e o que foi feito fica registrado.', 'Quem chega esperando um professor ao lado, um cardápio ou uma data para “chegar lá” está no produto errado. Quem chega sem saber o que fazer na terça, com meia hora e um canto da sala, está no uso para o qual o cadastro foi feito.'],
    ['Abra a página oficial e escolha o período da assinatura, sem procurar um segundo site.', 'Preencha idade, objetivo, experiência, dias, duração e local com a semana que existe, não com a semana ideal.', 'Faça a primeira sessão inteira, mesmo curta, e registre.', 'Só então decida se o plano cabe. Ajuste a frequência se a primeira semana já mostrou que não cabe.'],
    ['Tratar o aplicativo como médico, nutricionista ou personal presencial.', 'Inventar seis dias no cadastro para “valer mais a pena”.', 'Julgar o produto por uma nota ou por um prazo que este guia não publica.'],
  ),
  'athletia/como-o-treino-e-montado': c(
    ['A montagem não é um texto genérico com o nome da pessoa no topo. Cada campo muda o ponto de partida: a faixa etária, o objetivo, o nível de hoje, quantas vezes a semana aguenta, quantos minutos a sessão tem e se o exercício acontece em casa, na academia ou nos dois.', 'O histórico entra depois, não antes. A primeira versão do plano só pode ser tão boa quanto o cadastro. Se a pessoa mente o nível, o plano nasce torto. O ajuste descrito nos Termos olha o que foi registrado, não uma promessa de evolução em semanas.'],
    ['Escolha um objetivo só: perder peso, ganhar massa ou ficar mais forte.', 'Marque a experiência de hoje, inclusive se o passado foi mais forte do que o presente.', 'Some os horários reais da semana antes de escolher 2, 3, 4, 5 ou 6.', 'Confira se o local do cadastro é o lugar em que a sessão vai acontecer.'],
    ['Marcar academia e treinar na sala, ou o contrário.', 'Esperar que o plano adivinhe lesão que não foi dita.', 'Trocar o treino inteiro no segundo dia porque a primeira sessão pareceu simples.'],
  ),
  'athletia/quanto-custa': c(
    ['O preço é a assinatura do aplicativo, não um pacote de resultado. Mensal, trimestral e semestral cobrem o mesmo tipo de treino. O que muda é quanto tempo está pago de uma vez e qual o valor equivalente por mês, já publicado no checkout.', 'Equipamento, mensalidade de academia e consulta com profissional não entram nessa conta. Se alguém somar esses gastos e disser que “é o preço do AthletIA”, está misturando notas diferentes.'],
    ['Compare os três totais: R$ 29,90, R$ 49,90 e R$ 89,90.', 'Se a dúvida é o menor equivalente mensal, olhe o semestral, a R$ 14,98 por mês.', 'Leia nos Termos que a renovação segue até o cancelamento nas configurações da conta.', 'Não pague por uma promessa de quilos. Esse número não está à venda.'],
    ['Procurar um quarto preço em anúncio antigo.', 'Achar que o plano mais longo entrega um treino diferente.', 'Cobrar resultado clínico do valor da assinatura.'],
  ),
  'athletia/comparar-planos': c(
    ['A comparação honesta é de calendário e de caixa. O mensal custa menos de uma vez e repete todo mês. O trimestral e o semestral adiantam um período e por isso o valor quebrado por mês fica menor. O cadastro de treino não ganha um campo extra no plano mais caro.', 'Quem ainda não sabe se vai cumprir duas semanas não precisa do período mais longo para “provar que leva a sério”. Levar a sério é fazer a sessão. O plano pode ser o mais curto enquanto a rotina não está firme.'],
    ['Decida o período pelo tempo em que você aceita a renovação, não pelo medo de escolher errado.', 'Lembre que cancelar, nos Termos, é nas configurações da conta.', 'Use o mesmo cadastro em qualquer plano. Não refaça uma persona diferente para cada preço.', 'Guarde o comprovante do valor que você viu na página oficial, não o de um recorte antigo.'],
    ['Escolher o semestral achando que ele acelera o corpo.', 'Ignorar o equivalente mensal e comparar só a palavra “economia”.', 'Tratar destaque de vitrine como um quarto produto.'],
  ),
  'athletia/o-que-o-cadastro-pergunta': c(
    ['O cadastro é o briefing do treino. Sem ele, personalizar vira slogan. As perguntas cobrem quem é a pessoa agora: a década da vida adulta, o objetivo, se está começando ou já treina, a agenda e o lugar. Também cabe dizer o que já fez desistir: falta de plano, falta de tempo, treino duro demais ou falta de motivação.', 'Responder “o que fica bonito” estraga o briefing. Avançado com dois horários livres produz um plano que não cabe, ou um plano curto demais para quem marcou seis dias de mentira. A segunda versão do treino não conserta um primeiro cadastro de fantasia com a velocidade que a pessoa imagina.'],
    ['Reserve dez minutos sem montar o treino ao mesmo tempo. Só responda.', 'Se estiver em dúvida entre dois níveis, fique no menor.', 'Escolha a duração que você termina, não a que impressiona.', 'Se treina nos dois lugares, marque misto em vez de apostar em um só.'],
    ['Pular a pergunta de dificuldade anterior porque “agora vai ser diferente”.', 'Marcar 50+ ou 18-29 no chute.', 'Achar que lesão não dita continua protegida pelo plano.'],
  ),
  'athletia/treino-para-casa': c(
    ['Casa, no cadastro, não é um modo inferior. É o cenário com equipamento básico ou nenhum. O plano tem que caber no chão, na cadeira estável e no tempo, sem pedir um aparelho que está na academia do bairro.', 'O resultado não muda de natureza porque a sala é pequena. Muda o jeito de progredir: repetição, alavanca e variação, em vez de anilha. Quem quer os dois mundos marca misto, não força a casa a imitar uma sala de musculação.'],
    ['Escolha um canto sem tapete que escorrega e sem o teto no caminho do braço.', 'Marque casa no cadastro antes da primeira sessão, não depois de ver um exercício impossível.', 'Comece pela faixa de tempo que a casa aguenta sem a família inteira em volta.', 'Registre o que foi possível fazer. Isso vira a referência da próxima vez.'],
    ['Copiar uma ficha de leg press para a sala.', 'Comprar uma estação inteira antes de cumprir duas semanas.', 'Desistir porque o suor foi menor do que o da academia.'],
  ),
  'athletia/treino-para-academia': c(
    ['Academia, no produto, significa acesso a equipamento completo. O valor do aplicativo é chegar lá com a sessão decidida: quais movimentos, em que ordem, dentro dos minutos marcados. A mensalidade da academia continua sendo outra conta.', 'Ter aparelho não organiza a ida. Muita gente paga o mês e repete o que está livre. O plano existe para a ida não depender do que sobrou na sala. Também não existe para testar o máximo no primeiro dia só porque a barra está ali.'],
    ['Marque academia só se você entra nesse espaço nas vezes que escolheu.', 'Leve a sessão no celular e cumpra a ordem, em vez de montar outra na hora.', 'Deixe o aquecimento dentro do relógio da sessão.', 'Anote a carga que saiu com forma. Não a carga que você quase fez.'],
    ['Reservar o aplicativo como se ele reservasse o horário da academia.', 'Fazer o treino de casa na academia e ignorar o aparelho de propósito, sem ter marcado misto.', 'Subir carga porque a sala está cheia e a pressa manda.'],
  ),
  'athletia/treino-misto': c(
    ['Misto é a semana real de quem vai à academia em alguns dias e completa o resto em casa. Um plano só de aparelho fura o dia da sala. Um plano só de peso corporal desperdiça o dia em que a anilha está disponível. O cadastro tem essa terceira via para os dois não brigarem.', 'A frequência marcada é da semana inteira, não “seis na academia mais quatro em casa”. Se são quatro idas no total, duas e duas, o cadastro diz quatro. Inventar o dobro cria um plano que a pessoa nunca abre.'],
    ['Conte as idas dos dois lugares antes de escolher o número.', 'Deixe claro, na prática, qual dia é casa e qual dia é academia. O cadastro guarda o modo, você guarda o calendário.', 'Não repita a mesma sessão pesada nos dois lugares no mesmo dia.', 'Se um dos lugares sumir por um mês, mude o local do cadastro em vez de fingir que o misto continua.'],
    ['Marcar misto e só treinar em um lugar.', 'Somar as frequências dos dois locais.', 'Usar o dia de casa para “compensar” o que faltou na academia com o dobro do volume.'],
  ),
  'athletia/para-iniciante': c(
    ['Iniciante, na frase do produto, é quem ainda sente dificuldade em movimentos simples. Não é um insulto e não é uma fase com data para acabar. O plano dessa pessoa precisa de poucos dias, sessão que pode ser de 30 a 45 minutos e exercícios que ela consegue repetir amanhã.', 'O risco de quem começa não é “treinar pouco”. É copiar a semana de quem já treina e concluir que o próprio corpo não serve. O cadastro deixa a semana pequena de propósito. Dor articular não faz parte do aprendizado. Os Termos pedem para parar.'],
    ['Marque iniciante mesmo que a vaidade peça intermediário.', 'Escolha duas ou três vezes, não seis.', 'Aprenda o caminho do movimento na primeira semana, sem caçar recorde.', 'Se doer de um jeito que não é só esforço, pare e procure quem olha você de verdade.'],
    ['Abrir um treino avançado “para render”.', 'Treinar até não conseguir sentar no dia seguinte e chamar isso de começo certo.', 'Esconder falta de equipamento marcando academia.'],
  ),
  'athletia/para-intermediario': c(
    ['Intermediário, no cadastro, é a pessoa que já tenta e ainda não segura a semana. O plano não precisa recomeçar do zero nem saltar para a rotina de quem vive na academia. Precisa de uma frequência que sobrevive a uma semana ruim.', 'Três ou quatro dias, com sessão de 45 a 60 minutos se esse for o tempo real, costumam organizar melhor do que uma divisão de seis dias escrita no domingo e abandonada na quarta. O histórico mostra se a tentativa virou hábito. Sem registro, a memória inventa constância.'],
    ['Olhe as últimas duas semanas, não o melhor mês do ano, antes de marcar a frequência.', 'Repita os mesmos movimentos o bastante para saber se ficaram fáceis.', 'Suba uma coisa de cada vez: repetição, pausa ou carga.', 'Se a semana furar, volte na próxima sessão marcada, sem treino punitivo.'],
    ['Trocar o treino toda segunda por tédio.', 'Marcar avançado porque já “sabe os nomes”.', 'Cobrar do espelho uma mudança que a comida, fora do app, também decide.'],
  ),
  'athletia/para-avancado': c(
    ['Avançado, na descrição do produto, é quem já está em boa forma e treina de verdade. A ferramenta organiza essa semana: mais dias se eles existem, sessão mais longa se ela existe, local onde a carga de fato está. Não vira comissão técnica porque o rótulo mudou.', 'Quem marca avançado e só tem dois dias de meia hora recebe um plano compatível com dois dias. O rótulo não cria horário. Quem marca avançado e treina seis vezes ainda precisa de folga. O teto do cadastro é seis, não sete, e dor continua sendo motivo para parar.'],
    ['Confirme se a descrição de avançado é o seu mês atual.', 'Escolha cinco ou seis só se a recuperação já acontece nessa rotina.', 'Mantenha um movimento estável por semanas antes de reinventar a ficha.', 'Use o histórico para ver carga e repetição, não para postar esforço.'],
    ['Testar uma repetição máxima logo na volta de uma pausa.', 'Encher os sete dias porque o app “aguenta”.', 'Achar que o plano substitui quem corrige a barra ao vivo.'],
  ),
  'athletia/como-comecar': c(
    ['Começar tem três passos visíveis: a página athletia.site, um dos três preços e o cadastro verdadeiro. Não há formulário secreto neste guia. Quem lê o guia e não abre a página continua só com o texto.', 'A idade dos Termos é 18 anos ou autorização de responsável. A renovação segue até o cancelamento nas configurações. A primeira sessão ainda pede o critério de parar se doer. Começar no aplicativo não é liberação médica.'],
    ['Escolha o plano pelo período, não pela pressa.', 'Crie a conta com dados que você reconhece.', 'Responda o cadastro de treino na mesma hora, enquanto a rotina está fresca.', 'Coloque a primeira sessão no calendário antes de fechar o celular.'],
    ['Assinar e deixar o cadastro para “quando der”.', 'Começar pela sessão mais longa para compensar o tempo parado.', 'Usar um link que não seja a página oficial e achar que o preço de lá é o fato do produto.'],
  ),
  'athletia/o-que-nao-faz': c(
    ['A lista do que o produto não faz protege quem está lendo. Não há dieta, diagnóstico, liberação para esforço, acompanhamento presencial, nota de loja nem quantidade de alunos neste guia. O que há é plano, ajuste conforme o progresso registrado, histórico e instrução de exercício, como os Termos descrevem.', 'Quem precisa de cardápio, de exame ou de alguém olhando o joelho precisa contratar isso em outro lugar. Usar o aplicativo no lugar dessas coisas é o uso que os Termos recusam quando falam em conta e risco.'],
    ['Leia a descrição do serviço nos Termos antes de cobrar uma função que não está lá.', 'Separe treino de comida na sua cabeça. Os dois pesam no corpo. Só um está no app.', 'Se a dúvida é clínica, pare o plano e fale com um profissional.', 'Ignore qualquer texto, inclusive anúncio, que prometa prazo ou nota.'],
    ['Pedir suplemento, exame ou percentual de gordura ao suporte como se fosse função.', 'Continuar com dor porque o plano “ainda não acabou”.', 'Comparar o app com uma academia física.'],
  ),
  'athletia/athletia-ou-planilha': c(
    ['A planilha é boa quando a pessoa já sabe escrever a própria semana e só precisa anotar a carga. Ela é ruim quando a pessoa cola a aba de outro corpo, outros dias e outro equipamento. O AthletIA existe para a semana sair do cadastro e o histórico ficar na conta, não numa célula esquecida.', 'Dá para usar os dois. Não dá para esperar que a planilha e o app contem a mesma história se você treina num e registra no outro. O ajuste descrito nos Termos olha o que está na conta.'],
    ['Se você não sabe por onde começar a grade, comece pelo cadastro, não por uma aba em branco.', 'Se você já tem uma planilha que cumpre, não jogue fora por moda. Compare se ela respeita seus dias reais.', 'Registre num lugar só.', 'Releia o preço da assinatura antes de tratar o app como planilha gratuita.'],
    ['Manter vinte abas e nenhum treino feito.', 'Achar que planilha grátis é sempre mais honesta. Grátis também copia a rotina dos outros.', 'Pagar o app e continuar seguindo a aba antiga sem abrir o plano.'],
  ),
  'objetivos/perder-peso': c(
    ['Perder peso é o objetivo do cadastro, não um contador de quilos. O treino ajuda o gasto e ajuda a não perder só músculo no processo. A comida continua mandando na maior parte da balança, e o aplicativo não escreve essa comida.', 'Uma sessão de força cabe nesse objetivo tanto quanto uma caminhada. Esteira infinita sem plano de força é um hábito, não a única forma de marcar “perder peso”. A sessão ainda tem que caber em 30 a 45 minutos se esse for o tempo marcado.'],
    ['Marque perder peso se a balança, e não o espelho de músculo, é a prioridade.', 'Mantenha força na semana, mesmo em casa.', 'Não peça ao app um cardápio. Ele não tem.', 'Avalie semanas cumpridas, não um prazo de quilos.'],
    ['Fazer só abdominal para “secar a barriga”.', 'Dobrar o cardio e abandonar o sono.', 'Trocar de objetivo toda semana conforme a balança de um dia.'],
  ),
  'objetivos/ganhar-massa': c(
    ['Ganhar massa pede o mesmo movimento de volta, um pouco mais difícil quando a forma permite, e energia para construir. O app organiza o treino desse objetivo. A energia, que é comida e sono, fica fora dele. Sem isso, a palavra hipertrofia não vira tecido.', 'Dois dias já são uma opção válida para quem não tem mais horário. Seis dias não são obrigatórios. O que não funciona é a ficha nova toda semana: o músculo não reconhece variedade infinita como progresso.'],
    ['Marque ganhar massa muscular, não força, se o desejo é volume e não só a carga.', 'Escolha uma frequência que você repete por um mês.', 'Progrida repetição ou carga no mesmo exercício.', 'Coma e durma fora do app, de propósito, porque o plano não faz isso.'],
    ['Treinar até falhar em todo exercício sendo iniciante.', 'Achar que casa “não gera músculo” e por isso não começar.', 'Cobrar centímetros numa data.'],
  ),
  'objetivos/ficar-mais-forte': c(
    ['Força, no cadastro, está separada de massa de propósito. Dá para querer levantar mais sem querer o mesmo visual de quem busca volume. O plano organiza essa intenção com os dias e o local. Não publica percentual de uma repetição máxima.', 'Quem começa não testa o teto. Aprende o movimento e só então adiciona dificuldade. Quem já é avançado ainda não transforma o app em banca de competição. Dor no teste máximo é um mau plano, e os Termos mandam parar.'],
    ['Marque ficar mais forte se a prioridade é o movimento, não o espelho.', 'Deixe recuperação entre as sessões pesadas do mesmo padrão.', 'Em casa, dificulte a alavanca antes de inventar um teste.', 'Na academia, anote a série que saiu limpa.'],
    ['Comparar a sua barra com a de um vídeo.', 'Pular o aquecimento porque “força é peso”.', 'Marcar seis dias de máximo.'],
  ),
  'objetivos/pouco-tempo': c(
    ['Pouco tempo é uma dificuldade real do cadastro, não uma desculpa a ser vencida com um treino de 75 minutos espremido. A ferramenta oferece 30 a 45 minutos e a partir de duas vezes por semana. O plano curto que acontece ganha do plano longo que fica no papel.', 'Meia hora não cabe vinte exercícios. Cabe poucos, feitos por inteiro, com descanso que ainda deixa forma. Quem enche a lista e corta o descanso chama isso de eficiência e só entrega repetição torta.'],
    ['Marque 30 a 45 minutos se é isso que o relógio tem.', 'Corte a lista até caber, em vez de acelerar a forma.', 'Coloque a sessão num horário fixo, pequeno.', 'Use casa nos dias em que o deslocamento comeria o treino.'],
    ['Marcar mais de 75 minutos por culpa.', 'Treinar os sete dias para compensar a sessão curta.', 'Achar que trinta minutos “não contam” e faltar.'],
  ),
  'objetivos/consistencia': c(
    ['Consistência é a semana possível repetida, não a semana perfeita. O cadastro já nomeia o que quebra isso: falta de plano, de tempo, de motivação, ou treino duro demais. O aplicativo ataca a primeira causa com a sessão escrita e o histórico. Não cura a motivação como se fosse um interruptor.', 'Uma falta não zera o mês. O retorno é a próxima sessão marcada, no tamanho normal. Dobrar para compensar é o jeito mais comum de transformar uma falta em duas.'],
    ['Escolha uma frequência que sobrevive a uma semana cheia de trabalho.', 'Deixe o treino decidido antes do horário, no app.', 'Registre mesmo a sessão curta.', 'Se faltar, não invente um castigo no dia seguinte.'],
    ['Recomeçar toda segunda com um plano novo.', 'Medir consistência pelo humor do dia.', 'Esconder falta não registrando.'],
  ),
  'objetivos/voltar-a-treinar': c(
    ['Voltar não é retomar a carga da memória. O corpo passou a pausa inteira sem aquele estímulo. O cadastro deve descrever hoje: nível menor se for o caso, dois ou três dias, sessão curta. A planilha antiga pode esperar duas ou três semanas.', 'Dor na volta não é “o corpo despertando” por definição. Pode ser excesso. Os Termos pedem interrupção. Quem tem dúvida clínica não usa o aplicativo como liberação para recomeçar.'],
    ['Marque a experiência de agora, não a de antes da pausa.', 'Comece em duas ou três vezes.', 'Use a primeira semana para reaprender o movimento.', 'Só progrida quando a sessão sair estável e sem dor.'],
    ['Abrir a ficha do auge no primeiro dia.', 'Treinar em dias seguidos para “recuperar o tempo perdido”.', 'Ignorar tontura ou dor no peito porque o plano ainda tem série.'],
  ),
  'objetivos/treino-em-casa': c(
    ['Casa dá resultado quando a sessão se repete e fica um pouco mais difícil com o que existe ali, inclusive o peso do corpo. Não dá resultado como frase mágica. Também não é automaticamente pior do que academia. É outro conjunto de ferramentas.', 'A OMS fala em fortalecimento para adultos sem exigir uma sala comercial. Isso não é propaganda do app. É o fato de que força cabe numa sala. O limite é espaço seguro, não um carimbo de validade.'],
    ['Marque o local casa antes de copiar vídeo de aparelho.', 'Defina progressão sem anilha: mais repetições limpas ou variação mais difícil.', 'Proteja o chão e o vizinho. Tire o salto se o prédio não aguenta.', 'Se um dia na semana tiver academia de verdade, mude para misto.'],
    ['Declarar que sem halter não é treino e não começar.', 'Fazer só abdominal no sofá e chamar de plano.', 'Comparar o suor da sala com o da esteira como prova de resultado.'],
  ),
  'objetivos/academia-vale-a-pena': c(
    ['A academia vale a pena quando a pessoa chega e usa o aparelho com um plano. Não vale como mensalidade parada nem como identidade. O AthletIA não substitui essa mensalidade e não abre a catraca. Ele diz o que fazer depois que a catraca abriu.', 'Se o deslocamento faz você faltar, o local casa ou o misto é mais honesto do que insistir numa sala longe. Frequência cumprida ganha de equipamento não visitado. Não há, neste guia, um número de idas que “justifique” a mensalidade.'],
    ['Separe o preço do app do preço da academia. São duas decisões.', 'Marque academia no cadastro se for o lugar principal.', 'Chegue com a sessão pronta.', 'Se faltar mais do que vai, reveja o local em vez de culpar o plano.'],
    ['Pagar a academia e improvisar toda ida.', 'Achar que o app inclui o plano da academia.', 'Ir cinco vezes marcadas e fazer outra coisa por vergonha de seguir a lista.'],
  ),
  'perfis/iniciante': c(
    ['O treino de iniciante é curto, repetido e ensinável. Corpo inteiro em dois ou três dias evita a divisão em que a perna só aparece de novo dali a duas semanas se uma ida faltar. A prioridade é o caminho do movimento, não a falha muscular.', 'Não existe data em que o iniciante “vira” avançado. O nível muda quando a descrição do cadastro muda de verdade. Até lá, copiar série até o chão é pressa. O preço para começar continua sendo o plano publicado, a partir do mensal.'],
    ['Marque iniciante e a menor frequência que você vai cumprir.', 'Escolha casa se a academia ainda intimida. Isso é permitido.', 'Conte repetições com controle.', 'Pare no desconforto articular.'],
    ['Treinar até não conseguir levantar do sofá e achar que assim se começa.', 'Esconder o nível para o plano “pegar pesado”.', 'Pular o cadastro e seguir um vídeo aleatório no mesmo dia em que assinou.'],
  ),
  'perfis/intermediario': c(
    ['O intermediário já conhece o esforço e perde a semana. O plano útil é chato no bom sentido: mesmos dias, mesmos movimentos, progresso pequeno. Variar por tédio é o que impede de saber se a carga subiu.', 'Casa continua válida nesse nível. Academia também. O local não é promoção de faixa. Três vezes descritas no produto como progressão constante são uma âncora boa para quem ainda falta.'],
    ['Olhe o calendário das últimas semanas antes de marcar cinco ou seis.', 'Fixe três ou quatro horários com nome de dia.', 'Repita o bastante para anotar diferença.', 'Use o histórico da conta como juiz, não a memória.'],
    ['Subir para avançado para se sentir sério.', 'Trocar o objetivo no meio do mês porque a balança oscilou um dia.', 'Fazer o treino duro demais de novo e chamar de disciplina.'],
  ),
  'perfis/avancado': c(
    ['Quem já treina trava por monotonia sem critério ou por excesso sem folga. O app não mede laboratório de performance. Organiza a semana que a pessoa diz que vive, até seis vezes e até mais de 75 minutos, se isso for verdade.', 'Mais volume só ajuda com recuperação. Seis dias longos com sono ruim não são “nível avançado”. São acúmulo. A folga continua existindo porque sete vezes não é opção.'],
    ['Marque avançado só se a frase do produto descreve você agora.', 'Mantenha um dia fora da sessão pesada.', 'Progrida o movimento que já está estável, não dez movimentos novos.', 'Se há dor antiga, leve isso a um profissional. O app não trata.'],
    ['Encher a semana para justificar o rótulo.', 'Ignorar o local e pedir um aparelho que você não tem.', 'Usar o plano como palpite de marca pessoal.'],
  ),
  'perfis/mulher': c(
    ['O cadastro feminino tem os três objetivos: perder peso, ganhar massa e ficar mais forte. Não há um modo “leve” obrigatório. A semana muda pela agenda, pela idade e pelo local, não por um treino reduzido só porque o cadastro é feminino.', 'Gestação, pós-parto e dor pélvica não são um modo do produto. Esses casos pedem profissional. O guia não inventa uma rotina para eles. Fora disso, ganhar massa é uma opção legítima, e perder peso não é a única porta de entrada.'],
    ['Escolha o objetivo pelo que você quer, não pelo que disseram que mulher “deve” querer.', 'Marque a frequência que cabe no trabalho e em casa.', 'Não aceite um plano de seis dias se você tem dois horários.', 'Se houver gestação ou dor específica, saia do app e fale com quem cuida disso.'],
    ['Evitar força com medo de “ficar grande” sem nem ter marcado o objetivo.', 'Copiar treino de rede social com outro equipamento.', 'Pedir ao app um protocolo de gestação.'],
  ),
  'perfis/homem': c(
    ['O cadastro masculino também tem perder peso. Não é um objetivo escondido. Ganhar massa e ficar mais forte estão ao lado, separados. A escolha muda o plano. A agenda muda ainda mais: três noites reais ganham de seis noites escritas.', 'Força não exige academia, e massa não exige treinar todo dia. O teto é seis. Dieta não vem junto em nenhum dos três objetivos. Quem soma comida ao treino está fazendo isso por conta própria, fora do aplicativo.'],
    ['Marque o objetivo verdadeiro, inclusive perder peso se for o caso.', 'Não marque mais de 75 minutos se a sessão real é meia hora.', 'Separe força de massa se você só quer um deles.', 'Registre a série em vez de comparar com outra pessoa da academia.'],
    ['Achar que homem precisa de seis dias para o plano “valer”.', 'Pular casa porque parece pouco.', 'Pedir gramas de proteína ao app.'],
  ),
  'perfis/de-18-a-29': c(
    ['De 18 a 29 é uma faixa do cadastro, não um estilo de treino. A idade mínima dos Termos é 18 ou responsável. Dentro da faixa, a semana ainda depende de estudo, trabalho e sono. Seis dias não são o padrão de jovem. São o teto, para quem vive isso.', 'Marcar avançado aos 18 só cabe se a descrição for verdadeira: boa forma e treino de verdade. A idade não promove o nível. O plano continua podendo ser dois dias e casa.'],
    ['Marque 18-29 e depois a experiência real.', 'Não use a idade como licença para pular aquecimento.', 'Escolha horário que sobrevive à semana de aula ou trabalho.', 'Se tem menos de 18 anos, não use o serviço sem responsável.'],
    ['Copiar a rotina de atleta porque “o corpo aguenta”.', 'Treinar todo dia e dormir quatro horas.', 'Ignorar dor porque é jovem.'],
  ),
  'perfis/de-30-a-39': c(
    ['Dos 30 aos 39 a ferramenta não troca de método por aniversário. Troca se a agenda apertou. Falta de tempo está no cadastro porque essa década costuma ter menos hora livre, não porque o músculo “venceu”. A sessão de 30 a 45 minutos existe para isso.', 'Ganhar massa continua sendo um objetivo disponível. Não há prazo. Dúvida sobre pressão, fôlego ou dor nova não se resolve marcando a faixa etária. Resolve com profissional.'],
    ['Marque 30-39 e a duração que cabe depois do trabalho.', 'Prefira três sessões feitas a seis imaginárias.', 'Mantenha força na semana mesmo se o objetivo for perder peso.', 'Não resgate a ficha dos 22 anos na primeira ida.'],
    ['Marcar mais de 75 minutos por nostalgia.', 'Tratar cansaço e dor no peito como preguiça.', 'Achar que o app compensa o sono.'],
  ),
  'perfis/de-40-a-49': c(
    ['Dos 40 aos 49 o cadastro pede a faixa e o resto da verdade: nível de hoje, não o de uma década atrás. Aquecimento curto e progressão lenta cabem melhor do que a carga antiga no primeiro dia. A sessão pode ser de 30 a 45 minutos sem isso ser um rebaixamento.', 'A OMS recomenda fortalecimento em dois ou mais dias para adultos. Isso não é meta comercial. É uma referência pública, nas fontes da página. Dois dias no AthletIA são uma opção real, não um consolo.'],
    ['Marque a experiência de hoje.', 'Comece abaixo da memória se houve pausa.', 'Inclua um começo leve dentro do relógio.', 'Se há dúvida clínica, resolva antes de aumentar a semana.'],
    ['Provar para si mesmo que “ainda dá” com a carga antiga.', 'Pular aquecimento para caber mais série.', 'Ler a faixa 40-49 como proibição de força.'],
  ),
  'perfis/cinquenta-ou-mais': c(
    ['50+ é a faixa mais alta do cadastro, não um modo de caminhada obrigatória. Força continua possível, com dose baixa no começo, dois ou três dias, sessão curta e local seguro. O app não avalia remédio, equilíbrio nem doença. Isso fica com o profissional de saúde.', 'Queda, tontura e dor no peito encerram a sessão. Não são “parte do treino”. Os Termos já colocam o uso por conta e risco e pedem orientação quando há dúvida. O plano não discute com esse sintoma.'],
    ['Marque 50+ e uma frequência baixa se está começando ou voltando.', 'Escolha casa só se o chão é seguro.', 'Progrida devagar, uma variável por vez.', 'Pare e procure ajuda diante de tontura, queda ou dor no peito.'],
    ['Aceitar um treino de seis dias para “não ficar para trás”.', 'Usar o app como liberação cardiológica.', 'Evitar força por princípio, sem orientação, se o objetivo era justamente manter músculo.'],
  ),
  'perfis/sem-plano': c(
    ['Sem plano, a ida vira passeio entre aparelhos ou um vídeo diferente todo dia. “Não tinha um plano claro” está no cadastro porque é uma causa comum de parar. O serviço, nos Termos, inclui criar o plano com os dados. Isso só acontece se os dados existem.', 'Plano claro não é plano eterno. O ajuste conforme o progresso também está descrito. Não há uma data em que a falta de plano “se cura”. Há uma sessão escrita para a próxima ida, e outra depois, no mesmo lugar: a conta.'],
    ['Pare de colecionar PDF e responda o cadastro.', 'Cumpra uma semana do plano antes de trocar.', 'Anote o que fez.', 'Se a lista não cabe no tempo, encurte o tempo no cadastro, não ignore a lista.'],
    ['Assinar e continuar improvisando.', 'Ter três planos abertos ao mesmo tempo.', 'Achar que uma lista da internet, de outra rotina, já é personalização.'],
  ),
  'perfis/falta-de-tempo': c(
    ['Falta de tempo, no produto, não se resolve com um discurso de acordar mais cedo. Resolve com 30 a 45 minutos e a partir de duas vezes, marcados de verdade. O deslocamento também é tempo: casa e misto existem para o caminho não comer a sessão.', 'Dois treinos de meia hora não são uma garantia de corpo. São a semana que cabe. Quem recusa essa semana por ela ser pequena fica com zero, que é menor. O app não exige um horário do dia. Exige que a duração marcada seja a duração real.'],
    ['Marque a faixa curta.', 'Risque dois horários fixos na semana.', 'Treine em casa no dia em que a academia fica longe.', 'Termine a sessão. Não encaixe um treino longo “rapidinho”.'],
    ['Marcar 75 minutos sabendo que vai falhar.', 'Usar falta de tempo como identidade e não escolher nem a sessão curta.', 'Compensar no domingo com o dobro.'],
  ),
  'treino/quantos-dias-por-semana': c(
    ['O número de dias não é um concurso. A OMS fala em fortalecimento em dois ou mais dias, além do aeróbico da semana. O cadastro oferece de dois a seis. A resposta certa é a interseção: o que o corpo aguenta e o que a agenda repete.', 'Marcar seis e fazer dois ensina a pessoa a se achar fraca. Marcar dois e fazer dois ensina o contrário. O plano não melhora no papel. Melhora na sessão que existe. Sete vezes nem está no cadastro.'],
    ['Conte horários livres antes de abrir o app.', 'Escolha 2, 3, 4, 5 ou 6 com esse número na mão.', 'Deixe pelo menos um dia sem a sessão pesada.', 'Se por duas semanas o número foi mentira, mude o cadastro.'],
    ['Subir a frequência todo mês por ansiedade.', 'Copiar a semana de outra pessoa.', 'Tratar o dia de folga como fracasso.'],
  ),
  'treino/duas-vezes-por-semana': c(
    ['Duas vezes é a opção mais baixa e a descrição do produto liga isso a iniciante ou a pouco tempo. Não é um selo de treino fraco. É a semana mínima honesta. Em dois dias, cada sessão precisa cobrir os movimentos principais, senão um grupo some.', 'Quem só pode ir duas vezes e marca cinco cria três faltas semanais. O plano de dois dias, cumprido, é maior do que isso. Massa e força podem ser o objetivo mesmo nessa frequência. O quanto muda não tem número aqui.'],
    ['Marque 2 se é isso que vai acontecer.', 'Faça corpo inteiro nas duas idas, não “peito” e “costas” com uma semana entre elas se você falta fácil.', 'Mantenha as duas sessões curtas o bastante para não furar.', 'Não invente um terceiro dia punitivo se falhou uma.'],
    ['Achar que dois dias não autorizam ganhar massa e por isso não treinar.', 'Dividir músculo demais com tão pouca ida.', 'Esticar cada sessão até passar do tempo marcado.'],
  ),
  'treino/tres-vezes-por-semana': c(
    ['Três vezes é a frequência que o produto descreve como progressão constante. Cabe espaçar, por exemplo segunda, quarta e sexta, para não empilhar cansaço. Não é uma lei dos dias da semana. É um jeito de deixar intervalo.', 'Três sessões de 45 a 60 minutos, se esse for o tempo, já organizam força e ainda deixam vida fora do treino. Iniciante pode marcar três se for cumprir. Se não for, dois continuam disponíveis. Suficiente não significa resultado máximo, porque esse máximo não está à venda.'],
    ['Escolha três horários que não sejam três dias seguidos se você ainda recupera mal.', 'Repita a mesma estrutura por algumas semanas.', 'Inclua o descanso entre séries no relógio.', 'Registre as três. Se só duas acontecem, o cadastro deveria dizer duas.'],
    ['Fazer segunda, terça e quarta e sumir inchado no resto da semana.', 'Encher cada dia com divisão de atleta.', 'Trocar os três treinos toda semana.'],
  ),
  'treino/quatro-vezes-por-semana': c(
    ['Quatro vezes só são melhores se as quatro acontecem. A descrição do produto fala em mais estímulo. Este guia não transforma isso em semanas de resultado. Quatro no papel e duas na vida perdem para três cumpridas.', 'Com quatro dias dá para separar um pouco os padrões, desde que a sessão caiba. Quarenta e cinco minutos não carregam a mesma lista de setenta e cinco. Recuperação ainda existe. Quatro não é sete, e dormir mal anula o dia extra.'],
    ['Marque 4 só com quatro horários nomeados.', 'Combine a divisão com esse número, não o contrário.', 'Deixe a sessão no tamanho real.', 'Se uma semana sair com duas idas, não “compense” com o dobro. Reveja se quatro é verdade.'],
    ['Copiar uma divisão de cinco dias e enfiar em quatro.', 'Achar que o quarto dia é obrigatório para hipertrofia.', 'Esticar a pausa até a hora acabar e cortar o último exercício pela metade, torto.'],
  ),
  'treino/cinco-vezes-por-semana': c(
    ['Cinco vezes não faz mal pelo número. Faz mal se não há recuperação ou se a pessoa copia volume de atleta. A própria descrição do cadastro fala em gente experiente. Iniciante tem duas e três vezes como caminho mais estável.', 'Cinco sessões de mais de 75 minutos são uma vida de treino, não um padrão. Cinco de 45 a 60 já enchem a semana. O quinto dia não precisa ser corrida. Pode ser força mais curta. Cardio pode morar fora da sessão se o relógio não aguenta os dois.'],
    ['Confirme experiência e sono antes de marcar 5.', 'Encurte a sessão se as cinco não cabem longas.', 'Mantenha um dia realmente leve ou vazio.', 'Pare se a dor deixar de ser esforço e virar articulação.'],
    ['Iniciante marcar cinco para acelerar.', 'Fazer as cinco iguais e máximas.', 'Tratar gripe com treino para não “perder a sequência”.'],
  ),
  'treino/seis-vezes-por-semana': c(
    ['Seis é o teto, descrito para quem é dedicado. Não é a meta do produto. A maior parte das pessoas treina melhor com menos, porque uma gripe ou um plantão não destroem a identidade da semana. Sete nem existe como opção.', 'Quem marca seis precisa de sessão compatível, não de um treino longo em todos eles. O dia que sobra fora do plano não é desperdício. É o intervalo que o cadastro ainda deixa. Mais dias não significam o dobro do resultado de três. Essa conta não está publicada.'],
    ['Marque 6 só se essa já é a sua vida, não o seu desejo.', 'Encurte pelo menos parte das sessões.', 'Não transforme o sétimo dia em treino escondido de força máxima.', 'Se falhar duas vezes, desça a frequência em vez de carregar culpa.'],
    ['Usar seis dias como prova de seriedade.', 'Ignorar sono porque a frequência está alta.', 'Voltar de pausa já no teto.'],
  ),
  'treino/duracao-da-sessao': c(
    ['A duração certa é a que termina. O cadastro oferece quatro faixas, de 30 a 45 minutos até mais de 75. A faixa de 45 a 60 é descrita como duração de treino completo. Isso não obriga uma hora. Obriga honestidade.', 'Aquecimento, série e pausa moram dentro do relógio. Uma hora marcada não é uma hora só de trabalho. Quem estoura o tempo toda sessão marcou a faixa errada ou a lista errada. Treino longo demais está no cadastro como motivo de abandono por uma razão.'],
    ['Olhe o relógio de uma sessão real, não o relógio ideal.', 'Marque essa faixa.', 'Corte exercício até a sessão acabar no horário, com forma.', 'Não conte deslocamento como treino. Se o caminho come a hora, pense em casa ou misto.'],
    ['Marcar mais de 75 minutos e sair no meio.', 'Tirar o aquecimento para “ganhar” série.', 'Alongar a pausa no celular até não sobrar treino.'],
  ),
  'treino/treino-de-30-minutos': c(
    ['Trinta a quarenta e cinco minutos é a faixa de quem tem pouco tempo, na frase do produto. Funciona como sessão que cabe, com poucos movimentos completos. Não funciona como treino de academia inteira acelerado.', 'Suor não é a medida desses trinta minutos. Esforço com forma é. Dá para fazer em casa, sem equipamento. Não dá para prometer emagrecimento por causa do relógio. A comida, que pesa nisso, não está no app. E a frequência continua no máximo em seis, não em “todo dia para compensar”.'],
    ['Marque a faixa curta.', 'Escolha dois ou três movimentos, não doze.', 'Deixe pausa suficiente para a série seguinte sair limpa.', 'Repita essa meia hora nos dias marcados, em vez de uma sessão heróica no sábado.'],
    ['Encaixar vinte exercícios em meia hora.', 'Desprezar a sessão porque não doeu a semana inteira.', 'Fazer meia hora máxima nos sete dias.'],
  ),
  'treino/treinar-todos-os-dias': c(
    ['Treinar os sete dias de força é o jeito rápido de não recuperar e parar. O cadastro para em seis. Caminhar no dia livre não é errar. É outra coisa, e o app não policia a caminhada. O que ele não pede é máximo diário.', 'Quem falta e dobra no dia seguinte transforma um buraco em treino duro demais, que é justamente uma das dificuldades do cadastro. A volta é a sessão normal. A OMS separa aeróbico ao longo da semana e força em dois ou mais dias. Não descreve um ranking de quem não folga.'],
    ['Escolha no máximo 6 e cumpra.', 'Deixe atividade leve, se quiser, fora da sessão pesada.', 'Não dobre a sessão depois de uma falta.', 'Se precisa de todos os dias para se sentir no controle, encurte a sessão em vez de apagar a folga.'],
    ['Culpa no dia sem treino.', 'Máximo diário com sono ruim.', 'Chamar caminhada de fracasso do plano de força.'],
  ),
  'treino/dia-de-descanso': c(
    ['O dia de descanso é a ausência da sessão pesada, não uma ordem de ficar imóvel. Quem marca duas vezes descansa cinco dias dessa sessão. Quem marca seis ainda deixa um. Esse desenho já está na frequência. Não é um prêmio que se conquista.', 'Um dia sem treino não é o tema de “perder músculo” que este guia vai numerar. Sumir por semanas e voltar no máximo, isso sim, é o problema da volta. Alongar leve na folga pode. Dor persistente na folga não se resolve com mais uma série. Procure profissional.'],
    ['Olhe a frequência e aceite os dias que ficaram de fora.', 'Durma. O app não monitora sono, mas o corpo usa a folga para isso.', 'Não marque um treino extra só porque está ansioso.', 'Se a folga virou semana inteira, volte na sessão normal, menor se doer.'],
    ['Treinar na folga para não “perder ganho”.', 'Passar o dia inteiro sem se mover e achar que descanso é isso obrigatoriamente.', 'Tratar dor que não passa como preguiça.'],
  ),
  'treino/descanso-entre-series': c(
    ['Não há um segundo oficial de pausa no AthletIA. Força pede ar e forma para repetir o esforço. Circuito pede menos pausa e também menos carga de ego. Os objetivos do cadastro não compartilham o mesmo ritmo, e a sessão curta não aguenta descanso de vários minutos em muitos exercícios.', 'Se a forma cai, a pausa estava curta. Se a hora acaba no celular, a pausa comeu o treino. Ajuste o número de exercícios, não a segurança. Este guia não usa a pausa como truque de emagrecimento. O app não passa essa estratégia.'],
    ['Respire até conseguir a próxima série com o mesmo caminho do movimento.', 'Em sessão de 30 a 45 minutos, reduza exercícios antes de zerar a pausa.', 'Não converse a pausa inteira a ponto de esquecer a série.', 'Não corte a pausa para suar mais e chamar isso de resultado.'],
    ['Descanso zero com a técnica caindo.', 'Descanso de cinco minutos em treino de meia hora, doze vezes.', 'Achar que pausa curta emagrece por si.'],
  ),
  'treino/corpo-inteiro-ou-divisao': c(
    ['Corpo inteiro combina com duas ou três idas, porque cada dia cobre os padrões e uma falta não apaga um grupo por quinze dias. Divisão combina com quatro, cinco ou seis, quando há idas suficientes para cada bloco voltar logo. A frequência do cadastro decide. A moda não decide.', 'Sessão curta não comporta uma divisão longa de um músculo com vinte exercícios. Quem tem meia hora e insiste em “só peito” faz pouco e ainda deixa o resto da semana sem planilha real. O app não publica uma grade única. Publica a obrigação de combinar a grade com os dias.'],
    ['Se marcou 2 ou 3, monte corpo inteiro.', 'Se marcou 4 ou mais e cumpre, aí separe os padrões.', 'Não divida “perna só na outra semana” se você falta.', 'Reveja a divisão quando mudar a frequência no cadastro.'],
    ['Iniciante com divisão de seis músculos e duas idas.', 'Copiar a divisão de um avançado com outra agenda.', 'Trocar de método toda semana e não saber o que progrediu.'],
  ),
  'treino/musculacao-e-cardio': c(
    ['Força e cardio fazem trabalhos diferentes. A OMS descreve os dois para adultos: aeróbico na semana e fortalecimento em dois ou mais dias. Um não cancela o outro. O app organiza o treino. Não é um relógio de esteira obrigatório nem uma prova de corrida.', 'Se a sessão é curta, a força entra nela e a caminhada pode ficar no resto do dia, se a pessoa quiser. Enfiar os dois sem relógio estoura a duração marcada. Para quem quer perder peso, largar a força e viver na esteira não é o único plano, e a dieta continua fora do aplicativo.'],
    ['Decida o que é prioridade na sessão. Se é força, comece por ela.', 'Deixe o cardio caber no tempo ou fora dela, sem culpa escrita no plano.', 'Não use a esteira como desculpa para não marcar perder peso ou massa com clareza.', 'Não prometa à esteira um número de quilos.'],
    ['Uma hora de esteira e zero força por medo de “ficar grande”.', 'Cardio em jejum como estratégia que o app não tem.', 'Fazer os dois até passar do horário e cortar a forma.'],
  ),
  'treino/como-progredir': c(
    ['Progredir é dificultar uma sessão que já sai estável: mais uma repetição limpa, um pouco mais de carga, ou uma variação mais exigente. Não é trocar a ficha. Os Termos falam em ajuste conforme o progresso registrado. Sem registro, o ajuste vira achismo. Não há percentual semanal publicado.', 'Em casa, sem anilha, a progressão existe e é mais discreta. Negar isso é negar o local casa. Dor não é o sinal para subir. É o sinal para parar. Quem volta de pausa não progride na primeira ida. Reaprende.'],
    ['Repita o mesmo movimento até a forma estar chata de tão estável.', 'Anote a série na conta.', 'Mude uma variável só.', 'Se doer, não chame de progresso.'],
    ['Subir tudo toda semana.', 'Trocar o exercício no dia em que ia aumentar a repetição.', 'Chutar a carga de memória.'],
  ),
  'treino/por-que-nao-vejo-resultado': c(
    ['Na maior parte das vezes a semana feita não é a semana planejada, o esforço não anda, ou a expectativa tem uma data que ninguém pode assinar. O cadastro já lista as causas de parar antes de qualquer mudança visível: sem plano, duro demais, sem tempo, sem motivação.', 'O espelho também depende de comida e sono, que o app não controla. Atribuir um número de quilos só ao treino mistura duas contas. O histórico serve para a comparação justa: o que foi registrado, não o que a memória chamou de “pesado”.'],
    ['Compare o cadastro com as sessões registradas.', 'Se os dias não batem, corrija a frequência.', 'Pare de trocar o treino toda semana.', 'Se há suspeita de saúde, saia do app e investigue com profissional.'],
    ['Culpar o plano na segunda semana.', 'Não registrar e achar que treinou muito.', 'Pedir uma data de virada.'],
  ),
  'treino/quanto-tempo-para-ver-resultado': c(
    ['Qualquer número de semanas seria invenção. Uma sessão não muda o corpo. Um mês de faltas também não é “um mês de treino”. Força percebida num movimento pode aparecer antes do espelho, porque a pessoa aprendeu o gesto. Isso não é medida de cintura.', 'Os planos vendem assinatura, não transformação com data. O semestral não é um prazo de corpo. É um período de cobrança. O uso do tempo é cumprir a frequência escolhida por tempo bastante para existir histórico, sem cobrar o espelho na segunda semana.'],
    ['Risque do vocabulário o prazo que você viu em anúncio.', 'Cumpra a frequência marcada por tempo suficiente para o histórico existir.', 'Separe “aprendi o movimento” de “mudei a medida”.', 'Não troque de plano achando que o mais longo acelera o tecido.'],
    ['Abandonar no dia 30 porque alguém prometeu 30 dias.', 'Comparar o semestral com um tratamento.', 'Pedir ao suporte uma data.'],
  ),
  'treino/aquecimento': c(
    ['Aquecer é chegar na primeira série de trabalho com controle. Duas passagens leves do próprio movimento resolvem na maior parte das sessões de força. Esteira de vinte minutos, numa sessão de trinta, come o treino e não prepara o agachamento.', 'Quem tem 60 a 75 minutos pode separar um pouco mais o começo. Quem tem meia hora reduz a lista e mantém o começo leve. Não pula os dois. Dor durante o aquecimento cancela o resto. Alongar até doer não é aquecimento. Lesão não se trata ali.'],
    ['Faça o primeiro exercício leve, duas vezes, antes da série de trabalho.', 'Inclua esses minutos na duração marcada.', 'Tire a esteira longa se ela não cabe.', 'Pare se o aquecimento já dói.'],
    ['Puxar a carga máxima no primeiro movimento.', 'Gastar a sessão inteira “aquecendo” no celular.', 'Achar que aquecimento evita toda lesão.'],
  ),
  'treino/treino-duro-demais': c(
    ['Duro demais é lista que não termina, carga que quebra a forma, ou dias demais. A frase está no cadastro porque esse excesso faz a pessoa parar. A correção é dose menor: menos exercícios, menos dias ou menos minutos. Não é trocar de objetivo nem aguentar no orgulho.', 'Há dureza que é lesão. Isso não se ajusta reduzindo uma série. A pessoa para e procura quem examina. Os Termos já pedem isso diante de dor. Treino que deixa a pessoa incapaz de voltar na frequência que ela mesma marcou passou do ponto, mesmo sem diagnóstico.'],
    ['Se você não termina, corte a lista pela metade e termine.', 'Atualize o cadastro para a dose que cabe.', 'Mantenha a forma na série que sobrou.', 'Se a dor não é esforço, pare de procurar a série certa e procure um profissional.'],
    ['Aumentar a dureza porque a anterior já era demais.', 'Chamar sofrimento de resultado.', 'Esconder do cadastro que a sessão é longa demais.'],
  ),
  'treino/falta-de-motivacao': c(
    ['Motivação oscila. Plano não. O cadastro lista falta de motivação como dificuldade de manter a sequência. O app tira a decisão da hora em que a vontade some: a sessão já está escrita. A pessoa ainda precisa aparecer. Nenhum serviço faz o movimento no lugar dela.', 'Música e pré-treino não são funções do produto. Se a falta de ânimo vem com tristeza que não passa, isso é saúde, não série. O guia não trata e o app não é terapia. Faltar um dia é comum. A volta é a próxima sessão, sem punição.'],
    ['Deixe a sessão curta o bastante para não negociar com a vontade.', 'Abra o plano antes de decidir se “está a fim”.', 'Registre a ida pequena.', 'Se o desânimo é persistente e fundo, procure ajuda de saúde, não uma ficha nova.'],
    ['Esperar vontade para escolher o treino na academia.', 'Montar um plano punitivo para se obrigar.', 'Achar que o app deve motivar como rede social.'],
  ),
  'treino/serie-e-repeticao': c(
    ['Série é o bloco. Repetição é uma ida e volta com controle. “3 de 10” é um exemplo de linguagem, não a lei do AthletIA. O número cabe no tempo marcado e no nível. Oito repetições limpas ganham de doze pela metade.', 'Iniciante não busca a série que impede de sentar no dia seguinte. Busca a série que permite voltar na frequência escolhida. Quando a última repetição fica fácil por mais de uma sessão, aí se dificulta. Antes disso, repetir com forma melhor já é avanço, sobretudo sem equipamento.'],
    ['Conte só a repetição completa.', 'Pare a série quando a forma cair, mesmo antes do número.', 'Deixe a pausa existir entre as séries.', 'Anote o que foi feito de verdade, não o número que estava escrito.'],
    ['Usar 3 de 10 em todo exercício por superstição.', 'Quicar o movimento para inflar a conta.', 'Ir até a falha em tudo no primeiro mês.'],
  ),
  'treino/o-que-e-hipertrofia': c(
    ['Hipertrofia é o músculo aumentar com força repetida, recuperação e comida. No app o nome é ganhar massa muscular, nos dois cadastros. Não é treinar todo dia nem sentir dor extrema. É tensão suficiente nas vezes que a pessoa tem, com sono. A comida não vem no plano.', 'Casa serve, com outra progressão. Academia serve, com anilha. Nenhum dos dois publica centímetros nem prazo. Mulher que marca esse objetivo não recebe um aviso de que “vai ficar igual fisiculturista”. O quanto muda não é um fato deste guia.'],
    ['Marque ganhar massa, não força, se é volume que você quer.', 'Escolha uma frequência que volta toda semana.', 'Coma e durma fora do app.', 'Não cobre uma data do espelho.'],
    ['Trocar hipertrofia e força como se fossem o mesmo botão.', 'Achar que só a academia “conta”.', 'Prometer a si mesmo um tamanho de braço.'],
  ),
  'treino/emagrecimento-no-treino': c(
    ['Emagrecimento, aqui, é o objetivo perder peso: a descrição do produto fala em queimar gordura e definir. Definir não é um percentual publicado. O treino participa. A comida manda mais na balança e não está no aplicativo. Suor não é a medida. Abdominal não seca uma zona.', 'Força continua útil para a perda não ser só esteira. A sessão ainda respeita os minutos marcados. Uma pessoa com meia hora não recebe uma maratona disfarçada. O plano semestral não emagrece mais. Ele só cobre mais meses de assinatura.'],
    ['Marque perder peso se é esse o objetivo, e mantenha força na semana.', 'Não peça zona, quilos ou calorias ao app.', 'Use o tempo real da sessão.', 'Julgue semanas cumpridas, não o suor de um dia.'],
    ['Abdominal local como estratégia.', 'Jejum e esteira como função do produto.', 'Trocar de plano achando que o preço muda a gordura.'],
  ),
  'duvidas/substitui-o-personal': c(
    ['O personal vê o joelho, a barra e a careta. O app não vê. Ele escreve a semana e guarda o histórico. São trabalhos diferentes e podem coexistir. O preço do mensal, R$ 29,90, não é o preço de uma sessão presencial. Comparar os dois como se fossem a mesma nota é o que deixa a expectativa torta.', 'Os Termos pedem que a pessoa avalie a própria condição e busque orientação quando há dúvida. Essa frase existe porque o produto recusa o papel de profissional ao lado. Quem já tem personal pode usar o app como plano nos dias em que o profissional não está. Quem não tem, usa como organização, não como substituto clínico.'],
    ['Decida se você precisa de olho humano neste momento. Se precisa, contrate. O app não ocupa essa cadeira.', 'Se o que falta é a lista da semana, use o cadastro.', 'Não cobre correção de movimento ao vivo de um texto.', 'Leia o preço como assinatura de software, não como hora de aula.'],
    ['Largar um acompanhamento médico porque assinou o app.', 'Pagar o app e esperar o mesmo feedback de um profissional na sala.', 'Achar o app inútil só porque ele não é o personal.'],
  ),
  'duvidas/preciso-de-academia': c(
    ['Não precisa. Casa inclui nenhum equipamento. A assinatura não paga a catraca e não exige colchonete oficial. Exige um canto em que dá para se apoiar sem se machucar, e isso a pessoa vê. Academia é opção para quem tem aparelho e quer usá-lo com roteiro.', 'Misto existe para não escolher um lado para sempre. Se a academia é longe, marcar só ela é o cadastro que gera falta. O plano de casa não deve pedir leg press. Se pedir, o local está errado.'],
    ['Marque casa se é lá que você vai treinar.', 'Não compre uma estação para “merecer” o app.', 'Se já paga academia e vai, marque academia e chegue com a sessão.', 'Se usa os dois, marque misto e não some as frequências.'],
    ['Achar que sem academia o cadastro não serve.', 'Somar a mensalidade da academia ao preço do app e chamar tudo de AthletIA.', 'Pedir ao app para liberar a catraca.'],
  ),
  'duvidas/serve-para-iniciante': c(
    ['Serve para quem marca iniciante, poucos dias e um local real, e para quando dói. Não serve como autorização para quem nunca se examinou e tem dúvida sobre o coração, uma lesão ou uma gestação. A menor combinação prática é duas vezes e 30 a 45 minutos. A idade dos Termos continua 18 ou responsável.', 'Aprender o movimento por instrução de exercício, que os Termos citam, não é o mesmo que alguém corrigindo ao vivo. Se a lesão antiga importa, dizer no que for voluntário não é tratamento. É só dado. O tratamento continua fora.'],
    ['Marque iniciante de uma vez.', 'Escolha casa se a academia trava o começo.', 'Faça a primeira semana curta e completa.', 'Pare no sinal de dor que não é esforço.'],
    ['Abrir o treino avançado no primeiro dia.', 'Esconder limitação para o plano não “ficar fraco”.', 'Usar o app no lugar do médico.'],
  ),
  'duvidas/serve-para-quem-ja-treina': c(
    ['Serve para quem improvisa apesar de já saber se mexer. A experiência avançada e as frequências altas existem para não tratar todo mundo como iniciante. A agenda ainda limita o volume. Marcar mais de 75 minutos só faz sentido se a sessão dura isso.', 'Quem tem treinador pode registrar no app. Quem não tem, segue o plano. Nos dois casos o app não escolhe a carga máxima. Ignorar o plano e fazer outro, sem registrar o que foi feito, tira a referência do ajuste descrito nos Termos.'],
    ['Marque o nível e os minutos reais.', 'Siga uma semana inteira antes de reescrever.', 'Anote a série que você fez, não a que o ego queria.', 'Não peça ao app um teste de atleta.'],
    ['Marcar iniciante por engano e achar o plano “fraco” sem ler a agenda.', 'Ter dois planos, o do treinador e o do app, e não cumprir nenhum.', 'Subir carga fora do que foi registrado.'],
  ),
  'duvidas/app-de-treino-funciona': c(
    ['Funciona como organização: a sessão existe antes da hora, com os dias, os minutos e o local do cadastro. Não funciona no lugar da pessoa, nem como emagrecimento sem olhar para a comida, nem como nota de avaliação. Este guia não publica quantidade de alunos.', 'O app falha quando o treino é longo demais para a vida real. Por isso a duração é uma pergunta. Também falha quando fica fechado. Sem abrir, não há sessão nem histórico. A página oficial é onde os planos estão. O guia só explica.'],
    ['Preencha o cadastro com a semana real.', 'Abra a sessão na hora marcada.', 'Registre.', 'Não cobre do treino a parte da comida que o produto não entrega.'],
    ['Assinar e não abrir.', 'Esperar quilos sem mexer no prato e sem cumprir a sessão.', 'Julgar por uma nota que este guia não usa.'],
  ),
  'duvidas/ia-monta-treino-com-seguranca': c(
    ['O risco não é a sigla. É tratar texto como ordem médica, mentir o nível, ou forçar lesão. Os Termos colocam o uso por conta e risco e mandam parar se doer. A geração do plano não ausculta coração e não vê o joelho. Dado de saúde voluntário não vira tratamento.', 'Cadastro honesto é a parte da segurança que está na mão de quem usa: não marcar avançado sem sê-lo, não marcar seis dias sem tempo, não marcar academia sem academia. Esta página não é aconselhamento jurídico. O limite de responsabilidade está em /termos, não num resumo.'],
    ['Diga o nível de hoje.', 'Diga o local de hoje.', 'Pare na dor.', 'Leia os Termos se a dúvida é sobre responsabilidade, e fale com um profissional se a dúvida é sobre saúde.'],
    ['Esconder lesão para o plano ficar “melhor”.', 'Continuar com dor porque a IA “mandou”.', 'Achar que informar limitação substitui quem trata a lesão.'],
  ),
  'duvidas/preciso-de-equipamento': c(
    ['Não é obrigatório. Casa inclui nenhum equipamento. Halter e elástico ampliam a progressão. Não são a condição para ter plano. Anilha não é obrigatória para marcar ganhar massa. O app não vende kit. Isso não está na descrição do serviço.', 'Sem equipamento, a dificuldade mora na alavanca e na repetição. Com equipamento, mora também na carga. Os dois são treino. Comprar uma estação antes de duas semanas cumpridas é gasto. Dá para começar e só então decidir se um elástico ajuda.'],
    ['Marque casa e comece com o peso do corpo.', 'Progrida a variação antes da compra.', 'Se comprar algo, que seja depois de saber qual movimento você repete.', 'Não cobre um kit do preço da assinatura.'],
    ['Não começar até ter a garagem perfeita.', 'Achar que hipertrofia sem anilha é impossível por decreto.', 'Encher a sala de aparelho e continuar sem sessão marcada.'],
  ),
  'duvidas/casa-sem-equipamento': c(
    ['Dá. A frase do cadastro inclui sem equipamentos. Agachar, flexionar e se apoiar cabem na sala se o chão não escorrega e o teto não corta o braço. Barra de porta não é obrigatória. Se não há, o plano não deve depender dela. Impacto que incomoda o vizinho sai do treino. O chão continua válido.', 'A progressão sem carga externa não tem percentual de anilha. Tem repetição limpa e variação mais difícil. Quem sente que “não é treino” pode dificultar o movimento antes de comprar. Se mais tarde houver academia num dia da semana, o modo é misto, não uma desculpa para abandonar a sala.'],
    ['Teste o canto: chão, teto, silêncio do prédio.', 'Marque casa.', 'Faça a sessão curta completa.', 'Dificulte o movimento quando ele ficar estável, antes de gastar.'],
    ['Pular porque não tem barra.', 'Fazer salto em apartamento que não aguenta.', 'Declarar a sala inválida sem ter tentado duas semanas.'],
  ),
  'duvidas/o-app-passa-dieta': c(
    ['Não passa. Não há cardápio, caloria nem lista de compras na descrição do serviço. Os objetivos de perder peso e ganhar massa não abrem uma exceção. Quem precisa de comida individual procura nutricionista. O treino segue sendo o produto.', 'Pergunta sobre água no cadastro não é plano alimentar e não vira meta de copos nesta página. Emagrecer “só com o treino”, como promessa, também não está aqui. O objetivo organiza a sessão. O prato continua do lado de fora, e é honesto dizer isso antes da assinatura.'],
    ['Não procure contador de calorias no app. Não está na descrição.', 'Marque o objetivo de treino mesmo assim, se o treino é o que você quer.', 'Leve a comida a quem cuida de comida, se a orientação precisa ser sua.', 'Não cobre do suporte um cardápio.'],
    ['Assinar achando que vem dieta.', 'Tratar copos de água do cadastro como prescrição.', 'Achar que o objetivo perder peso inclui meta de quilos.'],
  ),
  'duvidas/quanto-custa-comecar': c(
    ['Começar custa um dos três planos: R$ 29,90 no mês, R$ 49,90 a cada três meses ou R$ 89,90 a cada seis. Não há taxa de matrícula neste guia. Equipamento e academia, se existirem, são outras notas. A renovação segue até o cancelamento nas configurações, conforme os Termos.', 'O menor período é o mensal. O menor equivalente por mês é o semestral, a R$ 14,98. Nenhum dos dois compra um resultado. Compram o acesso ao serviço descrito. O valor tem que ser o da página oficial, não o de um print antigo.'],
    ['Abra athletia.site e leia os três preços na hora.', 'Escolha o período.', 'Não some academia e halter nessa conta se a pergunta é só o app.', 'Cancele nas configurações se for parar, em vez de só abandonar a sessão.'],
    ['Procurar matrícula escondida que este guia não publica.', 'Pagar por um prazo de corpo.', 'Usar preço de outro ano.'],
  ),
  'duvidas/diferenca-entre-os-planos': c(
    ['A diferença é o período e o caixa. O treino nasce do mesmo cadastro. O semestral tem o menor equivalente mensal publicado. O mensal é o compromisso mais curto. Destaque de vitrine não cria um treino melhor. Cancelamento, nos Termos, é nas configurações. Estorno, se a regra existir, é o texto dos Termos, não uma frase desta página.', 'Quem ainda testa se a sessão cabe na vida pode ficar no mensal. Quem já sabe que vai usar e quer o equivalente menor olha o semestral. Não há plano com IA e plano sem IA nestes fatos.'],
    ['Escolha pelo tempo que você aceita pagar adiantado.', 'Ignore o selo de vitrine na hora de imaginar o treino.', 'Leia o cancelamento nos Termos antes do semestral, se isso pesa.', 'Não refaça o cadastro para “combinar” com o preço.'],
    ['Achar que o plano popular treina mais.', 'Cobrar resultado maior do semestral.', 'Inventar uma regra de estorno que não está nos Termos.'],
  ),
  'duvidas/como-assinar': c(
    ['A assinatura é na página athletia.site, num dos três planos, com 18 anos ou responsável e cadastro verdadeiro. O guia não é a assinatura. Não há formulário de venda dentro destas respostas. Link de outra origem não é o fato do produto.', 'Depois do pagamento, o treino só fica pessoal com idade, objetivo, experiência, dias, tempo e local. Deixar isso para depois é assinar um acesso e continuar sem plano. As regras completas estão em /termos. O resumo desta página não substitui essa leitura.'],
    ['Abra a página oficial.', 'Escolha o período.', 'Complete o cadastro de treino na sequência.', 'Coloque a primeira sessão na agenda antes de fechar.'],
    ['Assinar por um link solto e não conferir o preço.', 'Achar que ler o guia já ativou a conta.', 'Pular os Termos e depois cobrar uma regra que não está neles.'],
  ),
  'glossario/serie': c(
    ['Série é o bloco de repetições antes da pausa. Três séries são esse bloco três vezes. O exercício é o movimento. A série é a dose daquele movimento. O número não é universal: cabe nos minutos marcados e no nível. Iniciante não copia a contagem de quem marcou avançado.', 'Muitas séries em pouco tempo só existem se cada uma for curta. Em 30 a 45 minutos a lista é pequena. O plano que ignora isso não cabe no relógio. Este glossário não fixa um número oficial do app. A sessão da conta é que organiza.'],
    ['Nomeie o movimento e só então conte as séries.', 'Inclua a pausa no tempo da sessão.', 'Pare a série quando a forma cair.', 'Não use a mesma contagem em tudo por hábito.'],
    ['Chamar série e exercício da mesma coisa e se perder na lista.', 'Encaixar séries infinitas em meia hora.', 'Copiar a contagem de um avançado no primeiro dia.'],
  ),
  'glossario/repeticao': c(
    ['Repetição é uma ida e volta completa, com controle. Dez são esse caminho dez vezes dentro da série. Pela metade não é o mesmo trabalho. Quicar no fundo do agachamento infla o número. Contar devagar é a repetição que depois permite progresso.', 'Doze não é fato do produto. É um número que as pessoas repetem. Em casa, a repetição usa o corpo. Quando a última fica fácil por mais de uma sessão, dificulta-se. Dor no meio não é a última repetição. É parada. Técnica negativa avançada não é obrigatória aqui.'],
    ['Faça o caminho inteiro.', 'Conte só o que saiu com forma.', 'Em casa, use a repetição limpa como progressão.', 'Pare se doer.'],
    ['Inflar a conta com repetição parcial.', 'Obrigatoriedade de doze.', 'Negativa extrema para iniciante porque o glossário existe.'],
  ),
  'glossario/descanso': c(
    ['Descanso é a pausa entre séries e também o dia sem a sessão pesada. A pausa devolve forma. O dia livre cabe porque a frequência máxima é seis. Não há segundo oficial de pausa. Lesão não se trata com folga improvisada. Trata com profissional.', 'Pausa curta demais entrega a série seguinte torta. Pausa longa demais, em meia hora, come o treino. Folga da semana não é castigo. Treinar nela para compensar costuma produzir o excesso que o cadastro já lista como problema. Caminhar na folga não está proibido. O app não policia o dia.'],
    ['Deixe pausa até a forma voltar.', 'Em sessão curta, corte exercício antes de zerar a pausa.', 'Aceite o dia fora que a frequência já criou.', 'Não transforme dor persistente em “descansar pouco”.'],
    ['Pausa zero.', 'Pausa de celular até perder a sessão.', 'Treino punitivo na folga.'],
  ),
  'glossario/hipertrofia': c(
    ['A palavra significa o músculo crescer com treino, recuperação e comida. No produto, o botão é ganhar massa muscular, para homem e mulher. Não é um protocolo secreto nem uma obrigação de academia. Força é outro objetivo. O app não mede o músculo e não passa a dieta.', 'Usar a palavra não cria centímetros nem prazo. Cria a intenção de repetir a força nas vezes que existem e dificultar quando a forma permite. Sem sono e sem comida, a palavra fica no título. Casa é local válido para esse objetivo.'],
    ['Marque ganhar massa se é isso que a palavra significa para você.', 'Não marque força no lugar por confusão de nome.', 'Repita a semana.', 'Não cobre tamanho numa data.'],
    ['Achar que hipertrofia é só para homem.', 'Exigir academia por causa do nome.', 'Tratar a palavra como garantia de medida.'],
  ),
  'glossario/forca': c(
    ['Força é praticar movimento contra resistência: corpo, elástico ou anilha, para fazer mais do que antes com forma. No cadastro, ficar mais forte. A OMS inclui fortalecimento para adultos. Isso não é percentual de carga máxima, que este guia não publica.', 'Caminhada não é, aqui, treino de força. É aeróbico. Força não é gritar a última repetição. Iniciante constrói com poucos dias. Teste de uma repetição máxima não é a primeira sessão de quem voltou. Dor nesse teste é um mau começo.'],
    ['Marque ficar mais forte se a prioridade é o movimento.', 'Escolha a resistência que o local tem.', 'Progrida com forma.', 'Não faça teste máximo na volta de uma pausa.'],
    ['Confundir caminhada com força e achar que o objetivo está cumprido.', 'Copiar percentual de internet.', 'Pular aquecimento porque o nome é força.'],
  ),
  'glossario/emagrecimento': c(
    ['Emagrecimento, neste guia, é perder peso ao longo do tempo. A descrição do objetivo fala em gordura e em definir, sem percentual publicado. O treino ajuda. A comida pesa mais e não está no app. Suor é calor. Abdominal é um exercício. Nenhum dos dois é a balança.', 'Não há zona prometida. Não há meta de quilos no preço. O plano semestral não é uma dose maior de emagrecimento. É mais tempo de assinatura. A sessão continua tendo que caber nos minutos de quem tem pouco tempo.'],
    ['Use a palavra como objetivo de treino, não como dieta.', 'Mantenha força na semana.', 'Não peça zona nem quilos.', 'Leve a comida para fora do app, com quem for o caso.'],
    ['Emagrecimento local.', 'Suor como prova.', 'Trocar o período do plano para emagrecer mais.'],
  ),
  'glossario/carga': c(
    ['Carga é a dificuldade: anilha, elástico ou a alavanca do corpo. Subir carga é um jeito de progredir quando a repetição já está estável. Não é a primeira ordem de quem sente dor. Não há quilo inicial nem percentual de máximo neste glossário.', 'Na academia a carga externa é óbvia. Em casa, sem equipamento, a carga é o corpo e a variação. Subir com a técnica caindo joga o esforço na articulação. Manter a mesma dificuldade com forma melhor pode ser progresso no começo. O histórico evita o chute. O app não marca o teste máximo.'],
    ['Escolha a dificuldade que completa a série com forma.', 'Anote.', 'Suba só quando a série está estável.', 'Em casa, aceite que a carga pode ser o próprio corpo.'],
    ['Começar no máximo.', 'Chutar quilo de memória na volta.', 'Achar que sem anilha a palavra carga não existe.'],
  ),
  'glossario/aquecimento': c(
    ['Aquecimento é o começo leve da sessão, em geral o próprio exercício fácil. Não é um segundo treino que consome os trinta minutos. Não há minuto oficial. Há o limite da faixa que a pessoa marcou. Esteira não é obrigatória.', 'O objetivo é controle na primeira série de trabalho, não chegar suado e vazio. Dor no aquecimento cancela o resto. Alongar até o desconforto antes de carregar a articulação não é o que esta página descreve. Aquecimento reduz o susto da primeira série. Não substitui médico nem evita toda lesão.'],
    ['Faça o movimento leve antes do pesado.', 'Caiba isso na duração marcada.', 'Dispense a esteira longa se o relógio é curto.', 'Pare se já dói.'],
    ['Gastar a sessão inteira na esteira e não treinar força.', 'Pular porque “não precisa”.', 'Achar que aquecer autoriza qualquer carga depois.'],
  ),
  'glossario/cardio': c(
    ['Cardio, aqui, é o esforço em que o fôlego sustenta um tempo contínuo: caminhar, pedalar, correr. A OMS descreve atividade aeróbica na semana do adulto. Isso não substitui força, não é prova e não vem com dieta no app. Corrida não é obrigatória. Caminhar já é aeróbico, e corrida pede uma condição que o app não avalia.', 'Jejum como truque de emagrecimento não é função do produto. Se a sessão de força é curta, o cardio pode ficar fora dela. Não é obrigação. É um jeito de não estourar 30 a 45 minutos. Os dois juntos, sem relógio, só cortam a forma.'],
    ['Decida se o cardio é dentro da sessão ou no resto do dia.', 'Não troque a força inteira por esteira se o objetivo pede músculo.', 'Não faça da corrida um teste no primeiro dia.', 'Não peça ao app uma estratégia de jejum.'],
    ['Cardio como único plano de quem quer só suar.', 'Corrida obrigatória.', 'Achar que o app cronometra prova.'],
  ),
  'glossario/consistencia': c(
    ['Consistência é repetir a frequência escolhida até existir histórico. Duas vezes feitas toda semana são consistência. Seis escritas e duas feitas não são. Não é nunca falhar. É voltar. Um mês consistente não garante um número. O guia não publica essa garantia.', 'O que segura a repetição é sessão curta e lista já decidida. O histórico da conta mostra o que houve, sem transformar falta em diagnóstico. Dobrar o treino depois da falta quebra a semana seguinte com mais facilidade do que a falta sozinha.'],
    ['Escolha uma frequência sobrevivível.', 'Repita antes de aumentar.', 'Registre a falta também, voltando na sessão normal.', 'Não cobre um resultado de trinta dias consistentes.'],
    ['Perfeição como definição.', 'Plano novo toda vez que falta.', 'Não registrar para não ver o buraco.'],
  ),
  'glossario/progressao': c(
    ['Progressão é dificultar aos poucos o que já sai com forma. Trocar a ficha toda semana é recomeço, não progressão. Os Termos falam em ajuste conforme o que foi registrado. Não há percentual semanal. Progressão para se houver dor. Nem toda sessão precisa subir. Manter com forma melhor já é passo.', 'Quem voltou de pausa não progride na primeira ida. Fica abaixo da memória. Em casa, a progressão é menor do que colocar dois quilos na barra e ainda é real. Sem registro, a pessoa acha que subiu e só mudou o exercício.'],
    ['Registre o mesmo movimento.', 'Suba uma coisa quando estiver estável.', 'Não suba na sessão em que a forma caiu.', 'Na volta de pausa, reaprenda antes de progredir.'],
    ['Progressão obrigatória toda ida.', 'Troca semanal de exercício.', 'Aumento com dor.'],
  ),
  'glossario/treino-personalizado': c(
    ['Personalizado, aqui, é o plano que muda com a faixa etária, o objetivo, a experiência, a frequência, a duração e o local daquela conta. Não é um profissional ao lado. Não é a mesma ficha com o nome trocado. Duas pessoas com os mesmos campos podem ficar parecidas. Duas com dias e locais diferentes não deveriam receber a mesma lista.', 'A palavra não cobre lesão, gestação ou doença. Esses casos continuam com o profissional. Sem cadastro, não há o que personalizar. Os Termos descrevem planos a partir de dados físicos e objetivos. O local muda o que é possível fazer. O preço não muda o sentido da palavra.'],
    ['Preencha todos os campos com a vida real.', 'Não chame de personalizado um PDF genérico.', 'Não cobre do nome um personal presencial.', 'Não use a palavra para pular orientação médica.'],
    ['Achar que personalizado é o mesmo que personal trainer.', 'Pular o cadastro e esperar mágica.', 'Achar que o plano trata gestação porque tem o nome da conta.'],
  ),
}

export function camadas(pagina: PaginaGuia): Camada {
  const chave = `${pagina.tema}/${pagina.slug}`
  const camada = CAMADAS[chave]
  if (!camada) throw new Error(`Guia sem profundidade: ${chave}`)
  return camada
}

for (const pagina of PAGINAS) {
  camadas(pagina)
}
