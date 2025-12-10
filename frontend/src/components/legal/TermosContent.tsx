export default function TermosContent() {
  return (
    <>
      <div className="text-center space-y-2 pb-6 border-b border-grey/20 mb-6">
        <p className="text-sm text-light-muted">
          Última atualização: {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e utilizar o serviço AthletIA, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. 
          Se você não concorda com qualquer parte destes termos, não deve utilizar nosso serviço.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">2. Descrição do Serviço</h2>
        <p>
          O AthletIA é uma plataforma digital que oferece treinos personalizados gerados por inteligência artificial. 
          Nossos serviços incluem:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Criação de planos de treino personalizados baseados em seus dados físicos e objetivos</li>
          <li>Ajuste automático de treinos conforme seu progresso</li>
          <li>Acompanhamento de histórico de treinos e evolução</li>
          <li>Acesso a exercícios e instruções detalhadas</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">3. Elegibilidade</h2>
        <p>Para utilizar o AthletIA, você deve:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Ter pelo menos 18 anos de idade ou ter autorização de um responsável legal</li>
          <li>Fornecer informações precisas e atualizadas durante o cadastro</li>
          <li>Manter a segurança de sua conta e senha</li>
          <li>Ser responsável por todas as atividades que ocorrem sob sua conta</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">4. Assinatura e Pagamento</h2>
        <p>
          O acesso aos serviços do AthletIA requer uma assinatura ativa. Os planos disponíveis e preços estão 
          claramente indicados em nossa página de checkout. Ao assinar, você concorda em pagar as taxas aplicáveis 
          conforme o plano escolhido.
        </p>
        <p>
          As assinaturas são renovadas automaticamente, a menos que você cancele antes do término do período de 
          assinatura. Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">5. Uso do Serviço</h2>
        <p>Você concorda em:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Usar o serviço apenas para fins legais e de acordo com estes Termos</li>
          <li>Não tentar acessar áreas restritas do sistema</li>
          <li>Não interferir ou interromper o funcionamento do serviço</li>
          <li>Não usar o serviço de forma que possa danificar, desabilitar ou sobrecarregar nossos servidores</li>
          <li>Não tentar obter acesso não autorizado a qualquer parte do serviço</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">6. Limitação de Responsabilidade</h2>
        <p>
          <strong className="text-light">IMPORTANTE:</strong> O AthletIA fornece informações e orientações sobre exercícios físicos, 
          mas não substitui o aconselhamento médico profissional. Antes de iniciar qualquer programa de exercícios, 
          consulte um médico ou profissional de saúde qualificado.
        </p>
        <p>
          Você reconhece e concorda que:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>O uso do serviço é por sua conta e risco</li>
          <li>O AthletIA não se responsabiliza por lesões ou danos resultantes do uso do serviço</li>
          <li>Você é responsável por avaliar sua capacidade física antes de realizar qualquer exercício</li>
          <li>Você deve interromper qualquer exercício se sentir dor ou desconforto</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">7. Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo do AthletIA, incluindo mas não limitado a textos, gráficos, logos, ícones, imagens, 
          software e compilações de dados, é propriedade do AthletIA ou de seus fornecedores de conteúdo e está 
          protegido por leis de direitos autorais e outras leis de propriedade intelectual.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">8. Modificações do Serviço</h2>
        <p>
          Reservamos o direito de modificar, suspender ou descontinuar qualquer aspecto do serviço a qualquer momento, 
          com ou sem aviso prévio. Não seremos responsáveis perante você ou terceiros por qualquer modificação, 
          suspensão ou descontinuação do serviço.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">9. Rescisão</h2>
        <p>
          Podemos encerrar ou suspender sua conta e acesso ao serviço imediatamente, sem aviso prévio, por qualquer 
          motivo, incluindo se você violar estes Termos de Uso. Após a rescisão, seu direito de usar o serviço cessará 
          imediatamente.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">10. Alterações nos Termos</h2>
        <p>
          Reservamos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor 
          imediatamente após a publicação. Seu uso continuado do serviço após tais alterações constitui sua aceitação 
          dos novos termos.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">11. Lei Aplicável</h2>
        <p>
          Estes Termos de Uso são regidos pelas leis do Brasil. Qualquer disputa relacionada a estes termos será 
          resolvida nos tribunais competentes do Brasil.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">12. Contato</h2>
        <p>
          Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através dos canais de suporte 
          disponíveis em nossa plataforma.
        </p>
      </section>
    </>
  )
}

