# Relatório de Auditoria SAST - AthletIA SaaS

**Data:** 2024-12-20  
**Escopo:** Análise estática completa de segurança do código fonte  
**Formato:** [Arquivo] / [Linha] / [Falha] / [Risco] / [Como Explorar] / [Como Corrigir]

---

## 1. HARDCODED SECRETS

### 1.1 Secret de Webhook Exposto em Arquivo de Exemplo
**Arquivo:** `backend/env.example.txt`  
**Linha:** 19  
**Falha:** Secret real do webhook Cakto (`CAKTO_WEBHOOK_SECRET="83d08ba9-14bd-459f-8fd9-0a816ba5a089"`) está hardcoded no arquivo de exemplo  
**Risco:** CRÍTICO - Permite falsificar webhooks de pagamento, ativando planos sem pagamento real  
**Como Explorar:** 
1. Acessar o arquivo `env.example.txt` no repositório
2. Extrair o secret `83d08ba9-14bd-459f-8fd9-0a816ba5a089`
3. Enviar webhook falso para `/api/webhooks/cakto` com o secret no body JSON
4. Ativar plano de qualquer usuário sem pagamento

**Como Corrigir:**
- Remover o secret real do arquivo de exemplo
- Usar placeholder genérico: `CAKTO_WEBHOOK_SECRET="seu-webhook-secret-aqui"`
- Gerar novo secret no painel do Cakto
- Adicionar `env.example.txt` ao `.gitignore` se contiver valores reais

---

## 2. VALIDAÇÃO DE WEBHOOK INSEGURA

### 2.1 Fallback de Validação por Secret no JSON
**Arquivo:** `backend/src/routes/webhook.routes.ts`  
**Linha:** 58-65  
**Falha:** Sistema aceita validação por secret no JSON body como fallback se HMAC falhar  
**Risco:** ALTO - Permite bypass da validação HMAC SHA256, falsificando webhooks  
**Como Explorar:**
1. Enviar POST para `/api/webhooks/cakto`
2. Incluir `"secret": "83d08ba9-14bd-459f-8fd9-0a816ba5a089"` no body JSON
3. Incluir evento `purchase_approved` com email de qualquer usuário
4. Sistema ativará plano sem validação HMAC adequada

**Como Corrigir:**
- Remover completamente o fallback de validação por secret no JSON (linhas 58-65)
- Manter apenas validação HMAC SHA256 via header `x-cakto-signature`
- Rejeitar webhooks sem assinatura HMAC válida
- Logar tentativas de bypass para monitoramento

---

## 3. EXPOSIÇÃO DE INFORMAÇÕES SENSÍVEIS

### 3.1 Senha Retornada em Resposta JSON (Development)
**Arquivo:** `backend/src/controllers/auth.controller.ts`  
**Linha:** 549  
**Falha:** Senha gerada automaticamente é retornada no JSON em modo development  
**Risco:** MÉDIO - Senha pode vazar em logs, histórico do navegador, ou ser exposta acidentalmente  
**Como Explorar:**
1. Fazer cadastro completo via `/api/auth/cadastro-completo`
2. Resposta JSON conterá campo `senhaGerada` com a senha em texto plano
3. Senha pode ser capturada em logs do servidor, proxy, ou histórico do navegador

**Como Corrigir:**
- Nunca retornar senha em resposta JSON, mesmo em development
- Enviar senha apenas via email seguro
- Se necessário para testes, usar apenas console.log no servidor (não enviar ao cliente)
- Implementar serviço de email para envio seguro de credenciais

### 3.2 Stack Trace Exposto em Development
**Arquivo:** `backend/src/index.ts`  
**Linha:** 269  
**Falha:** Stack trace completo é exposto em respostas de erro quando `NODE_ENV === 'development'`  
**Risco:** MÉDIO - Vazamento de informações sobre estrutura do código, caminhos de arquivos, dependências  
**Como Explorar:**
1. Forçar erro em qualquer endpoint (ex: enviar dados inválidos)
2. Resposta incluirá `stack` com caminhos de arquivos, nomes de funções, estrutura do código
3. Informações podem ser usadas para mapear a aplicação e identificar vulnerabilidades

**Como Corrigir:**
- Remover exposição de stack trace mesmo em development
- Usar apenas mensagens de erro genéricas para o cliente
- Logar stack trace apenas no servidor (console.error)
- Em produção, garantir que `NODE_ENV=production` está configurado

### 3.3 Stack Trace em Erros de Perfil
**Arquivo:** `backend/src/controllers/perfil.controller.ts`  
**Linha:** 154  
**Falha:** Stack trace exposto em erros quando `NODE_ENV === 'development'`  
**Risco:** MÉDIO - Mesmo problema de vazamento de informações  
**Como Explorar:** Similar ao 3.2, forçando erro no endpoint de perfil

