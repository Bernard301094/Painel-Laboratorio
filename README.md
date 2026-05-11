# 🧪 Painel de Laboratório

Painel de monitoramento em tempo real para laboratório, desenvolvido com React, TypeScript e Firebase. Exibe o status de reatores e ordens de produção (OPs) em uma tela de TV e oferece um painel administrativo para gerenciamento.

---

## 🖥️ Visão Geral

O sistema é composto por duas telas principais:

- **`/` — Painel TV (Display):** Exibe os cards dos reatores em grade responsiva com paginação automática a cada 12 segundos. Ideal para ser projetado em uma TV no laboratório.
- **`/admin` — Painel Administrativo:** Permite criar, editar e excluir OPs, além de atualizar status e amostras com atualização rápida diretamente nos cards.

### Status disponíveis

| Status | Cor |
|---|---|
| EM AJUSTE | Vermelho |
| AGUARDANDO | Âmbar |
| EM ANÁLISE | Azul |
| LIBERADO | Verde |

### Campos de cada OP

- **Reator** — identificador do reator (ex: `AF01`, `AQ03`)
- **Produto** — nome do produto
- **OP** — número da ordem de produção
- **Amostra** — tipo da amostra (`MANIPULADO` ou `ACABADO`)
- **Status** — estado atual do reator
- **Horário** — hora do último registro

---

## 🚀 Tecnologias

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vitejs.dev/)
- [TailwindCSS 3](https://tailwindcss.com/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore) (banco de dados em tempo real)
- [React Router v7](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/) (ícones)
- [FormSubmit](https://formsubmit.co/) (envio de notificações por e-mail)

---

## ⚙️ Configuração

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- Projeto Firebase configurado com Firestore habilitado

### Instalação

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd Painel-Laboratorio
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   Preencha as credenciais do Firebase no arquivo `.env` (veja a seção abaixo).

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:3000`.

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis do Firebase:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 📦 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento na porta 3000 |
| `npm run build` | Gera o build de produção na pasta `dist/` |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Verifica erros de tipo com TypeScript |

---

## 🔄 Integrações

- **Firebase Firestore:** Dados sincronizados em tempo real. A coleção `machines` armazena todas as OPs ativas, ordenadas por `updatedAt`.
- **FormSubmit / Power Automate:** Ao criar, editar ou excluir uma OP, o sistema envia uma notificação por e-mail que pode ser processada por um fluxo do Microsoft Power Automate para atualizar listas no SharePoint.
- **Histórico de status:** Cada alteração de status ou amostra é registrada no campo `history` do documento, permitindo rastrear o ciclo completo da OP.

---

## 🏗️ Estrutura do projeto

```
src/
├── pages/
│   ├── Display.tsx   # Painel TV — visualização em tela cheia
│   └── Admin.tsx     # Painel administrativo — gerenciamento de OPs
├── App.tsx           # Configuração de rotas
├── firebase.ts       # Inicialização do Firebase
├── main.tsx          # Ponto de entrada
└── index.css         # Estilos globais
```

---

## 📋 Regras do Firestore

As regras de segurança estão definidas em `firestore.rules`. Revise e ajuste conforme a política de acesso da sua organização antes de publicar em produção.
