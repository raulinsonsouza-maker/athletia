export default function PrivacidadeContent() {
  return (
    <>
      <div className="text-center space-y-2 pb-6 border-b border-grey/20 mb-6">
        <p className="text-sm text-light-muted">
          Última atualização: {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">1. Introdução</h2>
        <p>
          O AthletIA ("nós", "nosso" ou "plataforma") está comprometido em proteger sua privacidade. Esta Política 
          de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você 
          utiliza nosso serviço.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">2. Informações que Coletamos</h2>
        <p>Coletamos os seguintes tipos de informações:</p>
        
        <h3 className="text-lg font-semibold text-light mt-4">2.1. Informações Fornecidas por Você</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Dados de cadastro: nome, e-mail, telefone</li>
          <li>Dados físicos: altura, peso, idade, sexo, tipo de corpo</li>
          <li>Dados de treino: objetivos, nível de experiência, frequência, tempo disponível</li>
          <li>Informações de pagamento: processadas através de provedores de pagamento seguros</li>
          <li>Dados de saúde: lesões, limitações físicas (fornecidos voluntariamente)</li>
        </ul>

        <h3 className="text-lg font-semibold text-light mt-4">2.2. Informações Coletadas Automaticamente</h3>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Dados de uso: treinos realizados, exercícios concluídos, progresso</li>
          <li>Dados técnicos: endereço IP, tipo de navegador, dispositivo utilizado</li>
          <li>Cookies e tecnologias similares (conforme nossa Política de Cookies)</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">3. Como Usamos suas Informações</h2>
        <p>Utilizamos suas informações para:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Criar e personalizar seus treinos baseados em seus dados físicos e objetivos</li>
          <li>Ajustar automaticamente seus treinos conforme seu progresso</li>
          <li>Processar pagamentos e gerenciar sua assinatura</li>
          <li>Enviar comunicações importantes sobre sua conta e o serviço</li>
          <li>Melhorar nossos serviços e desenvolver novos recursos</li>
          <li>Garantir a segurança e prevenir fraudes</li>
          <li>Cumprir obrigações legais e regulatórias</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">4. Compartilhamento de Informações</h2>
        <p>
          Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes situações:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            <strong className="text-light">Provedores de Serviços:</strong> Com empresas que nos auxiliam a operar 
            nossa plataforma (processamento de pagamentos, hospedagem, análise de dados)
          </li>
          <li>
            <strong className="text-light">Obrigações Legais:</strong> Quando exigido por lei ou para proteger nossos 
            direitos legais
          </li>
          <li>
            <strong className="text-light">Com seu Consentimento:</strong> Quando você autorizar explicitamente o 
            compartilhamento
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">5. Segurança dos Dados</h2>
        <p>
          Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger suas informações pessoais 
          contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Criptografia de dados sensíveis</li>
          <li>Acesso restrito a informações pessoais</li>
          <li>Monitoramento regular de segurança</li>
          <li>Backups regulares dos dados</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">6. Retenção de Dados</h2>
        <p>
          Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta 
          política, a menos que um período de retenção mais longo seja exigido ou permitido por lei. Quando você cancela 
          sua conta, podemos reter certas informações conforme necessário para cumprir obrigações legais ou resolver 
          disputas.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">7. Seus Direitos</h2>
        <p>De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem os seguintes direitos:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            <strong className="text-light">Acesso:</strong> Solicitar acesso às suas informações pessoais
          </li>
          <li>
            <strong className="text-light">Correção:</strong> Solicitar correção de dados incompletos ou desatualizados
          </li>
          <li>
            <strong className="text-light">Exclusão:</strong> Solicitar a exclusão de suas informações pessoais
          </li>
          <li>
            <strong className="text-light">Portabilidade:</strong> Solicitar a transferência de seus dados para outro serviço
          </li>
          <li>
            <strong className="text-light">Revogação:</strong> Revogar seu consentimento a qualquer momento
          </li>
          <li>
            <strong className="text-light">Oposição:</strong> Opor-se ao processamento de suas informações pessoais
          </li>
        </ul>
        <p className="mt-4">
          Para exercer esses direitos, entre em contato conosco através dos canais de suporte disponíveis em nossa plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">8. Cookies e Tecnologias Similares</h2>
        <p>
          Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do serviço e personalizar 
          conteúdo. Para mais informações, consulte nossa Política de Cookies.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">9. Privacidade de Menores</h2>
        <p>
          Nossos serviços são destinados a usuários com 18 anos ou mais. Não coletamos intencionalmente informações pessoais 
          de menores de 18 anos. Se tomarmos conhecimento de que coletamos informações de um menor sem consentimento dos 
          pais, tomaremos medidas para excluir essas informações.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">10. Transferência Internacional de Dados</h2>
        <p>
          Seus dados podem ser processados e armazenados em servidores localizados fora do Brasil. Ao utilizar nosso serviço, 
          você consente com a transferência de suas informações para esses servidores. Garantimos que medidas adequadas de 
          segurança sejam implementadas para proteger seus dados.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">11. Alterações nesta Política</h2>
        <p>
          Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas 
          publicando a nova política nesta página e atualizando a data de "Última atualização". Recomendamos que você revise 
          esta política regularmente.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-light">12. Contato</h2>
        <p>
          Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de Privacidade ou ao tratamento 
          de suas informações pessoais, entre em contato conosco através dos canais de suporte disponíveis em nossa plataforma.
        </p>
      </section>
    </>
  )
}

