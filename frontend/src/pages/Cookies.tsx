import { Link } from 'react-router-dom'

export default function Cookies() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark text-light">
      {/* Header */}
      <header className="w-full py-4 md:py-5 px-4 md:px-6 border-b border-grey/30 sticky top-0 z-50 bg-dark/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5 md:gap-3">
            <img
              src="/favicon.svg"
              alt="Logo AthletIA"
              className="w-8 h-8 md:w-10 md:h-10 rounded-2xl shadow-lg"
              loading="eager"
              width="40"
              height="40"
            />
            <div className="text-lg md:text-xl font-display font-bold tracking-tight text-light">AthletIA</div>
          </Link>
          <Link
            to="/"
            className="text-sm md:text-base font-medium text-light-muted hover:text-primary transition-colors px-3 py-1.5"
          >
            Voltar
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="space-y-8">
          <div className="text-center space-y-4 pb-8 border-b border-grey/20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-light">
              Política de Cookies
            </h1>
            <p className="text-lg text-light-muted">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-light-muted leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-light">1. O que são Cookies?</h2>
              <p>
                Cookies são pequenos arquivos de texto armazenados em seu dispositivo (computador, tablet ou celular) quando você 
                visita um site. Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente, bem como 
                para fornecer informações aos proprietários do site.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-light">2. Como Usamos Cookies</h2>
              <p>
                O AthletIA utiliza cookies para diversos propósitos, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong className="text-light">Autenticação:</strong> Manter você conectado à sua conta
                </li>
                <li>
                  <strong className="text-light">Preferências:</strong> Lembrar suas configurações e preferências
                </li>
                <li>
                  <strong className="text-light">Análise:</strong> Entender como você utiliza nosso serviço para melhorias
                </li>
                <li>
                  <strong className="text-light">Segurança:</strong> Proteger contra atividades fraudulentas
                </li>
                <li>
                  <strong className="text-light">Marketing:</strong> Personalizar anúncios e medir eficácia de campanhas
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-light">3. Tipos de Cookies que Utilizamos</h2>
              
              <h3 className="text-xl font-semibold text-light mt-4">3.1. Cookies Essenciais</h3>
              <p>
                Esses cookies são necessários para o funcionamento básico do site e não podem ser desativados. Eles geralmente são 
                definidos apenas em resposta a ações feitas por você, como definir suas preferências de privacidade, fazer login ou 
                preencher formulários.
              </p>

              <h3 className="text-xl font-semibold text-light mt-4">3.2. Cookies de Performance</h3>
              <p>
                Esses cookies nos permitem contar visitas e fontes de tráfego para que possamos medir e melhorar o desempenho do 
                nosso site. Eles nos ajudam a saber quais páginas são mais e menos populares e ver como os visitantes se movem pelo 
                site.
              </p>

              <h3 className="text-xl font-semibold text-light mt-4">3.3. Cookies de Funcionalidade</h3>
              <p>
                Esses cookies permitem que o site forneça funcionalidades e personalização aprimoradas. Podem ser definidos por nós 
                ou por fornecedores terceirizados cujos serviços adicionamos às nossas páginas.
              </p>

              <h3 className="text-xl font-semibold text-light mt-4">3.4. Cookies de Marketing</h3>
              <p>
                Esses cookies podem ser definidos através do nosso site por nossos parceiros de publicidade. Podem ser usados por 
                essas empresas para construir um perfil de seus interesses e mostrar-lhe anúncios relevantes em outros sites.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-light">4. Cookies de Terceiros</h2>
              <p>
                Alguns cookies são colocados por serviços de terceiros que aparecem em nossas páginas. Estes incluem:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong className="text-light">Google Analytics:</strong> Para análise de tráfego e comportamento dos usuários
                </li>
                <li>
                  <strong className="text-light">Google Ads:</strong> Para rastreamento de conversões e personalização de anúncios
                </li>
                <li>
                  <strong className="text-light">Provedores de Pagamento:</strong> Para processar transações de forma segura
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-light">5. Gerenciamento de Cookies</h2>
              <p>
                Você tem controle sobre os cookies. A maioria dos navegadores permite que você:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Veja quais cookies você tem e exclua-os individualmente</li>
                <li>Bloqueie cookies de terceiros</li>
                <li>Bloqueie cookies de sites específicos</li>
                <li>Bloqueie todos os cookies</li>
                <li>Exclua todos os cookies quando fechar o navegador</li>
              </ul>
              <p className="mt-4">
                <strong className="text-light">Importante:</strong> Se você bloquear ou excluir cookies, algumas funcionalidades 
                do nosso site podem não funcionar corretamente. Por exemplo, você pode precisar fazer login novamente a cada vez 
                que visitar o site.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-light">6. Como Gerenciar Cookies em Seu Navegador</h2>
              
              <h3 className="text-xl font-semibold text-light mt-4">Google Chrome</h3>
              <p>
                Configurações → Privacidade e segurança → Cookies e outros dados de sites
              </p>

              <h3 className="text-xl font-semibold text-light mt-4">Mozilla Firefox</h3>
              <p>
                Opções → Privacidade e Segurança → Cookies e Dados de Sites
              </p>

              <h3 className="text-xl font-semibold text-light mt-4">Safari</h3>
              <p>
                Preferências → Privacidade → Gerenciar Dados do Site
              </p>

              <h3 className="text-xl font-semibold text-light mt-4">Microsoft Edge</h3>
              <p>
                Configurações → Cookies e permissões de site → Cookies e dados de sites
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-light">7. Cookies e Dispositivos Móveis</h2>
              <p>
                Em dispositivos móveis, você pode gerenciar cookies através das configurações do navegador. Os processos podem variar 
                dependendo do dispositivo e do navegador utilizado.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-light">8. Atualizações desta Política</h2>
              <p>
                Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossas práticas ou por outras 
                razões operacionais, legais ou regulatórias. Recomendamos que você revise esta política regularmente para se manter 
                informado sobre nosso uso de cookies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-light">9. Mais Informações</h2>
              <p>
                Para mais informações sobre cookies e como eles funcionam, você pode visitar:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    www.allaboutcookies.org
                  </a>
                </li>
                <li>
                  <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    www.youronlinechoices.com
                  </a>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-light">10. Contato</h2>
              <p>
                Se você tiver dúvidas sobre nossa Política de Cookies, entre em contato conosco através dos canais de suporte 
                disponíveis em nossa plataforma.
              </p>
            </section>
          </div>

          <div className="pt-8 border-t border-grey/20 text-center">
            <Link
              to="/"
              className="btn-primary inline-block px-8 py-3 font-bold"
            >
              Voltar para o início
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 md:py-12 px-4 md:px-6 border-t border-grey/20 bg-dark mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs md:text-sm text-light-muted">
            © {new Date().getFullYear()} AthletIA. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

