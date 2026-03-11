# ⏱️ PontoTech — Sistema de Registro de Ponto Eletrônico

Sistema web de registro de ponto eletrônico desenvolvido como projeto fullstack.  
A aplicação permite que funcionários registrem entrada e saída, acompanhem horas trabalhadas e visualizem o saldo de banco de horas.

## 🚀 Funcionalidades

- Cadastro e login de usuários
- Autenticação com JWT
- Registro de entrada e saída
- Dashboard com horas trabalhadas no dia
- Histórico de registros de ponto
- Cálculo de banco de horas
- Controle de permissões por tipo de usuário

## 🛠 Tecnologias Utilizadas

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router

## 🏗 Arquitetura

O backend segue o padrão:

Controller → Service → Prisma

Separando responsabilidades entre rotas, regras de negócio e acesso ao banco de dados.

## ⚙️ Como Rodar o Projeto

### 1. Clonar o repositório

git clone https://github.com/SEU-USUARIO/ponto-eletronico.git  
cd ponto-eletronico

### 2. Rodar o backend

cd backend  
npm install  
cp .env.example .env  
npx prisma migrate dev  
npm run dev  

Servidor rodando em:  
http://localhost:3001

### 3. Rodar o frontend

cd frontend  
npm install  
npm run dev  

Aplicação disponível em:  
http://localhost:5173

## 🔐 Variáveis de Ambiente

Exemplo do arquivo `.env`:

DATABASE_URL="postgresql://postgres:SENHA@localhost:5432/ponto_eletronico"  
JWT_SECRET="sua_chave_secreta"  
PORT=3001

## 📌 Objetivo do Projeto

Este projeto foi desenvolvido como parte de portfólio para demonstrar conhecimentos em:

- Desenvolvimento Fullstack
- Criação de APIs REST
- Autenticação e autorização
- Integração com banco de dados
- Arquitetura de software
- Boas práticas com TypeScript
