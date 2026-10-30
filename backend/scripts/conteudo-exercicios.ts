export interface ConteudoExercicio {
  descricao: string;
  execucao: string;
  erros: string[];
}

function passos(descricao: string, itens: string[], erros: string[]): ConteudoExercicio {
  return {
    descricao,
    execucao: itens.map((item, indice) => `${indice + 1}. ${item}`).join(' '),
    erros,
  };
}

function normalizar(valor: string): string {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function gerarConteudo(nome: string, grupo: string): ConteudoExercicio {
  const n = normalizar(nome);

  if (/alongamento/.test(n)) {
    return passos(
      `${nome} aumenta a mobilidade de ${grupo.toLowerCase()} e deve ser feito sem dor.`,
      [
        'Encontre a posição em que sente alongar, sem forçar o joelho ou a coluna.',
        'Mantenha a respiração contínua e segure de 20 a 30 segundos.',
        'Saia devagar e repita do outro lado quando o movimento for unilateral.',
      ],
      [
        'Dar tranco para ganhar amplitude.',
        'Prender a respiração durante a sustentação.',
        'Alongar em cima de uma dor aguda.',
      ]
    );
  }

  if (/esteira/.test(n)) {
    return passos(
      'Caminhada ou corrida na esteira, usada como cardio no fim do treino.',
      [
        'Suba na esteira parada e só então inicie a velocidade.',
        'Olhe à frente, com passos curtos e o tronco estável.',
        'Mantenha um ritmo em que ainda consiga falar uma frase.',
        'Reduza a velocidade antes de descer.',
      ],
      [
        'Segurar o painel o tempo todo.',
        'Inclinar o tronco para a frente.',
        'Pular da lona ainda em movimento.',
      ]
    );
  }

  if (/bicicleta/.test(n)) {
    return passos(
      'Pedalada na bicicleta ergométrica, com resistência moderada.',
      [
        'Ajuste o banco para o joelho ficar levemente flexionado no ponto baixo.',
        'Pedale com a frente do pé e mantenha o quadril estável.',
        'Aumente a carga sem perder a cadência.',
      ],
      [
        'Banco alto ou baixo demais, forçando o joelho.',
        'Pedalar só com a ponta ou só com o calcanhar.',
        'Arquear a lombar para empurrar mais carga.',
      ]
    );
  }

  if (/eliptic/.test(n)) {
    return passos(
      'Movimento contínuo no elíptico, sem impacto.',
      [
        'Apoie o pé inteiro na plataforma.',
        'Empurre e puxe de forma alternada, com o tronco alto.',
        'Use os braços junto com as pernas, sem se dependurar.',
      ],
      [
        'Deixar o calcanhar cair para fora da plataforma.',
        'Ir rápido demais e perder o contato dos pés.',
        'Curvar as costas para acompanhar o aparelho.',
      ]
    );
  }

  if (n === 'escada' || n.startsWith('escada ')) {
    return passos(
      'Subida contínua na escada, como cardio de pernas.',
      [
        'Apoie o pé inteiro em cada degrau.',
        'Mantenha o tronco alto e os passos no seu ritmo.',
        'Segure o corrimão só para equilíbrio, sem pendurar o peso do corpo.',
      ],
      [
        'Subir na ponta dos pés o tempo todo.',
        'Olhar para os pés e arredondar a coluna.',
        'Pular degraus quando a máquina ainda está rápida.',
      ]
    );
  }

  if (/polichinelo/.test(n)) {
    return passos(
      'Polichinelo é o cardio de peso corporal, com salto e abertura de braços.',
      [
        'Salte abrindo as pernas e levando as mãos acima da cabeça.',
        'Volte à posição inicial com os joelhos macios.',
        'Mantenha um ritmo constante pelo tempo previsto.',
      ],
      [
        'Aterrissar com o joelho travado.',
        'Arquear a lombar ao erguer os braços.',
        'Prender a respiração.',
      ]
    );
  }

  if (/corrida no lugar/.test(n)) {
    return passos(
      'Corrida estacionária, usada como cardio sem equipamento.',
      [
        'Corra no lugar elevando os joelhos na altura que conseguir manter.',
        'Apoie a frente do pé e deixe os braços acompanharem.',
        'Segure o ritmo até o fim do tempo.',
      ],
      [
        'Bater o calcanhar no chão com força.',
        'Inclinar o tronco demais para a frente.',
        'Prender a respiração nos primeiros segundos.',
      ]
    );
  }

  if (/montanhista|burpee/.test(n)) {
    return passos(
      `${nome} combina apoio de prancha e movimento de pernas.`,
      [
        'Comece na prancha, com as mãos sob os ombros.',
        'Traga um joelho de cada vez em direção ao peito, ou o corpo inteiro no burpee.',
        'Mantenha o quadril estável e volte com controle.',
      ],
      [
        'Deixar o quadril subir a cada troca de perna.',
        'Apoiar as mãos muito à frente dos ombros.',
        'Prender a respiração no meio da série.',
      ]
    );
  }

  if (/supino/.test(n)) {
    return passos(
      `${nome} é um exercício de peito. A barra, o halter ou a máquina mudam a estabilidade, não o caminho do cotovelo.`,
      [
        'Deite com os pés no chão e as escápulas apoiadas.',
        'Desça a carga até a linha do peito, com os cotovelos a cerca de 45 graus.',
        'Empurre para cima sem tirar o glúteo do banco e sem travar o cotovelo com violência.',
      ],
      [
        'Quicar a barra no peito.',
        'Abrir os cotovelos até ficarem alinhados com o pescoço.',
        'Tirar o quadril do banco para terminar a repetição.',
      ]
    );
  }

  if (/flexao|mergulho de triceps/.test(n)) {
    return passos(
      `${nome} usa o peso do corpo para peito, ombro ou tríceps, conforme a posição das mãos.`,
      [
        'Apoie as mãos com firmeza e alinhe o corpo da cabeça aos joelhos ou aos pés.',
        'Dobre os cotovelos e desça o peito sem deixar o quadril cair.',
        'Empurre o chão até estender os cotovelos, sem travá-los no topo.',
      ],
      [
        'Deixar o quadril cair ou subir em V.',
        'Abrir os cotovelos quando a variação pede o braço junto ao tronco.',
        'Encurtar o movimento e não descer.',
      ]
    );
  }

  if (/agachamento/.test(n)) {
    return passos(
      `${nome} trabalha coxas e glúteos. A profundidade vale enquanto o calcanhar ficar no chão.`,
      [
        'Pés na largura do quadril ou um pouco mais abertos, conforme a variação.',
        'Desça empurrando o quadril para trás, com o peito alto.',
        'Suba pressionando o chão, sem deixar o joelho cair para dentro.',
      ],
      [
        'Deixar o joelho avançar sem controle e cair para dentro.',
        'Arredondar a lombar no fundo do movimento.',
        'Tirar o calcanhar do chão para descer mais.',
      ]
    );
  }

  if (/afundo/.test(n)) {
    return passos(
      `${nome} trabalha quadríceps e glúteos, uma perna de cada vez.`,
      [
        'Dê o passo e distribua o peso entre as duas pernas.',
        'Desça até o joelho de trás apontar para o chão, sem bater nele.',
        'Empurre o pé da frente para voltar, mantendo o tronco alto.',
      ],
      [
        'Dar um passo curto e jogar o joelho muito à frente.',
        'Inclinar o tronco sobre a perna da frente.',
        'Deixar o joelho da frente cair para dentro.',
      ]
    );
  }

  if (/leg press/.test(n)) {
    return passos(
      'O leg press trabalha quadríceps e glúteos com as costas apoiadas.',
      [
        'Apoie as costas e o quadril no encosto, com os pés na plataforma.',
        'Desça até os joelhos passarem de 90 graus, sem tirar o glúteo do banco.',
        'Empurre a plataforma sem travar os joelhos no topo.',
      ],
      [
        'Descer tanto que a lombar sai do banco.',
        'Juntar os joelhos no meio do movimento.',
        'Travar o joelho com força no alto.',
      ]
    );
  }

  if (/cadeira extensora|extensora/.test(n) && /quadr/.test(normalizar(grupo))) {
    return passos(
      'A cadeira extensora isola o quadríceps.',
      [
        'Ajuste o apoio para ficar logo acima do tornozelo.',
        'Estenda os joelhos até quase o topo, sem jogar o quadril para a frente.',
        'Desça controlando, sem deixar a pilha de peso bater.',
      ],
      [
        'Usar impulso do tronco.',
        'Travar o joelho no final.',
        'Apoio mal ajustado, em cima do pé.',
      ]
    );
  }

  if (/mesa flexora|cadeira flexora|flexora/.test(n)) {
    return passos(
      `${nome} flexiona o joelho na máquina para trabalhar o posterior da coxa.`,
      [
        'Ajuste o apoio atrás do tornozelo e mantenha o quadril colado no banco.',
        'Flexione os joelhos puxando o apoio em direção ao glúteo.',
        'Volte devagar até estender a perna, sem tirar a pelve do apoio.',
      ],
      [
        'Levantar o quadril para ajudar a flexão.',
        'Soltar o peso na volta.',
        'Apoio mal posicionado, em cima do pé.',
      ]
    );
  }

  if (/stiff|levantamento terra|bom dia|good morning|deslize de calcanhar|flexao de joelho/.test(n)) {
    return passos(
      `${nome} trabalha a parte de trás da coxa e o glúteo, com a coluna neutra.`,
      [
        'Comece com o quadril estável e o peito alto.',
        'Incline o tronco empurrando o quadril para trás, com os joelhos levemente flexionados.',
        'Volte contraindo o posterior, sem arquear a lombar.',
      ],
      [
        'Arredondar as costas para descer a carga.',
        'Travar o joelho no stiff.',
        'Arredondar a lombar no fim da descida.',
      ]
    );
  }

  if (/remada/.test(n)) {
    return passos(
      `${nome} puxa a carga em direção ao tronco e trabalha as costas.`,
      [
        'Estabilize o tronco antes da primeira repetição.',
        'Puxe o cotovelo para trás, levando a carga em direção ao quadril ou ao abdômen.',
        'Junte as escápulas no fim e volte sem deixar o ombro subir até a orelha.',
      ],
      [
        'Puxar com o braço e deixar o cotovelo aberto, sem usar as costas.',
        'Balançar o tronco para completar a repetição.',
        'Encolher o ombro no topo da puxada.',
      ]
    );
  }

  if (/puxada|barra fixa/.test(n)) {
    return passos(
      `${nome} trabalha as costas na puxada vertical.`,
      [
        'Segure a barra na largura dos ombros ou um pouco mais aberta.',
        'Puxe o peito em direção à barra, levando os cotovelos para baixo.',
        'Desça até os braços estenderem, sem soltar o ombro para a frente.',
      ],
      [
        'Puxar atrás da nuca.',
        'Encolher o corpo e usar só o bíceps.',
        'Balançar o tronco para passar do queixo.',
      ]
    );
  }

  if (/rosca|curl de biceps|isometria de biceps/.test(n)) {
    return passos(
      `${nome} flexiona o cotovelo para trabalhar o bíceps.`,
      [
        'Deixe o cotovelo ao lado do tronco, parado.',
        'Flexione até a mão se aproximar do ombro, sem balançar o corpo.',
        'Desça até estender o braço, controlando a volta.',
      ],
      [
        'Jogar o cotovelo para a frente para aliviar.',
        'Usar o quadril para impulsionar a carga.',
        'Encurtar a descida e não estender o braço.',
      ]
    );
  }

  if (/desenvolvimento/.test(n)) {
    return passos(
      `${nome} empurra a carga acima da cabeça e trabalha os ombros.`,
      [
        'Comece com as mãos na altura dos ombros e as escápulas firmes.',
        'Empurre para cima, passando a cabeça levemente à frente no final.',
        'Desça até as mãos voltarem à linha dos ombros, sem bater.',
      ],
      [
        'Arquear a lombar para terminar a subida.',
        'Deixar os cotovelos abrirem totalmente para o lado.',
        'Prender a respiração na subida.',
      ]
    );
  }

  if (/crucifixo inverso|abertura com elastico|puxada para o rosto|rotacao externa|rotacao interna/.test(n)) {
    return passos(
      `${nome} trabalha a parte de trás do ombro e a escápula.`,
      [
        'Mantenha o tronco estável e os cotovelos na altura dos ombros.',
        'Abra os braços ou puxe a corda em direção ao rosto, conforme a variação.',
        'Volte devagar, sem deixar o ombro subir.',
      ],
      [
        'Usar carga que obrigue a balançar o tronco.',
        'Encolher os ombros durante a abertura.',
        'Estender o cotovelo e transformar o movimento em remada.',
      ]
    );
  }

  if (/elevacao/.test(n) && /ombro|trapezio/.test(normalizar(grupo))) {
    return passos(
      `${nome} eleva o braço para trabalhar o ombro, com o cotovelo levemente flexionado.`,
      [
        'Comece com o braço ao lado do corpo e o ombro baixo.',
        'Eleve até a altura do ombro, sem passar muito disso.',
        'Desça controlando, sem balançar o tronco.',
      ],
      [
        'Subir o ombro junto com o halter.',
        'Usar impulso das pernas.',
        'Passar da linha do ombro e perder o controle.',
      ]
    );
  }

  if (/encolhimento|retracao/.test(n)) {
    return passos(
      `${nome} trabalha o trapézio e a escápula.`,
      [
        'Braços relaxados, ou na posição indicada pela variação.',
        'Eleve ou junte as escápulas sem dobrar o cotovelo para ajudar.',
        'Segure um segundo no alto e desça até alongar.',
      ],
      [
        'Rolar o ombro para a frente e para trás.',
        'Dobrar o cotovelo e transformar em remada.',
        'Usar impulso do joelho.',
      ]
    );
  }

  if (/panturrilha|saltito/.test(n)) {
    return passos(
      `${nome} trabalha a panturrilha na flexão do tornozelo.`,
      [
        'Apoie a frente do pé e deixe o calcanhar livre para descer.',
        'Suba o mais alto que conseguir, sem dobrar o joelho.',
        'Desça até sentir alongar e repita sem quicar.',
      ],
      [
        'Dobrar o joelho para ajudar a subida.',
        'Fazer o movimento curto, sem descer o calcanhar.',
        'Tombar o tornozelo para fora.',
      ]
    );
  }

  if (/prancha/.test(n)) {
    return passos(
      `${nome} sustenta o corpo com o abdômen firme.`,
      [
        'Apoie os antebraços ou as mãos e alinhe a cabeça com o quadril.',
        'Empurre o chão e mantenha as costelas baixas.',
        'Respire durante a sustentação, sem deixar o quadril cair.',
      ],
      [
        'Deixar o quadril subir ou cair.',
        'Prender a respiração.',
        'Apoiar a cabeça entre os ombros e encolher o pescoço.',
      ]
    );
  }

  if (/gato-camelo|bird dog|superman|nadador/.test(n)) {
    return passos(
      `${nome} fortalece o meio do corpo ou a lombar, com a coluna estável.`,
      [
        'Entre na posição e alinhe cabeça, tronco e quadril.',
        'Mantenha o abdômen firme sem prender a respiração.',
        'Se houver movimento de braço ou perna, mexa só o membro, sem girar a bacia.',
      ],
      [
        'Deixar o quadril cair ou subir demais.',
        'Prender a respiração o tempo todo.',
        'Girar o tronco para levantar o braço ou a perna.',
      ]
    );
  }

  if (/abdominal|dead bug|membros opostos|toque alternado/.test(n)) {
    return passos(
      `${nome} trabalha o abdômen. O movimento sai do tronco, não do pescoço.`,
      [
        'Deite ou apoie como a variação pede, com a lombar estável.',
        'Tire as escápulas do chão ou mova o membro oposto, conforme o exercício.',
        'Volte devagar, sem puxar a cabeça com as mãos.',
      ],
      [
        'Puxar o pescoço com as mãos.',
        'Tirar a lombar do chão quando a variação pede ela apoiada.',
        'Usar impulso das pernas para sentar.',
      ]
    );
  }

  if (/ponte|quadril|coice|abduc|aduc|frog|hiperextensao reversa/.test(n)) {
    return passos(
      `${nome} trabalha glúteos ou adutores, com a pelve estável.`,
      [
        'Apoie os pés ou os joelhos e deixe o abdômen firme.',
        'Eleve o quadril ou a perna até contrair o glúteo, sem arquear a lombar.',
        'Desça até alongar e repita do outro lado quando for unilateral.',
      ],
      [
        'Arquear a lombar para subir mais.',
        'Girar a pelve na variação unilateral.',
        'Empurrar com o pescoço em vez do calcanhar.',
      ]
    );
  }

  if (/hiperextens|extensao lombar|extensao de coluna/.test(n)) {
    return passos(
      `${nome} fortalece a lombar na extensão do tronco.`,
      [
        'Apoie o quadril e deixe a coluna neutra na posição inicial.',
        'Suba o tronco até o corpo formar uma linha, não além disso.',
        'Desça controlando, sem soltar a descida.',
      ],
      [
        'Passar da linha do corpo e comprimir a lombar.',
        'Puxar com os braços para subir.',
        'Dobrar o pescoço para olhar o teto.',
      ]
    );
  }

  if (/triceps|frances|coice/.test(n)) {
    return passos(
      `${nome} estende o cotovelo para trabalhar o tríceps.`,
      [
        'Deixe o cotovelo apontado para o chão ou para trás, e pare ele no lugar.',
        'Estenda o antebraço até o braço ficar firme, sem travar com impacto.',
        'Volte só o antebraço, mantendo o ombro quieto.',
      ],
      [
        'Abrir o cotovelo para o lado.',
        'Usar o ombro para terminar a extensão.',
        'Descer a carga rápido demais.',
      ]
    );
  }

  if (/crucifixo|cruzamento/.test(n)) {
    return passos(
      `${nome} abre e fecha os braços para trabalhar o peito.`,
      [
        'Mantenha um leve ângulo no cotovelo durante todo o movimento.',
        'Abra até sentir o peito, sem deixar o ombro ir à frente.',
        'Feche como se fosse abraçar um tronco, contraindo o peito.',
      ],
      [
        'Estender o cotovelo e transformar em supino.',
        'Descer além da linha do banco e sentir dor no ombro.',
        'Bater os halteres no topo.',
      ]
    );
  }

  if (/rotacao de tronco|rotacao no cabo/.test(n)) {
    return passos(
      `${nome} gira o tronco contra a resistência e trabalha o abdômen.`,
      [
        'Segure a pegada com os braços quase estendidos.',
        'Gire o tronco, não só os braços, e acompanhe com o quadril estável.',
        'Volte devagar até a posição inicial.',
      ],
      [
        'Girar só os braços e deixar o quadril solto.',
        'Puxar com o bíceps.',
        'Usar impulso do joelho.',
      ]
    );
  }

  return passos(
    `${nome} trabalha ${grupo.toLowerCase()}. Faça a amplitude completa que conseguir sem dor.`,
    [
      'Ajuste o corpo e o equipamento antes da primeira repetição.',
      'Execute o caminho do movimento devagar na ida e na volta.',
      'Pare a série quando a postura quebrar, mesmo que faltem repetições.',
    ],
    [
      'Usar impulso para vencer a carga.',
      'Encurtar a amplitude.',
      'Prender a respiração durante a série.',
    ]
  );
}
