# 🚀 Guia de Deploy - AthletIA

Este guia explica como fazer deploy das alterações em produção usando os scripts automatizados.

> **⚠️ IMPORTANTE:** O deploy em produção é feito exclusivamente em servidores Linux/VPS. O script PowerShell (`deploy-producao.ps1`) é apenas para desenvolvimento local no Windows.

## 📋 Pré-requisitos

- Servidor Linux/VPS com acesso SSH
- Git configurado e com acesso ao repositório
- Node.js e npm instalados
- PM2 instalado e configurado
- Nginx configurado e rodando
- Banco de dados PostgreSQL acessível

## 🐧 Deploy no Servidor de Produção (Linux/VPS)

### Script Automatizado (Recomendado)

Conecte-se ao servidor via SSH e execute:

```bash
cd /opt/athletia
bash deploy-producao.sh
```

Ou especifique a branch:

```bash
bash deploy-producao.sh main
```

### O que o script faz automaticamente:

1. ✅ Atualiza código do repositório (git pull)
2. ✅ Instala dependências do backend
3. ✅ Gera Prisma Client
4. ✅ Executa migrations (com confirmação)
5. ✅ Faz build do backend
6. ✅ Reinicia backend no PM2
7. ✅ Instala dependências do frontend
8. ✅ Faz build do frontend
9. ✅ Recarrega Nginx automaticamente

### Comandos Manuais (Alternativa)

Se preferir fazer manualmente ou precisar de mais controle:

```bash
# 1. Atualizar código
cd /opt/athletia
git pull origin main

# 2. Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate deploy  # Apenas se houver novas migrations
npm run build
pm2 restart athletia-backend

# 3. Frontend
cd ../frontend
npm install
npm run build

# 4. Recarregar Nginx
sudo systemctl reload nginx
```

## 📝 Fluxo Completo de Deploy

### 1. Desenvolvimento e Commit

```bash
# Fazer alterações no código
# ...

# Testar localmente (se tiver ambiente local)
cd backend && npm run dev
cd ../frontend && npm run dev

# Commit e push
git add .
git commit -m "Descrição das alterações"
git push origin main
```

### 2. Deploy no Servidor de Produção

```bash
# Conectar ao servidor via SSH
ssh usuario@seu-servidor.com

# Navegar para o diretório do projeto
cd /opt/athletia

# Executar script de deploy (faz tudo automaticamente)
bash deploy-producao.sh

# O script irá:
# - Fazer git pull
# - Instalar dependências
# - Executar migrations (com confirmação)
# - Fazer build
# - Reiniciar PM2
# - Recarregar Nginx
```

### 3. Verificação Pós-Deploy

```bash
# Verificar status dos serviços
pm2 status

# Ver logs do backend
pm2 logs athletia-backend --lines 50

# Testar API
curl http://localhost:3001/api/health

# Verificar frontend
curl http://localhost | head -20
```

## 🔍 Verificação Pós-Deploy

### Verificar Backend

```bash
# Status do PM2
pm2 status

# Logs em tempo real
pm2 logs athletia-backend --lines 50

# Testar API
curl http://localhost:3001/api/health
```

### Verificar Frontend

```bash
# Verificar se o build foi criado
ls -lh /opt/athletia/frontend/dist

# Testar via Nginx
curl http://localhost
curl http://seu-dominio.com
```

### Verificar Nginx

```bash
# Testar configuração
sudo nginx -t

# Recarregar (se necessário)
sudo systemctl reload nginx

# Ver logs
sudo tail -f /var/log/nginx/athletia-access.log
sudo tail -f /var/log/nginx/athletia-error.log
```

## ⚠️ Troubleshooting

### Erro: "git pull falhou"

- Verifique conexão com internet
- Verifique permissões do repositório
- Verifique se há conflitos: `git status`

### Erro: "npm install falhou"

- Verifique conexão com internet
- Limpe cache: `npm cache clean --force`
- Delete `node_modules` e `package-lock.json` e tente novamente

### Erro: "Build falhou"

- Verifique erros de TypeScript no console
- Verifique se todas as dependências estão instaladas
- Verifique variáveis de ambiente (`.env`)

### Erro: "PM2 não encontrado"

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Configurar PM2 para iniciar no boot
pm2 startup
pm2 save
```

### Erro: "Migrations falharam"

- Verifique conexão com banco de dados
- Verifique se o banco existe
- Verifique permissões do usuário do banco
- Revise as migrations: `cd backend && npx prisma migrate status`

### Backend não inicia

```bash
# Ver logs detalhados
pm2 logs athletia-backend --lines 100

# Verificar se a porta está em uso
sudo lsof -i :3001

# Reiniciar manualmente
pm2 restart athletia-backend
```

### Frontend não carrega

- Verifique se o build foi criado: `ls -lh frontend/dist`
- Verifique configuração do Nginx
- Verifique permissões: `sudo chown -R www-data:www-data /opt/athletia/frontend/dist`
- Verifique logs do Nginx

## 🔐 Segurança

### Variáveis de Ambiente

Certifique-se de que o arquivo `.env` do backend está configurado corretamente:

```bash
# No servidor
cd /opt/athletia/backend
cat .env  # Verificar (não mostrar em público!)

# Variáveis importantes:
# - DATABASE_URL
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - CAKTO_WEBHOOK_SECRET
```

### Permissões

```bash
# Garantir permissões corretas
sudo chown -R $USER:$USER /opt/athletia
chmod -R 755 /opt/athletia
```

## 📊 Monitoramento

### PM2 Monitoring

```bash
# Dashboard interativo
pm2 monit

# Status resumido
pm2 status

# Informações detalhadas
pm2 describe athletia-backend
```

### Logs

```bash
# Logs do backend
pm2 logs athletia-backend

# Logs do Nginx
sudo tail -f /var/log/nginx/athletia-access.log
sudo tail -f /var/log/nginx/athletia-error.log
```

## 🚨 Rollback

Se algo der errado, você pode fazer rollback:

```bash
# 1. Voltar para commit anterior
cd /opt/athletia
git log --oneline -10  # Ver últimos commits
git checkout <commit-anterior>

# 2. Rebuild
cd backend
npm run build
pm2 restart athletia-backend

cd ../frontend
npm run build
pm2 restart athletia-frontend

# 3. Recarregar Nginx
sudo systemctl reload nginx
```

## 💻 Desenvolvimento Local (Opcional - Windows)

> **Nota:** Esta seção é apenas para desenvolvedores que trabalham no Windows. O deploy em produção sempre usa Linux.

Se você desenvolve no Windows e quer testar builds localmente antes de fazer push:

```powershell
# Executar script PowerShell (apenas para validação local)
.\deploy-producao.ps1
```

Isso ajuda a verificar se há erros de compilação antes de fazer deploy no servidor Linux. O script PowerShell **não** reinicia serviços PM2 (que não existem no Windows) e é apenas para validação.

**Lembre-se:** O deploy real sempre deve ser feito no servidor Linux usando `deploy-producao.sh`.

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs primeiro
2. Revise este guia
3. Verifique a documentação do projeto
4. Consulte os logs de erro específicos

---

**Última atualização:** Dezembro 2024
