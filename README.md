# Statewide Project - CRM System

Sistema CRM (Customer Relationship Management) para gerenciamento de leads, projetos, marketing e finanças — com **controle de acesso por nível (RBAC)**.

## 📋 Requisitos do Sistema

### Requisitos Mínimos
- **Node.js** >= 18.x
- **npm** >= 9.x (ou yarn/pnpm)
- **Git**

### Requisitos para Produção (VPS)
- **Ubuntu** 20.04+ ou similar
- **RAM** >= 1GB
- **PM2** (gerenciador de processos Node.js)
- **Nginx** (proxy reverso - opcional)

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| Next.js | 16.1.6 | Framework React para produção |
| React | 19.2.3 | Biblioteca UI |
| TypeScript | 5.x | Tipagem estática |
| Prisma | 6.19.2 | ORM para banco de dados |
| SQLite | - | Banco de dados |
| Tailwind CSS | 4.x | Framework CSS |
| Framer Motion | 12.x | Animações |
| React Hook Form | 7.x | Gerenciamento de formulários |
| Zod | 4.x | Validação de schemas |
| Lucide React | - | Ícones |
| bcryptjs | - | Criptografia de senhas |
| jose | - | JWT para autenticação |

## 🔐 Controle de Acesso (RBAC)

O sistema possui 4 níveis de acesso:

| Nível | Permissões |
|-------|-----------|
| **Administrador** | Controle total. Gerencia usuários, leads, projetos e financeiro. |
| **Financeiro** | Leitura total. Gerencia projetos e financeiro. |
| **Marketing** | Leitura total. Gerencia leads e marketing. |
| **Operador** | Leitura + apenas pode criar novos leads. Sem delete. |

> O painel de gerenciamento de usuários está em **Settings → Gerenciar Usuários** e é acessível apenas por Administradores.

## 📁 Estrutura do Projeto

```
statewideproject/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados (User, Lead, Project)
│   └── seed.js            # Script de seed para criar usuários iniciais
├── public/                # Arquivos estáticos
├── src/
│   ├── app/
│   │   ├── api/           # API Routes
│   │   │   ├── leads/     # CRUD de leads (com RBAC)
│   │   │   ├── projects/  # CRUD de projetos (com RBAC)
│   │   │   └── users/     # CRUD de usuários (Admin only)
│   │   ├── actions/       # Server Actions (auth: login/logout)
│   │   ├── login/         # Tela de login
│   │   ├── settings/
│   │   │   └── users/     # Painel de gerenciamento de usuários
│   │   ├── financial/     # Página financeira
│   │   ├── leads/         # Página de leads
│   │   ├── marketing/     # Página de marketing
│   │   ├── projects/      # Página de projetos
│   │   ├── layout.tsx     # Layout principal
│   │   └── page.tsx       # Página inicial (Dashboard)
│   ├── components/        # Componentes reutilizáveis (Sidebar, AddLeadModal)
│   ├── lib/               # Utilitários (auth.ts, prisma.ts, utils.ts)
│   └── middleware.ts      # Middleware de autenticação (protege rotas)
├── .env                   # Variáveis de ambiente (criar manualmente)
├── package.json
└── tsconfig.json
```


## 🚀 Instalação Local

### 1. Clonar o repositório

```bash
git clone https://github.com/ontop-ads/statewideproject.git
cd statewideproject
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
echo 'DATABASE_URL="file:./prisma/dev.db"' > .env
```

### 4. Configurar o banco de dados

```bash
# Gerar o Prisma Client
npx prisma generate

# Criar banco de dados e tabelas
npx prisma db push
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🖥️ Deploy em VPS (Produção)

### 1. Preparar a VPS

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (via NVM recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Instalar PM2 globalmente
npm install -g pm2
```

### 2. Clonar e configurar o projeto

```bash
# Clonar repositório
git clone https://github.com/ontop-ads/statewideproject.git
cd statewideproject

# Instalar dependências
npm install

# Criar arquivo .env com caminho ABSOLUTO
echo 'DATABASE_URL="file:/home/SEU_USUARIO/statewideproject/prisma/dev.db"' > .env

# Gerar Prisma Client
npx prisma generate

# Criar banco de dados
npx prisma db push

# Build de produção
npm run build
```

### 3. Iniciar com PM2

```bash
# Iniciar aplicação
pm2 start npm --name "statewide" -- start

# Salvar configuração do PM2
pm2 save

# Configurar inicialização automática
pm2 startup
```

### 4. Configurar Nginx (opcional)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📝 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Rodar em modo desenvolvimento |
| `npm run build` | Gerar build de produção |
| `npm run start` | Iniciar em modo produção |
| `npm run lint` | Executar linter |
| `npx prisma studio` | Abrir interface visual do banco |
| `npx prisma db push` | Sincronizar schema com banco |
| `npx prisma generate` | Gerar Prisma Client |

## ⚠️ Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"
Crie o arquivo `.env` com a variável `DATABASE_URL`.

### Erro: "Unable to open the database file"
Use caminho absoluto no `.env`:
```bash
DATABASE_URL="file:/caminho/absoluto/para/prisma/dev.db"
```

### Erro: Permissões no banco de dados
```bash
chmod 755 prisma/
chmod 644 prisma/dev.db
```

### PM2: Ver logs
```bash
pm2 logs statewide
```

### PM2: Reiniciar aplicação
```bash
pm2 restart statewide
```

## 📄 Licença

Este projeto é privado.

## 👥 Contato

Desenvolvido por Ontop Ads.