**Como Corrigir:** Mesma correção do 3.2

---

## 4. CONFIGURAÇÕES INSECURAS

### 4.1 CORS Configurado por Variável de Ambiente
**Arquivo:** `backend/src/index.ts`  
**Linha:** 64  
**Falha:** CORS permite apenas `FRONTEND_URL` do ambiente, mas se mal configurado pode permitir qualquer origem  
**Risco:** MÉDIO - Se `FRONTEND_URL` não estiver configurado ou for `*`, permite requisições de qualquer origem  
**Como Explorar:**
1. Verificar se `FRONTEND_URL` está configurado no `.env`
2. Se não estiver ou for `*`, qualquer site pode fazer requisições autenticadas
3. Explorar vulnerabilidades CSRF ou roubo de tokens

**Como Corrigir:**
- Validar que `FRONTEND_URL` está configurado e não é `*`
- Usar whitelist explícita de origens permitidas
- Adicionar validação no startup: `if (!FRONTEND_URL || FRONTEND_URL === '*') throw new Error('FRONTEND_URL inválido')`
- Considerar usar array de origens permitidas para múltiplos ambientes

### 4.2 Trust Proxy Configurado
**Arquivo:** `backend/src/index.ts`  
**Linha:** 37  
**Falha:** `app.set('trust proxy', 1)` confia em 1 proxy para rate limiting  
**Risco:** MÉDIO - Se proxy não for confiável ou for comprometido, rate limiting pode ser bypassado via header `X-Forwarded-For`  
**Como Explorar:**
1. Se atacante controlar proxy ou header `X-Forwarded-For`
2. Pode falsificar IP para bypass de rate limiting
3. Realizar ataques de brute force ou DoS

**Como Corrigir:**
- Validar que está atrás de proxy confiável (nginx, cloudflare)
- Configurar whitelist de IPs de proxy confiáveis
- Usar `trust proxy` apenas em produção com proxy conhecido
- Adicionar validação de IP real vs X-Forwarded-For

### 4.3 Rate Limiting Muito Permissivo
**Arquivo:** `backend/src/index.ts`  
**Linha:** 48  
**Falha:** Rate limit geral permite 500 requisições por 15 minutos por IP  
**Risco:** BAIXO - Pode permitir DoS ou abuso, mas não é crítico  
**Como Explorar:**
1. Fazer 500 requisições em 15 minutos
2. Ainda há margem para abuso antes de ser bloqueado

**Como Corrigir:**
- Reduzir para 200-300 requisições por 15 minutos
- Implementar rate limiting diferenciado por tipo de endpoint
- Adicionar rate limiting mais restritivo para endpoints sensíveis

---

## 5. VALIDAÇÕES INSUFICIENTES

### 5.1 Query Parameter Email sem Validação Adequada
**Arquivo:** `backend/src/controllers/payment.controller.ts`  
**Linha:** 72, 116  
**Falha:** Email de query parameter usado sem validação de formato ou sanitização  
**Risco:** MÉDIO - Possível acesso a dados de pagamento de outros usuários se email não for validado  
**Como Explorar:**
1. Fazer requisição autenticada para `/api/payment/status?email=outro@usuario.com`
2. Sistema pode retornar dados de pagamento de outro usuário
3. Similar para `/api/payment/historico?email=outro@usuario.com`

**Como Corrigir:**
- Sempre usar email do usuário autenticado (`req.userId`)
- Remover fallback para query parameter de email
- Se necessário query param, validar que email pertence ao usuário autenticado
- Adicionar validação de formato de email com `isValidEmail()`

### 5.2 Validação de Path Traversal Básica
**Arquivo:** `backend/src/middleware/upload.middleware.ts`  
**Linha:** 14-19  
**Falha:** Validação de ID usa regex básica que pode ter bypass  
**Risco:** MÉDIO - Path traversal pode permitir upload de arquivos fora do diretório permitido  
**Como Explorar:**
1. Tentar IDs com encoding: `%2e%2e%2f`, `..%2f`, etc.
2. Usar caracteres Unicode que normalizam para `..` ou `/`
3. Bypass da validação regex

**Como Corrigir:**
- Usar `path.resolve()` e verificar se caminho final está dentro do diretório base
- Normalizar caminho antes de validar
- Usar `path.join()` e verificar que não contém `..`
- Validar que caminho resolvido começa com diretório base esperado

