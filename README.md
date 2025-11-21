# 🏋️ AthletIA - Sistema Inteligente de Treinos Personalizados

> Plataforma completa de geração de treinos personalizados utilizando Inteligência Artificial

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()
[![Versão](https://img.shields.io/badge/versão-2.0.0-blue)]()

## 🎯 Sobre o Projeto

O **AthletIA** é uma plataforma que utiliza IA para gerar treinos personalizados baseados em:
- Dados pessoais do usuário (peso, altura, objetivos, lesões)
- Histórico de treinos e evolução
- Base de conhecimento especializada (literatura científica)
- Progressão automática baseada em RPE

## ✨ Funcionalidades Principais

- ✅ **Dashboard Redesenhado** - Foco no treino do dia com visualização semanal inteligente
- ✅ **Geração Automática de Treinos** - IA personaliza treinos baseado no perfil
- ✅ **Sistema de IA Avançado** - Feedback contextual, reordenação automática, detecção de abandono
- ✅ **Gamificação** - Conquistas, níveis e sequências
- ✅ **Interface Moderna** - Design responsivo mobile-first
- ✅ **Painel Administrativo** - Gerenciamento completo de usuários e exercícios

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Instalação

```bash
# 1. Clonar repositório
git clone <url>
cd athletia

# 2. Configurar backend
cd backend
npm install
cp env.example.txt .env
# Edite .env com suas configurações

# 3. Configurar banco
npm run prisma:migrate
npm run prisma:seed

# 4. Iniciar backend
npm run dev

# 5. Configurar frontend (novo terminal)
cd ../frontend
npm install
npm run dev
```

Acesse `http://localhost:5173` para ver a aplicação.

## 📚 Documentação

**📖 [Documentação Completa](./DOCUMENTACAO.md)** - Tudo em um único lugar

A documentação completa está centralizada em `DOCUMENTACAO.md` e inclui:
- Instalação detalhada
- Arquitetura do sistema
- API e endpoints
- Banco de dados
- Guia de desenvolvimento
- Troubleshooting

## 🛠️ Stack Tecnológico

**Frontend:**
- React 18 + TypeScript
- Vite + Tailwind CSS
- React Router

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT Authentication

## 📱 Estrutura de Rotas

- `/dashboard` - Home redesenhada
- `/treino` - Treino do dia
- `/minha-semana` - Visualização semanal
- `/historico` - Histórico de treinos
- `/evolucao` - Evolução de peso e força
- `/conquistas` - Sistema de gamificação
- `/estatisticas` - Análise de progresso
- `/admin` - Painel administrativo

## 🔗 Links Úteis

- **[Documentação Completa](./DOCUMENTACAO.md)** - Guia completo
- **[Instalação Detalhada](./INSTALACAO.md)** - Passo a passo
- **[Configuração de Ambiente](./CONFIGURAR_ENV.md)** - Variáveis de ambiente
- **[Changelog](./CHANGELOG.md)** - Histórico de mudanças

## 📝 Licença

(A definir)

---

**Última Atualização:** 2024-12-20

