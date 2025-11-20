# 🏋️ AthletIA - Sistema Inteligente de Treinos Personalizados

> Sistema completo de geração de treinos personalizados utilizando Inteligência Artificial

## 📋 Sobre o Projeto

O **AthletIA** é uma plataforma completa que utiliza IA para gerar treinos personalizados baseados em:
- Dados pessoais do usuário (peso, altura, objetivos)
- Histórico de treinos e evolução
- Base de conhecimento especializada (livros, literatura científica)
- Feedback contínuo do usuário

## 🎯 Funcionalidades Principais

- ✅ Geração automática de treinos personalizados
- ✅ Interface responsiva para uso na academia
- ✅ Exibição de exercícios com GIFs/imagens
- ✅ Sistema de acompanhamento e evolução
- ✅ Painel administrativo multi-usuário
- ✅ Sistema de login e segurança
- ✅ Onboarding inicial com questionário completo
- ✅ Atualização semanal de peso e progresso

## 📚 Documentação

### Documentos Principais

- **[BASE_DE_CONHECIMENTO.md](./BASE_DE_CONHECIMENTO.md)** - Documento mestre com toda a base de conhecimento do projeto
- **[PROJETO_STATUS.md](./PROJETO_STATUS.md)** - Status atual e progresso do desenvolvimento
- **[INSTALACAO.md](./INSTALACAO.md)** - Guia completo de instalação
- **[docs/ESPECIFICACAO_TECNICA.md](./docs/ESPECIFICACAO_TECNICA.md)** - Especificação técnica detalhada
- **[docs/CONHECIMENTO_PDFS.md](./docs/CONHECIMENTO_PDFS.md)** - Conhecimento extraído dos PDFs especializados

### Estrutura de Diretórios

```
Academia_V1/
├── docs/                    # Documentação completa
│   ├── ESPECIFICACAO_TECNICA.md
│   └── fases/              # Documentação por fase
├── backend/                 # API e lógica de negócio
├── frontend/                # Interface do usuário
├── database/                # Scripts e schemas
├── ai/                      # Modelos e prompts de IA
└── tests/                   # Testes automatizados
```

## 🚀 Fases de Desenvolvimento

1. ✅ **Fase 1: Fundação e Planejamento** - Concluída
2. ✅ **Fase 2: Onboarding e Perfil do Usuário** - Concluída
3. 🔄 **Fase 3: Base de Conhecimento e IA** - Em Progresso (40%)
4. ✅ **Fase 4: Lógica de Geração de Treinos** - Concluída
5. 🔄 **Fase 5: Interface do Usuário** - Em Progresso (80%)
6. ✅ **Fase 6: Acompanhamento e Evolução** - Concluída
7. ⏳ **Fase 7: Painel Administrativo** - Planejada
8. ⏳ **Fase 8: Segurança e Deploy** - Planejada

## 📖 Como Usar a Base de Conhecimento

**Antes de implementar qualquer funcionalidade:**
1. Consulte `BASE_DE_CONHECIMENTO.md`
2. Verifique a fase correspondente
3. Revise o histórico de implementações
4. Atualize após concluir

**Ao concluir uma tarefa:**
1. Marque como concluída na fase correspondente
2. Adicione entrada no histórico
3. Atualize `PROJETO_STATUS.md`

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **TypeScript**
- **Express** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação

### Frontend
- **React** 18 + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento

### Autenticação
- **JWT** (JSON Web Tokens)
- **bcrypt** - Hash de senhas
- **Refresh Tokens** - Renovação automática

## 🚀 Instalação Rápida

Consulte o [GUIA DE INSTALAÇÃO](./INSTALACAO.md) para instruções detalhadas.

**Resumo:**
```bash
# Backend
cd backend
npm install
cp env.example.txt .env  # Configure suas variáveis
npm run prisma:migrate
npm run dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

## 📝 Licença

(A definir)

---

**Última Atualização:** 2024-12-19