### 5.3 Validação de Limite de Paginação Incompleta
**Arquivo:** `backend/src/controllers/admin.controller.ts`  
**Linha:** 44  
**Falha:** Limite de paginação validado, mas `skip` pode ser negativo causando comportamento inesperado  
**Risco:** BAIXO - Pode causar erros ou comportamento inesperado, mas não é crítico  
**Como Explorar:**
1. Enviar `page=-1` ou `limit=-10`
2. `skip` calculado pode ser negativo
3. Comportamento inesperado na query

**Como Corrigir:**
- Já corrigido parcialmente (linha 31: `Math.max(0, skip)`)
- Adicionar validação de `page >= 1` e `limit > 0`
- Retornar erro 400 se valores inválidos

### 5.4 Validação de Peso sem Verificação de NaN
**Arquivo:** `backend/src/controllers/peso.controller.ts`  
**Linha:** 15  
**Falha:** `parseFloat(peso)` pode resultar em `NaN` se `peso` não for número válido  
**Risco:** BAIXO - Pode causar erro no banco ou comportamento inesperado  
**Como Explorar:**
1. Enviar `peso: "abc"` ou `peso: null`
2. `parseFloat()` retorna `NaN`
3. Erro ao inserir no banco ou valor inválido armazenado

**Como Corrigir:**
- Validar que `peso` é número válido antes de `parseFloat()`
- Usar `express-validator` que já está na rota (linha 17)
- Verificar `!isNaN(parseFloat(peso))` antes de usar

---

## 6. FALHAS EM PERMISSÕES E ACL (IDOR)

### 6.1 Verificação de Propriedade de Treino
**Arquivo:** `backend/src/services/treino-query.service.ts`  
**Linha:** 99-122  
**Falha:** Função `buscarTreinoCompleto` verifica `userId` no where, mas outros endpoints podem não verificar  
**Risco:** MÉDIO - Possível acesso a treinos de outros usuários se validação não for feita em todos os endpoints  
**Como Explorar:**
1. Obter ID de treino de outro usuário (via enumeração ou informação vazada)
2. Fazer requisição para endpoint que não verifica propriedade
3. Acessar treino de outro usuário

**Como Corrigir:**
- Garantir que todos os endpoints que acessam treinos verificam `userId` do token JWT
- Usar sempre `userId` do `req.userId` (do middleware de autenticação)
- Nunca confiar em IDs enviados pelo cliente sem verificar propriedade
- Adicionar validação explícita: `if (treino.userId !== req.userId) return 403`

### 6.2 Verificação de Propriedade em Treinos Personalizados
**Arquivo:** `backend/src/controllers/treino-personalizado.controller.ts`  
**Linha:** 82, 106, 136, 255, 279, 309  
**Falha:** Endpoints dependem do service para verificar propriedade, mas se service falhar, pode haver IDOR  
**Risco:** MÉDIO - Acesso não autorizado a treinos/templates de outros usuários  
**Como Explorar:**
1. Obter ID de treino personalizado de outro usuário
2. Tentar editar/deletar via endpoints
3. Se service não verificar corretamente, operação pode ser bem-sucedida

**Como Corrigir:**
- Verificar no controller que recurso pertence ao usuário antes de chamar service
- Service deve sempre receber `userId` e verificar propriedade
- Retornar 404 (não 403) se recurso não existir para não vazar informações
- Adicionar testes para garantir que IDOR não é possível

### 6.3 Verificação de Propriedade em Exercícios de Treino
**Arquivo:** `backend/src/controllers/treino.controller.ts`  
**Linha:** 123, 224  
**Falha:** Endpoints de exercício de treino podem não verificar se exercício pertence a treino do usuário  
**Risco:** MÉDIO - Possível marcar exercícios de treinos de outros usuários como concluídos  
**Como Explorar:**
1. Obter ID de `ExercicioTreino` de outro usuário
2. Fazer POST para `/api/treino/exercicio/:id/concluir`
3. Se não verificar propriedade, pode concluir exercício de outro usuário

**Como Corrigir:**
- Service `concluirExercicio` deve verificar que `exercicioTreino.treino.userId === userId`
- Adicionar validação explícita no service antes de atualizar
- Retornar 404 se exercício não pertencer ao usuário

---

## 7. FALHAS NOS FLUXOS DE AUTENTICAÇÃO

### 7.1 Refresh Token sem Verificação de Expiração no Banco
**Arquivo:** `backend/src/controllers/auth.controller.ts`  
**Linha:** 260  
**Falha:** Verifica `expiresAt < new Date()` mas depois verifica assinatura JWT, que pode ter expirado  
**Risco:** BAIXO - Lógica está correta, mas ordem pode ser otimizada  
**Como Explorar:**
- Não explorável diretamente, mas pode haver race condition

