# Política de Segurança da Informação - Athletia

**Versão**: 1.0  
**Data**: 2024-12-20  
**Última Revisão**: 2024-12-20

---

## 1. OBJETIVO

Esta política estabelece diretrizes e procedimentos para garantir a segurança da informação no sistema Athletia, protegendo dados de usuários, integridade do sistema e continuidade dos serviços.

---

## 2. DADOS SENSÍVEIS

### 2.1 Definição

São considerados dados sensíveis:

- **Dados Pessoais**:
  - Email
  - Nome completo
  - Data de nascimento
  - Telefone
  - Dados de pagamento (quando aplicável)

- **Dados de Autenticação**:
  - Senhas (sempre hasheadas com bcrypt)
  - Tokens JWT
  - Refresh tokens
  - Secrets MFA

- **Dados de Saúde**:
  - Peso
  - Percentual de gordura
  - Lesões
  - Histórico de treinos

- **Dados de Infraestrutura**:
  - Chaves de API
  - Secrets de banco de dados
  - Credenciais de serviços externos

---

## 3. RESPONSABILIDADES

### 3.1 Desenvolvedores

- Implementar validações de entrada em todos os endpoints
- Validar ownership de recursos (prevenção IDOR)
- Não logar dados sensíveis
- Usar apenas bibliotecas atualizadas e seguras
- Revisar código antes de merge

### 3.2 Administradores

- Configurar backups automáticos
- Monitorar logs de segurança
- Responder a incidentes de segurança
- Gerenciar acessos e permissões
- Manter MFA ativado

### 3.3 Usuários

- Usar senhas fortes (mínimo 8 caracteres)
- Não compartilhar credenciais
- Reportar atividades suspeitas

---

## 4. CONTROLES DE ACESSO

### 4.1 Princípio do Menor Privilégio

- Usuários têm acesso apenas aos seus próprios recursos
- Admins têm acesso administrativo apenas quando necessário
- Acesso ao banco de dados restrito a IPs autorizados

### 4.2 Autenticação

- Senhas: Hash bcrypt com salt (10 rounds)
- Tokens JWT: Expiração curta (15 minutos)
- Refresh tokens: Rotacionáveis, expiração 7 dias
- MFA: Obrigatório para administradores (TOTP)

### 4.3 Autorização

- Validação de ownership em todos os endpoints
- Middleware de autenticação em rotas protegidas
- Verificação de role para ações administrativas

---

## 5. PROTEÇÃO DE DADOS

### 5.1 Criptografia

- **Em Trânsito**: HTTPS/TLS obrigatório
- **Em Repouso**: 
  - Dados sensíveis (telefone) podem ser criptografados
  - Senhas sempre hasheadas (não reversível)
  - Secrets em variáveis de ambiente

### 5.2 Retenção e Exclusão

- **Retenção**: Dados mantidos enquanto conta estiver ativa
- **Exclusão**: 
  - Usuário pode solicitar exclusão via `/api/user/delete-account`
  - Dados pessoais removidos
  - Dados de treinos anonimizados (para estatísticas)
  - Soft delete (marca como deletado, não remove fisicamente)

### 5.3 Backups

- Backups diários do banco de dados
- Retenção: 7 dias
- Criptografia: Recomendado (opcional)
- Teste de restore: Mensalmente

---

## 6. LOGS E MONITORAMENTO

### 6.1 Logs de Segurança

Eventos logados:

- Tentativas de login falhadas
- Tentativas de IDOR
- Rate limit excedido
- Acessos administrativos
- Uploads suspeitos

### 6.2 Sanitização

- Emails: Hash parcial (não reversível)
- Telefones: Últimos 4 dígitos apenas
- Nomes: Primeira letra apenas
- Senhas: Nunca logadas

### 6.3 Monitoramento

- Script de monitoramento executa a cada 5 minutos
- Alertas para padrões suspeitos
- Logs centralizados (arquivo ou serviço externo)

---

## 7. DESENVOLVIMENTO SEGURO

### 7.1 Validação de Entrada

- Todas as entradas validadas com express-validator
- Sanitização de dados antes de processar
- Validação de tipos e formatos

### 7.2 Dependências

- `npm audit` executado regularmente
- Dependências atualizadas
- Git-secrets para prevenir commit de secrets

### 7.3 Código

- Revisão de código antes de merge
- Testes de segurança (IDOR, XSS, etc)
- Documentação de vulnerabilidades conhecidas

---

## 8. INFRAESTRUTURA

### 8.1 Rede

- Firewall ativo
- PostgreSQL acessível apenas de IPs autorizados
- HTTPS obrigatório em produção

### 8.2 Secrets

- Secrets em variáveis de ambiente (`.env`)
- `.env` nunca commitado no Git
- Permissões restritas no arquivo (chmod 600)

### 8.3 Containers/Deploy

- Imagens minimalistas
- Sem secrets hardcoded
- Usuário não-root quando possível

---

## 9. INCIDENTES DE SEGURANÇA

### 9.1 Detecção

- Monitoramento automático
- Alertas por email/log
- Revisão manual de logs

### 9.2 Resposta

1. **Identificar**: Tipo e escopo do incidente
2. **Contenção**: Isolar sistema afetado
3. **Eradicação**: Remover causa raiz
4. **Recuperação**: Restaurar serviços
5. **Documentação**: Registrar lições aprendidas

### 9.3 Comunicação

- Notificar usuários afetados (se necessário)
- Documentar incidente
- Implementar correções preventivas

---

## 10. CONFORMIDADE

### 10.1 LGPD

- Direito à exclusão de dados implementado
- Política de privacidade disponível
- Consentimento explícito para dados sensíveis

### 10.2 Revisão

- Política revisada anualmente
- Atualizações conforme necessário
- Versionamento de mudanças

---

## 11. CONTATO

Para questões de segurança, entre em contato:
- Email: suporte@athletia.site
- Issues de segurança: Reportar via GitHub (se aplicável)

---

**Próxima Revisão**: 2025-12-20

