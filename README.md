# Personal-Finance-Tracker

Run everything from the repository root directory.

## Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm
- PostgreSQL

## 1) Install dependencies

```bash
npm install
```

## 2) Configure backend environment variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/personal_finance_tracker?schema=public"
JWT_SECRET="replace-with-a-strong-secret"
PORT=4000
```

Replace `USER` and `PASSWORD` with your PostgreSQL credentials.
For `JWT_SECRET`, use a long random value (for example: `openssl rand -base64 32`).

`JWT_SECRET` is required by the backend and the server will fail to start without it.

## 3) Set up Prisma and the database

From the repository root:

```bash
npx prisma migrate dev --schema backend/prisma/schema.prisma
npm run prisma:generate -w backend
```

## 4) Run the app

Start backend + frontend together:

```bash
npm run dev
```

Open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## VS Code workflow

1. Open the folder in VS Code:
   - `File` → `Open Folder...` → your local clone of this repository
2. Open a new terminal in VS Code (`Terminal` → `New Terminal`).
3. Run `npm run dev`.
4. Use the VS Code integrated terminal output to verify both frontend and backend start.

## Useful commands

```bash
# Frontend lint
npm run lint

# Frontend production build
npm run build

# Workspace tests (if present)
npm run test
```