**Como Corrigir:**
- Ordem atual está OK, mas pode adicionar verificação de expiração JWT antes de verificar banco
- Limpar tokens expirados periodicamente (job agendado)

### 7.2 Senha Mínima de 6 Caracteres
**Arquivo:** `backend/src/routes/auth.routes.ts`  
**Linha:** 30  
**Falha:** Senha mínima de apenas 6 caracteres é muito fraca  
**Risco:** BAIXO - Senhas fracas são vulneráveis a brute force  
**Como Explorar:**
1. Criar contas com senhas fracas (ex: "123456")
2. Ataques de brute force são mais viáveis

**Como Corrigir:**
- Aumentar mínimo para 8 caracteres
- Adicionar requisitos: maiúscula, minúscula, número, caractere especial
- Implementar verificação de senhas comuns (dictionary check)
- Usar biblioteca como `zxcvbn` para medir força da senha

### 7.3 Rate Limiting de Login Pode Ser Bypassado
**Arquivo:** `backend/src/routes/auth.routes.ts`  
**Linha:** 11  
**Falha:** Rate limit de 15 tentativas por 15 minutos pode ser alto para proteção adequada  
**Risco:** BAIXO - Ainda permite muitas tentativas de brute force  
**Como Explorar:**
1. Tentar 15 senhas diferentes em 15 minutos
2. Se não bloquear IP, pode continuar de outro IP

**Como Corrigir:**
- Reduzir para 5 tentativas por 15 minutos
- Implementar bloqueio temporário de conta após 3 tentativas falhadas
- Adicionar CAPTCHA após 3 tentativas
- Bloquear IP após múltiplas tentativas falhadas

---

## 8. SQL INJECTION / NoSQL INJECTION

### 8.1 Uso de Prisma ORM (Proteção)
**Arquivo:** Múltiplos  
**Linha:** N/A  
**Falha:** Nenhuma - Prisma ORM usa queries parametrizadas  
**Risco:** NENHUM - Prisma protege contra SQL injection  
**Como Explorar:** Não explorável

**Como Corrigir:** N/A - Já está protegido

**Nota:** Não foram encontradas vulnerabilidades de SQL/NoSQL injection devido ao uso de Prisma ORM que usa queries parametrizadas.

---

## 9. XSS (CROSS-SITE SCRIPTING)

### 9.1 Sanitização de Input em Busca
**Arquivo:** `backend/src/controllers/admin.controller.ts`  
**Linha:** 35  
**Falha:** Input de busca é sanitizado, mas pode não ser suficiente para prevenir XSS se retornado ao frontend  
**Risco:** BAIXO - Se frontend não sanitizar ao renderizar, pode haver XSS refletido  
**Como Explorar:**
1. Fazer busca com payload XSS: `search=<script>alert('XSS')</script>`
2. Se frontend renderizar sem sanitizar, XSS será executado

**Como Corrigir:**
- Frontend deve sanitizar todos os inputs do usuário ao renderizar
- Usar biblioteca como `DOMPurify` no frontend
- Nunca usar `dangerouslySetInnerHTML` com dados do usuário
- Validar que frontend está sanitizando corretamente

### 9.2 Dados do Usuário Retornados sem Sanitização
**Arquivo:** Múltiplos controllers  
**Linha:** N/A  
**Falha:** Dados como `nome`, `descricao` são retornados sem sanitização explícita  
**Risco:** BAIXO - Depende do frontend sanitizar, mas backend deveria garantir  
**Como Explorar:**
- Similar ao 9.1, se frontend não sanitizar

**Como Corrigir:**
- Sanitizar todos os campos de texto antes de retornar ao frontend
- Usar função `sanitizeString()` já existente em `utils/dto.ts`
- Aplicar sanitização em todos os campos de texto retornados

---

## 10. CSRF (CROSS-SITE REQUEST FORGERY)

### 10.1 Ausência de Proteção CSRF
**Arquivo:** `backend/src/index.ts`  
**Linha:** N/A  
**Falha:** Não há proteção CSRF implementada (tokens CSRF)  
**Risco:** MÉDIO - Ataques CSRF podem realizar ações em nome do usuário autenticado  
**Como Explorar:**
1. Criar site malicioso que faz requisições para API
2. Se usuário estiver autenticado, requisições serão feitas com cookies/tokens
3. Ações podem ser executadas sem conhecimento do usuário

**Como Corrigir:**
- Implementar tokens CSRF para requisições state-changing (POST, PUT, DELETE)
- Usar biblioteca como `csurf` ou `csrf`
- Gerar token CSRF no login e validar em todas as requisições modificadoras
- Adicionar header customizado `X-CSRF-Token` ou usar cookie `csrf-token`

