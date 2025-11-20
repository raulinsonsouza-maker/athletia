# 🏋️ AthletIA - Frontend

Frontend React para o sistema AthletIA - Sistema Inteligente de Treinos Personalizados.

## 🚀 Tecnologias

- **React** 18 + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **Axios** - Cliente HTTP

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🔧 Instalação

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente (opcional):
```bash
# Criar arquivo .env.local
VITE_API_URL=http://localhost:3001/api
```

3. Iniciar servidor de desenvolvimento:
```bash
npm run dev
```

4. Build para produção:
```bash
npm run build
npm run preview
```

## 📁 Estrutura

```
frontend/
├── src/
│   ├── components/    # Componentes reutilizáveis
│   ├── contexts/      # Contextos React (Auth, etc)
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Serviços API
│   ├── App.tsx        # Componente principal
│   └── main.tsx       # Entry point
└── public/            # Arquivos estáticos
```

## 🎨 Design

- **Mobile-first**: Interface responsiva
- **Tailwind CSS**: Utility-first CSS
- **Cores primárias**: Azul (primary-600)
- **Componentes**: Botões, inputs, cards padronizados

## 🔐 Autenticação

O frontend gerencia autenticação através de:
- Context API para estado global
- LocalStorage para persistência de tokens
- Interceptors Axios para renovação automática de tokens

## 📱 Páginas

- `/login` - Tela de login
- `/register` - Tela de registro
- `/dashboard` - Dashboard principal (protegida)

