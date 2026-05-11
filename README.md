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
- [Microsoft Graph](https://learn.microsoft.com/graph/) (integração direta com SharePoint/Microsoft Lists)

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
<<<<<<< codex/fix-popup-behavior-on-criar-nova-op-zexdyg
   Preencha as credenciais do Firebase e do Microsoft Graph no arquivo `.env` (veja a seção abaixo).
=======
   Preencha as credenciais do Firebase e, se desejar sincronizar OPs com SharePoint sem popups, configure também `VITE_SHAREPOINT_WEBHOOK_URL` no arquivo `.env` (veja a seção abaixo).
>>>>>>> main

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

<<<<<<< codex/fix-popup-behavior-on-criar-nova-op-zexdyg
# Microsoft Graph API — integração direta com SharePoint/Microsoft Lists
VITE_GRAPH_LIST_ID=...
VITE_GRAPH_SITE_ID=...
VITE_GRAPH_TENANT_ID=...
VITE_GRAPH_CLIENT_ID=...
```

No Azure, o aplicativo precisa ter permissões delegadas `Sites.ReadWrite.All` e `User.Read` concedidas. No painel administrativo, clique em **Conectar SharePoint** uma vez para iniciar a sessão Microsoft; depois disso, a criação e edição de OPs usa token silencioso e não abre popup automaticamente no botão **Criar Nova OP**.
=======
# Recomendado para enviar as OPs para SharePoint/Microsoft Lists sem abrir popup no navegador.
VITE_SHAREPOINT_WEBHOOK_URL=https://...
```

A URL de webhook deve ser um gatilho HTTP do Power Automate. Ao criar, editar ou resetar uma OP, o app envia um `POST` com a ação (`CRIAR`, `EDITAR` ou `RESETAR`), os dados da OP e os campos já formatados para a lista do SharePoint.
>>>>>>> main

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
<<<<<<< codex/fix-popup-behavior-on-criar-nova-op-zexdyg
- **Microsoft Graph / SharePoint:** Ao criar, editar ou resetar uma OP, o sistema grava diretamente na lista do SharePoint/Microsoft Lists usando as credenciais Azure configuradas em `VITE_GRAPH_*`. A autenticação interativa fica restrita ao botão **Conectar SharePoint**; o botão **Criar Nova OP** não abre popup automaticamente.
=======
- **Power Automate / SharePoint:** Ao criar, editar ou resetar uma OP, o sistema envia os dados por `POST` para `VITE_SHAREPOINT_WEBHOOK_URL`, permitindo que um fluxo do Power Automate grave diretamente na lista do SharePoint sem abrir popup de autenticação.
>>>>>>> main
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