---

## 11. FALHAS LÓGICAS DE SEGURANÇA

### 11.1 Bypass de Validação de Webhook
**Arquivo:** `backend/src/routes/webhook.routes.ts`  
**Linha:** 58-65  
**Falha:** Fallback permite bypass da validação HMAC principal  
**Risco:** ALTO - Já mencionado em 2.1, mas é também falha lógica  
**Como Explorar:** Ver 2.1

**Como Corrigir:** Ver 2.1

### 11.2 Validação de Plano Ativo com Query a Cada Requisição
**Arquivo:** `backend/src/middleware/plano.middleware.ts`  
**Linha:** 14-17  
**Falha:** Query ao banco a cada requisição para verificar plano ativo  
**Risco:** BAIXO - Performance, mas pode ser cacheado no token JWT  
**Como Explorar:**
- Não explorável diretamente, mas impacta performance

**Como Corrigir:**
- Adicionar `planoAtivo` ao payload do JWT
- Verificar no middleware sem query ao banco
- Invalidar token se plano mudar (forçar re-login)
- Ou cachear resultado por alguns minutos

### 11.3 Admin Middleware com Query a Cada Requisição
**Arquivo:** `backend/src/middleware/admin.middleware.ts`  
**Linha:** 23-26  
**Falha:** Query ao banco a cada requisição admin para verificar role  
**Risco:** BAIXO - Performance e possível cache de role  
**Como Explorar:**
- Não explorável, mas impacta performance

**Como Corrigir:**
- Adicionar `role` ao payload do JWT
- Verificar role no middleware sem query
- Invalidar token se role mudar

---

## 12. PONTOS DE BYPASS

### 12.1 Bypass de Rate Limiting via Trust Proxy
**Arquivo:** `backend/src/index.ts`  
**Linha:** 37, 48  
**Falha:** Se proxy não for confiável, rate limiting pode ser bypassado  
**Risco:** MÉDIO - Já mencionado em 4.2  
**Como Explorar:** Ver 4.2

**Como Corrigir:** Ver 4.2

### 12.2 Bypass de Validação de Upload via Encoding
**Arquivo:** `backend/src/middleware/upload.middleware.ts`  
**Linha:** 14-19  
**Falha:** Validação pode ser bypassada com encoding de caracteres  
**Risco:** MÉDIO - Já mencionado em 5.2  
**Como Explorar:** Ver 5.2

**Como Corrigir:** Ver 5.2

### 12.3 Bypass de Validação de Webhook
**Arquivo:** `backend/src/routes/webhook.routes.ts`  
**Linha:** 58-65  
**Falha:** Fallback permite bypass da validação HMAC  
**Risco:** ALTO - Já mencionado em 2.1 e 11.1  
**Como Explorar:** Ver 2.1

**Como Corrigir:** Ver 2.1

---

## 13. VALIDAÇÕES DE ARQUIVO

### 13.1 Validação de Tipo MIME Apenas por Extensão
**Arquivo:** `backend/src/middleware/upload-media.middleware.ts`  
**Linha:** 27-36  
**Falha:** Valida apenas extensão, não valida magic bytes antes do upload  
**Risco:** MÉDIO - Arquivo malicioso pode ser renomeado com extensão válida  
**Como Explorar:**
1. Renomear arquivo `.exe` para `.jpg`
2. Upload pode ser aceito se passar validação de extensão
3. Arquivo malicioso armazenado no servidor

**Como Corrigir:**
- Validar magic bytes (file signature) antes de aceitar upload
- Função `validateMediaFile()` já existe em `utils/file-validation.ts`
- Aplicar validação de magic bytes no middleware de upload
- Rejeitar arquivo se tipo MIME não corresponder à extensão

### 13.2 Validação de Tamanho de Arquivo
**Arquivo:** `backend/src/utils/file-validation.ts`  
**Linha:** 6  
**Falha:** Limite de 5MB pode ser alto para alguns tipos de arquivo  
**Risco:** BAIXO - Pode permitir DoS por upload de arquivos grandes  
**Como Explorar:**
1. Fazer múltiplos uploads de 5MB
2. Pode esgotar espaço em disco ou recursos do servidor

**Como Corrigir:**
- Reduzir limite para 2-3MB para imagens
- Implementar limite total de uploads por usuário
- Monitorar uso de disco
- Implementar limpeza automática de arquivos antigos

---

## 14. LOGS E MONITORAMENTO

### 14.1 Logs com Informações Sensíveis
**Arquivo:** `backend/src/controllers/auth.controller.ts`  
**Linha:** 195, 210, 216, 222  
**Falha:** Logs contêm emails e informações de autenticação  
**Risco:** BAIXO - Se logs forem comprometidos, informações sensíveis vazam  
**Como Explorar:**
- Se atacante acessar logs do servidor, pode ver emails e tentativas de login

