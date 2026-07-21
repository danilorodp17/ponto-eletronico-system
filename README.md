# ⏱️ PontoTech — Sistema de Registro de Ponto Eletrônico

Sistema **Full Stack** desenvolvido para gerenciamento de ponto eletrônico, permitindo que colaboradores registrem seus horários de entrada e saída, acompanhem sua jornada de trabalho e consultem o saldo de banco de horas.

O projeto foi construído utilizando uma arquitetura moderna baseada em **Node.js**, **React**, **TypeScript** e **PostgreSQL**, seguindo boas práticas de desenvolvimento e organização em camadas.

---

## 🚀 Tecnologias Utilizadas

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (JSON Web Token)
- bcrypt

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router DOM

---

## 📂 Estrutura do Projeto

```
ponto-eletronico-system
│
├── backend
│   ├── prisma
│   ├── src
│   │   ├── controllers
│   │   ├── services
│   │   ├── middleware
│   │   ├── routes
│   │   ├── utils
│   │   └── server.ts
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── hooks
│   │   ├── routes
│   │   └── App.tsx
│   └── package.json
│
└── README.md
```

---

# 📋 Funcionalidades

O sistema oferece:

- ✅ Cadastro de usuários
- ✅ Login seguro com autenticação JWT
- ✅ Criptografia de senhas utilizando bcrypt
- ✅ Registro de entrada
- ✅ Registro de saída
- ✅ Dashboard com resumo da jornada diária
- ✅ Histórico completo de registros
- ✅ Cálculo automático do banco de horas
- ✅ Controle de acesso por tipo de usuário
- ✅ Comunicação entre frontend e backend por API REST

---

# 🖥️ Interface do Sistema

A aplicação possui uma interface moderna desenvolvida em **React** com **Tailwind CSS**, proporcionando uma experiência intuitiva e responsiva.

Entre as principais telas estão:

- Tela de Login
- Cadastro de Usuário
- Dashboard
- Registro de Ponto
- Histórico de Registros
- Banco de Horas

---

# 🏗️ Arquitetura

O backend segue uma arquitetura em camadas, separando claramente as responsabilidades da aplicação.

```text
Cliente

      │

      ▼

Rotas (Routes)

      │

      ▼

Controllers

      │

      ▼

Services

      │

      ▼

Prisma ORM

      │

      ▼

PostgreSQL
```

Essa organização facilita:

- manutenção do código;
- reutilização de componentes;
- escalabilidade;
- testes;
- separação das regras de negócio.

---

# 🔐 Autenticação

O sistema utiliza **JSON Web Token (JWT)** para autenticação.

Fluxo:

```text
Login

      │

      ▼

Validação do usuário

      │

      ▼

Geração do Token JWT

      │

      ▼

Requisições autenticadas
```

As senhas são armazenadas de forma segura utilizando **bcrypt**, garantindo proteção contra acesso indevido.

---

# 📊 Fluxo de Funcionamento

```text
Usuário

      │

      ▼

Login

      │

      ▼

Dashboard

      │

      ├───────────────┐
      ▼               ▼

Registrar Entrada   Consultar Histórico

      │               │

      ▼               ▼

Registrar Saída   Banco de Horas

      │

      ▼

Atualização automática do saldo
```

---

# ⚙️ Como Executar

## 1. Clone o repositório

```bash
git clone https://github.com/danilorodp17/ponto-eletronico-system.git
```

Entre na pasta do projeto:

```bash
cd ponto-eletronico-system
```

---

## 2. Configurar o Backend

Acesse a pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` utilizando o modelo abaixo:

```env
DATABASE_URL="postgresql://postgres:SENHA@localhost:5432/ponto_eletronico"

JWT_SECRET="sua_chave_secreta"

PORT=3001
```

Execute as migrations:

```bash
npx prisma migrate dev
```

Inicie o servidor:

```bash
npm run dev
```

Servidor disponível em:

```
http://localhost:3001
```

---

## 3. Configurar o Frontend

Em outro terminal:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute a aplicação:

```bash
npm run dev
```

Frontend disponível em:

```
http://localhost:5173
```

---

# 🗄️ Banco de Dados

O projeto utiliza **PostgreSQL** como banco de dados relacional e o **Prisma ORM** para gerenciamento das entidades e migrações.

Principais informações armazenadas:

- Usuários
- Registros de entrada
- Registros de saída
- Banco de horas
- Perfis de acesso

---

# 🌐 API REST

A comunicação entre frontend e backend ocorre por meio de uma API REST.

Exemplo de fluxo:

```text
Frontend

↓

Axios

↓

Express

↓

Services

↓

Prisma ORM

↓

PostgreSQL

↓

Resposta JSON

↓

Frontend
```

---

# 📚 Conceitos Aplicados

Durante o desenvolvimento foram utilizados conceitos de:

- Desenvolvimento Full Stack
- APIs REST
- TypeScript
- Node.js
- React
- Vite
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Arquitetura em Camadas
- Autenticação JWT
- Criptografia de Senhas
- Controle de Acesso
- Organização de Código
- Boas Práticas de Desenvolvimento

---

# 💡 Possíveis Melhorias

- Implementar recuperação de senha por e-mail.
- Adicionar autenticação em dois fatores (2FA).
- Criar painel administrativo completo.
- Exportar registros para PDF e Excel.
- Permitir justificativa de atrasos e ausências.
- Implementar geolocalização para validação do registro de ponto.
- Adicionar registro por reconhecimento facial ou biometria.
- Desenvolver versão mobile utilizando React Native.
- Criar dashboards analíticos com gráficos de produtividade.
- Implantar o sistema em ambiente de produção utilizando Docker e Nginx.

---

# 🎯 Objetivo do Projeto

Este projeto foi desenvolvido com o objetivo de aplicar conhecimentos em **Desenvolvimento Full Stack**, integrando frontend, backend e banco de dados em uma aplicação real para gerenciamento de ponto eletrônico.

Além de explorar conceitos como autenticação, APIs REST, arquitetura em camadas e persistência de dados, o sistema demonstra a construção de uma solução completa utilizando tecnologias amplamente empregadas no mercado.

---

# 👨‍💻 Autor

**Danilo Rodrigues Parolin**

- GitHub: https://github.com/danilorodp17
- LinkedIn: https://www.linkedin.com/in/danilo-parolin/
