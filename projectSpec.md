# Technical Specification: Note-Taking Web Application

## 1. Overview

A web-based application allowing authenticated users to create, manage, and publicly share rich-text notes. The application will be deployed as a Docker container, utilizing a local SQLite database for persistent storage.

## 2. Technology Stack

| Concern | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Runtime & Package Manager | Bun |
| Language | TypeScript |
| Styling | TailwindCSS (Custom-built UI components) |
| Authentication | better-auth |
| Rich Text Editor | TipTap |
| Database | SQLite (via Bun's native `bun:sqlite` API) |
| Infrastructure | Docker |

## 3. System Architecture & Infrastructure

### 3.1. Infrastructure (Docker)

The application and the SQLite database will run within a single Docker container.

- **Persistence:** A Docker Volume must be mounted to the container to store the `.sqlite` database file. This ensures data persists across container restarts and deployments.
- **Start Command:** The Dockerfile will use Bun to run the Next.js production server (`bun run start`).

### 3.2. Data Flow

- **Client/Server Split:** UI components (like the TipTap editor) will primarily be Client Components.
- **Data Fetching & Mutations:** Client components will interact with the database via standard `fetch()` calls to Next.js API Routes (`app/api/...`).
- **Auth State:** better-auth will handle session management, protecting API routes and restricting client-side access.

## 4. Database & Migrations

### 4.1. Migration Strategy

- Migrations will be written as raw `.sql` files.
- They will be stored in a dedicated `/scripts/migrations` directory at the project root.
- A custom Bun script (e.g., `bun run db:migrate`) will be created to read these files and execute them against the SQLite database sequentially.

### 4.2. Schema Design

The schema consists of four tables required by better-auth and a custom `notes` table.

**Table: `user`**

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique identifier for each user. |
| `name` | TEXT | NOT NULL | User's chosen display name. |
| `email` | TEXT | NOT NULL UNIQUE | User's email address for communication and login. |
| `emailVerified` | INTEGER | NOT NULL DEFAULT 0 | Whether the user's email is verified (0 = false, 1 = true). |
| `image` | TEXT | | User's image URL. |
| `createdAt` | INTEGER | NOT NULL | Unix timestamp of when the account was created. |
| `updatedAt` | INTEGER | NOT NULL | Unix timestamp of the last update to the user's information. |

**Table: `session`**

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique identifier for each session. |
| `userId` | TEXT | NOT NULL, FK → `user.id` | The ID of the user. |
| `token` | TEXT | NOT NULL UNIQUE | The unique session token. |
| `expiresAt` | INTEGER | NOT NULL | Unix timestamp of when the session expires. |
| `ipAddress` | TEXT | | The IP address of the device. |
| `userAgent` | TEXT | | The user agent information of the device. |
| `createdAt` | INTEGER | NOT NULL | Unix timestamp of when the session was created. |
| `updatedAt` | INTEGER | NOT NULL | Unix timestamp of when the session was last updated. |

**Table: `account`**

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique identifier for each account. |
| `userId` | TEXT | NOT NULL, FK → `user.id` | The ID of the user. |
| `accountId` | TEXT | NOT NULL | The ID of the account as provided by the SSO, or equal to `userId` for credential accounts. |
| `providerId` | TEXT | NOT NULL | The ID of the provider. |
| `accessToken` | TEXT | | The access token returned by the provider. |
| `refreshToken` | TEXT | | The refresh token returned by the provider. |
| `accessTokenExpiresAt` | INTEGER | | Unix timestamp of when the access token expires. |
| `refreshTokenExpiresAt` | INTEGER | | Unix timestamp of when the refresh token expires. |
| `scope` | TEXT | | The scope of the account returned by the provider. |
| `idToken` | TEXT | | The ID token returned from the provider. |
| `password` | TEXT | | Hashed password; used for email/password authentication. |
| `createdAt` | INTEGER | NOT NULL | Unix timestamp of when the account was created. |
| `updatedAt` | INTEGER | NOT NULL | Unix timestamp of when the account was last updated. |

**Table: `verification`**

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique identifier for each verification request. |
| `identifier` | TEXT | NOT NULL | The identifier for the verification request (e.g., email address). |
| `value` | TEXT | NOT NULL | The value to be verified (e.g., a token). |
| `expiresAt` | INTEGER | NOT NULL | Unix timestamp of when the verification request expires. |
| `createdAt` | INTEGER | NOT NULL | Unix timestamp of when the verification request was created. |
| `updatedAt` | INTEGER | NOT NULL | Unix timestamp of when the verification request was last updated. |

**Table: `notes`**

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | Unique identifier (UUID or NanoID). |
| `user_id` | TEXT | NOT NULL, FK → `user.id` | References the `user` table from better-auth. |
| `content` | TEXT | NOT NULL | The TipTap rich text data stored as a stringified JSON object. |
| `is_shared` | INTEGER | NOT NULL DEFAULT 0 | Boolean flag (0 = private, 1 = public). |
| `created_at` | INTEGER | NOT NULL | Unix timestamp. |
| `updated_at` | INTEGER | NOT NULL | Unix timestamp. |

## 5. API Route Design (`/app/api/...`)

All secured endpoints will first verify the session using better-auth. If no valid session exists, they will return a `401 Unauthorized`.

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/api/notes` | GET | Yes | Retrieves a list of all notes belonging to the authenticated user. |
| `/api/notes` | POST | Yes | Creates a new note. Body: `{ content: string }`. |
| `/api/notes/[id]` | GET | Yes | Retrieves a specific note for the author for editing. |
| `/api/notes/[id]` | PUT | Yes | Updates a note's content or `is_shared` status. |
| `/api/notes/[id]` | DELETE | Yes | Deletes a note belonging to the authenticated user. |
| `/api/public/notes/[id]` | GET | No | Retrieves a note only if its `is_shared` flag is `1` (true). |

## 6. UI & Editor Implementation

### 6.1. Custom Component Library

All UI components (buttons, dialogs, inputs, layout wrappers) will be built from scratch using pure React and TailwindCSS.

### 6.2. TipTap Configuration

The TipTap editor will be initialized with specific extensions to limit formatting to your exact requirements. The raw output will be saved via `editor.getJSON()`.

**Required TipTap Extensions:**

- `Document`, `Paragraph`, `Text` (Core nodes)
- `Bold`, `Italic` (Marks)
- `Heading` (Configured to allow levels 1, 2, and 3 only)
- `BulletList`, `ListItem` (For bullet points)
- `HorizontalRule` (For separators)

## 7. Recommended Project Structure

```
/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/route.ts    # better-auth endpoints
│   │   ├── notes/route.ts            # GET, POST notes
│   │   └── notes/[id]/route.ts      # GET, PUT, DELETE note
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/                    # Protected user area
│   │   └── page.tsx                 # List of notes
│   ├── editor/[id]/
│   │   └── page.tsx                 # TipTap editor view
│   └── shared/[id]/
│       └── page.tsx                 # Public view for shared notes
├── components/
│   ├── ui/                          # Scratch-built Tailwind components
│   └── editor/                      # TipTap wrapper and toolbar
├── lib/
│   ├── auth.ts                      # better-auth configuration
│   └── db.ts                        # Bun SQLite client initialization
├── scripts/
│   ├── migrate.ts                   # Bun script to run migrations
│   └── migrations/
│       ├── 0001_initial_auth.sql
│       └── 0002_create_notes.sql
├── Dockerfile
├── package.json
└── tailwind.config.ts
```