**Como Corrigir:**
- Não logar emails completos, apenas hash ou parte do email
- Não logar informações de autenticação
- Usar níveis de log apropriados (debug vs info)
- Sanitizar logs antes de armazenar

### 14.2 Console.log em Produção
**Arquivo:** Múltiplos arquivos  
**Linha:** N/A  
**Falha:** Muitos `console.log` que podem vazar informações em produção  
**Risco:** BAIXO - Logs podem vazar informações se acessados  
**Como Explorar:**
- Se logs forem expostos, informações podem vazar

**Como Corrigir:**
- Usar biblioteca de logging estruturado (ex: `winston`, `pino`)
- Remover `console.log` de produção
- Usar níveis de log apropriados
- Configurar logging apenas para desenvolvimento

---

## 15. VALIDAÇÃO DE INPUT ADICIONAL

### 15.1 Validação de Array sem Verificação de Tipo
**Arquivo:** `backend/src/controllers/perfil.controller.ts`  
**Linha:** 87-89, 216-218  
**Falha:** Arrays como `lesoes`, `equipamentos`, `preferencias` são validados apenas com `Array.isArray()`  
**Risco:** BAIXO - Se array contiver tipos inválidos, pode causar problemas  
**Como Explorar:**
1. Enviar array com objetos ou tipos inválidos: `lesoes: [1, 2, {malicioso: true}]`
2. Pode causar erro ou comportamento inesperado

**Como Corrigir:**
- Validar que todos os elementos do array são strings
- Usar `lesoes.every(item => typeof item === 'string')`
- Sanitizar cada elemento do array
- Limitar tamanho do array (ex: máximo 20 itens)

### 15.2 Validação de Data sem Verificação de Formato
**Arquivo:** `backend/src/controllers/treino.controller.ts`  
**Linha:** 16, 79  
**Falha:** Datas são convertidas com `new Date()` sem validação de formato  
**Risco:** BAIXO - Datas inválidas podem causar comportamento inesperado  
**Como Explorar:**
1. Enviar data inválida: `data: "invalid"`
2. `new Date("invalid")` retorna `Invalid Date`
3. Pode causar erro em queries ou lógica de data

**Como Corrigir:**
- Validar formato de data antes de converter
- Usar biblioteca como `date-fns` ou `moment` para validação
- Verificar que `!isNaN(new Date(data).getTime())` antes de usar
- Retornar erro 400 se data inválida

---

## 16. ARMAZENAMENTO DE TOKENS NO FRONTEND

### 16.1 Tokens Armazenados em localStorage
**Arquivo:** `frontend/src/contexts/AuthContext.tsx`  
**Linha:** 32, 54-56, 73-75, 82-84, 92-95  
**Falha:** Tokens JWT armazenados em `localStorage` são vulneráveis a XSS  
**Risco:** MÉDIO - Se houver vulnerabilidade XSS, atacante pode roubar tokens do localStorage  
**Como Explorar:**
1. Explorar vulnerabilidade XSS no frontend
2. Executar JavaScript malicioso: `localStorage.getItem('accessToken')`
3. Enviar token para servidor do atacante
4. Usar token para acessar conta da vítima

**Como Corrigir:**
- Considerar usar `httpOnly` cookies para tokens (requer mudanças no backend)
- Se manter localStorage, garantir que não há vulnerabilidades XSS
- Implementar Content Security Policy (CSP) rigorosa
- Adicionar rotação de tokens mais frequente
- Implementar detecção de uso suspeito de tokens

### 16.2 Dados do Usuário em localStorage
**Arquivo:** `frontend/src/contexts/AuthContext.tsx`  
**Linha:** 33, 56, 75, 95, 102  
**Falha:** Dados do usuário armazenados em `localStorage` podem vazar informações  
**Risco:** BAIXO - Se houver XSS, dados podem ser acessados  
**Como Explorar:** Similar ao 16.1

**Como Corrigir:**
- Não armazenar dados sensíveis em localStorage
- Armazenar apenas ID do usuário, buscar dados completos via API quando necessário
- Implementar cache seguro com expiração
- Considerar usar sessionStorage para dados temporários

---

## 17. VALIDAÇÃO DE AUTENTICAÇÃO NO FRONTEND

### 17.1 Verificação de Autenticação Apenas por Token no localStorage
**Arquivo:** `frontend/src/contexts/AuthContext.tsx`  
**Linha:** 32-44  
**Falha:** Autenticação verificada apenas pela presença de token no localStorage, sem validar se token é válido  
**Risco:** BAIXO - Token expirado pode ser considerado válido até tentar usar  
**Como Explorar:**
1. Modificar localStorage para adicionar token inválido
2. Aplicação pode considerar usuário autenticado
3. Erro só aparece ao fazer requisição

