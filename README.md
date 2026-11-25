# HireLens

A web app for tracking job applications, generating tailored resumes and cover letters, and getting AI-driven interview prep.

| Layer    | Tech |
|----------|------|
| Frontend | Next.js 15 (React 19, TypeScript, App Router) + Tailwind CSS v4 |
| Backend  | ASP.NET Core 9 Web API, ASP.NET Identity, JWT auth, EF Core |
| Database | PostgreSQL 16 (Docker) |
| AI       | Claude (`claude-opus-5-5`) via the official `Anthropic` .NET SDK |

## MVP features

- Email/password sign-up and login (JWT)
- Job application tracker: create, edit, and delete applications, with status, dates, notes, and the job description; dashboard with status counts, filter, and search
- Profile with a **base resume** that the AI tailors per job
- For each application, generate a **tailored resume**, a **cover letter**, or an **interview prep guide**. Results are saved as Markdown and can be viewed, copied, or deleted.

## Running locally

### 1. Database

```bash
docker compose up -d db        # Postgres on localhost:5433
```

### 2. API

Set your Anthropic API key (needed only for the AI features):

```bash
# Option A: .NET user secrets (recommended)
cd backend/HireLens.API
dotnet user-secrets init
dotnet user-secrets set "Ai:ApiKey" "sk-ant-..."
# Option B: environment variable
export ANTHROPIC_API_KEY=sk-ant-...
```

Then run it:

```bash
cd backend/HireLens.API
dotnet run                     # http://localhost:5297, Swagger at /swagger
```

Migrations are applied automatically on startup.

**No .NET SDK installed?** Run the API in Docker instead:

```bash
ANTHROPIC_API_KEY=sk-ant-... docker compose --profile api up -d --build
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:5297
npm install
npm run dev                    # http://localhost:3000
```

## API overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account, returns JWT |
| POST | `/api/auth/login` | Log in, returns JWT |
| GET | `/api/auth/me` | Current user |
| GET/PUT | `/api/profile` | Name and base resume |
| GET/POST | `/api/applications` | List (optional `?status=`) / create |
| GET/PUT/DELETE | `/api/applications/{id}` | Read / update / delete |
| GET/POST | `/api/applications/{id}/documents` | List / generate (`{ "type": "Resume" \| "CoverLetter" \| "InterviewPrep" }`) |
| DELETE | `/api/documents/{id}` | Delete a generated document |

`backend/HireLens.API/HireLens.API.http` has ready-made requests.

## Database migrations

```bash
dotnet tool install --global dotnet-ef
cd backend/HireLens.API
dotnet ef migrations add <Name> -o Data/Migrations
```

## Project layout

```
backend/HireLens.API/
  Controllers/   Auth, Profile, Applications, Documents
  Data/          DbContext + EF migrations
  Dtos/          Request/response records
  Models/        AppUser, JobApplication, GeneratedDocument
  Services/      TokenService (JWT), AiService (Claude)
frontend/src/
  app/           Pages: /, /login, /register, /dashboard, /applications/new, /applications/[id], /profile
  components/    AuthProvider, RequireAuth, NavBar, ApplicationForm, AiToolsPanel, ...
  lib/           api.ts (typed fetch client), types.ts
```

## Not production-ready yet

- `Jwt:Key` in `appsettings.Development.json` is a dev placeholder. Set a real secret through configuration in any deployed environment.
- The JWT is stored in `localStorage`. Consider httpOnly cookies before launch.
- AI generation is a synchronous request that takes roughly 10–60 seconds. Streaming or a background job would improve the UX.