**Como Corrigir:**
- Validar token no backend ao carregar aplicação
- Fazer requisição para endpoint de verificação de token
- Se token inválido, limpar localStorage e redirecionar para login
- Implementar verificação periódica de validade do token

### 17.2 Ausência de Verificação de Expiração de Token
**Arquivo:** `frontend/src/services/auth.service.ts`  
**Linha:** 86-155  
**Falha:** Renovação de token só acontece após erro 401, não verifica expiração proativamente  
**Risco:** BAIXO - Usuário pode fazer requisições com token expirado  
**Como Explorar:**
- Não explorável diretamente, mas pode causar má experiência do usuário

**Como Corrigir:**
- Decodificar JWT no frontend para verificar expiração
- Renovar token proativamente antes de expirar (ex: 1 minuto antes)
- Implementar verificação de expiração antes de cada requisição crítica

---

## 18. VALIDAÇÃO DE INPUT NO FRONTEND

### 18.1 Dados do Usuário Renderizados sem Sanitização
**Arquivo:** `frontend/src/contexts/AuthContext.tsx`  
**Linha:** 37, 56, 75, 95  
**Falha:** Dados do usuário são parseados de JSON e renderizados sem sanitização explícita  
**Risco:** BAIXO - Se dados contiverem XSS payload, pode ser executado  
**Como Explorar:**
1. Se backend retornar dados com payload XSS (ex: nome com `<script>`)
2. Frontend renderiza sem sanitizar
3. XSS é executado

**Como Corrigir:**
- Sanitizar todos os dados do usuário antes de renderizar
- Usar biblioteca como `DOMPurify` para sanitização
- Nunca usar `dangerouslySetInnerHTML` com dados do usuário
- Validar e sanitizar dados ao receber da API

---

## 19. ENDPOINT DE ATIVAÇÃO DE PLANO SEM AUTENTICAÇÃO

### 19.1 Ativação de Plano por userId no Body (IDOR Crítico)
**Arquivo:** `backend/src/controllers/auth.controller.ts`  
**Linha:** 561-563  
**Falha:** Endpoint `/api/auth/ativar-plano-pagamento` aceita `userId` no body e NÃO requer autenticação (não usa middleware `authenticate`)  
**Risco:** CRÍTICO - Qualquer pessoa pode ativar plano de qualquer usuário sem autenticação  
**Como Explorar:**
1. Fazer POST para `/api/auth/ativar-plano-pagamento` sem autenticação
2. Enviar `{ userId: "uuid-de-qualquer-usuario", plano: "MENSAL" }`
3. Plano é ativado sem pagamento e sem autenticação
4. Pode ativar planos de todos os usuários do sistema

**Como Corrigir:**
- Adicionar middleware `authenticate` na rota (linha 120 de `auth.routes.ts`)
- Remover `userId` do body completamente
- Usar sempre `req.userId` do token JWT
- Validar que usuário autenticado é o mesmo que está sendo atualizado
- Retornar erro 403 se tentar ativar plano de outro usuário
- Este endpoint deve ser usado apenas internamente ou com autenticação obrigatória

---

## 20. VALIDAÇÃO DE LIMITE EM QUERY PARAMETERS

### 20.1 Limite de Histórico sem Validação Máxima
**Arquivo:** `backend/src/controllers/peso.controller.ts`  
**Linha:** 44  
**Falha:** `limite` de query parameter é usado diretamente sem validação de máximo  
**Risco:** BAIXO - Pode causar DoS ou sobrecarga do banco com limites muito altos  
**Como Explorar:**
1. Fazer requisição com `limite=1000000`
2. Query pode retornar milhões de registros
3. Sobrecarga do banco e servidor

**Como Corrigir:**
- Validar que `limite <= 100` (ou valor razoável)
- Usar `Math.min(limiteNum, 100)` para limitar
- Retornar erro 400 se limite for muito alto

### 20.2 Limite de Treinos sem Validação
**Arquivo:** `backend/src/controllers/treino.controller.ts`  
**Linha:** 398  
**Falha:** `limite` de query parameter usado sem validação de máximo  
**Risco:** BAIXO - Similar ao 20.1  
**Como Explorar:** Similar ao 20.1

**Como Corrigir:** Similar ao 20.1

---

## 21. VALIDAÇÃO DE EXERCÍCIO ID

### 21.1 Validação de Exercício ID com Fallback Inseguro
**Arquivo:** `backend/src/controllers/exercicio-media.controller.ts`  
**Linha:** 44-56  
**Falha:** Se exercício não for encontrado no banco, aceita qualquer string alfanumérica como ID legado  
**Risco:** MÉDIO - Permite acesso a arquivos de exercícios que não existem mais ou foram deletados  
**Como Explorar:**
1. Tentar acessar `/api/exercicios/qualquer-id-alfanumerico/media.jpg`
2. Se arquivo existir no sistema de arquivos, será servido
3. Pode acessar arquivos de exercícios deletados ou não autorizados

**Como Corrigir:**
- Remover fallback para modo legado
- Retornar 404 se exercício não for encontrado no banco
- Validar que exercício existe e está ativo antes de servir arquivo
- Não confiar apenas em validação de path traversal

---

## 22. VALIDAÇÃO DE DADOS DE TREINO

### 22.1 Validação de Exercícios em Treino Personalizado
**Arquivo:** `backend/src/controllers/treino-personalizado.controller.ts`  
**Linha:** 18, 204  
**Falha:** Valida apenas se array não está vazio, não valida se exercícios existem ou pertencem ao sistema  
**Risco:** BAIXO - Treino pode ser criado com IDs de exercícios inválidos  
**Como Explorar:**
1. Criar treino personalizado com `exercicioId` que não existe
2. Treino é criado, mas exercício não pode ser acessado
3. Pode causar erros ao tentar usar o treino

**Como Corrigir:**
- Validar que todos os `exercicioId` existem no banco
- Verificar que exercícios estão ativos
- Retornar erro 400 se algum exercício for inválido
- Validar antes de criar o treino

---

## RESUMO DE VULNERABILIDADES POR RISCO

### CRÍTICO (2)
1. Hardcoded secret em arquivo de exemplo
2. Ativação de plano por userId no body sem autenticação (IDOR)

### ALTO (2)
3. Validação de webhook com fallback inseguro
4. Bypass de validação de webhook (falha lógica)

### MÉDIO (15)
5. Senha retornada em development
6. Stack trace exposto
7. CORS configurado por variável de ambiente
8. Trust proxy configurado
9. Query parameter email sem validação
10. Validação de path traversal básica
11. Verificação de propriedade de treino (IDOR)
12. Verificação de propriedade em treinos personalizados (IDOR)
13. Verificação de propriedade em exercícios de treino (IDOR)
14. Ausência de proteção CSRF
15. Validação de tipo MIME apenas por extensão
16. Tokens armazenados em localStorage (XSS)
17. Validação de exercício ID com fallback inseguro
18. Dados do usuário em localStorage
19. Verificação de autenticação apenas por token no localStorage

### BAIXO (15)
15. Rate limiting muito permissivo
16. Admin middleware com query a cada requisição
17. Validação de limite de paginação incompleta
18. Validação de peso sem verificação de NaN
19. Senha mínima de 6 caracteres
20. Rate limiting de login pode ser bypassado
21. Sanitização de input em busca (XSS)
22. Dados do usuário retornados sem sanitização (XSS)
23. Validação de plano ativo com query a cada requisição
24. Validação de array sem verificação de tipo
25. Validação de data sem verificação de formato
26. Logs com informações sensíveis
27. Console.log em produção
28. Validação de tamanho de arquivo

---

## RECOMENDAÇÕES PRIORITÁRIAS

1. **URGENTE:** Remover secret real do `env.example.txt` e gerar novo secret
2. **URGENTE:** Adicionar autenticação obrigatória no endpoint `/api/auth/ativar-plano-pagamento` e usar `req.userId` ao invés de `userId` do body
3. **URGENTE:** Remover fallback de validação de webhook por secret no JSON
4. **ALTA:** Implementar proteção CSRF
5. **ALTA:** Corrigir validações de path traversal em uploads
6. **ALTA:** Adicionar validação de propriedade (IDOR) em todos os endpoints
7. **ALTA:** Remover fallback inseguro de exercício ID em uploads de mídia
8. **MÉDIA:** Implementar validação de magic bytes em uploads
9. **MÉDIA:** Remover exposição de senhas e stack traces
10. **MÉDIA:** Melhorar validações de input (datas, arrays, etc.)
11. **MÉDIA:** Considerar migrar tokens de localStorage para httpOnly cookies
12. **MÉDIA:** Validar limites de query parameters (histórico, treinos, etc.)
13. **BAIXA:** Otimizar queries repetidas (cache de role/plano no JWT)
14. **BAIXA:** Melhorar logging e remover informações sensíveis
15. **BAIXA:** Implementar verificação proativa de expiração de token no frontend

---

**Fim do Relatório**

