# NodeWave Deliverables Management Web Application

Frontend web client for tracking enterprise project deliverables across cross-functional teams (Product Management, UI/UX, Frontend, and Backend) and external client stakeholders.

---

## Overview

This application interfaces with the NodeWave Backend API service (`http://localhost:5000`) and serves as the visual state-machine console for deliverable execution. Key capabilities include:

- **1-Click Persona Quick Switcher**: Pre-configured evaluator switcher enabling instant authentication across all five seed accounts (Product Manager, UI/UX Designer, Frontend Engineer, Backend Engineer, Client Guest).
- **Dependency-Aware Kanban Board**: Real-time deliverable tracking across `TODO`, `IN_PROGRESS`, `IN_REVIEW`, and `DONE` columns with visual `BLOCKED` status badges and blocking prerequisite lists.
- **State-Based Permissions (RBAC + ABAC)**: Dynamic permission enforcement preventing unauthorized actions (e.g. Product Managers cannot directly mark deliverables as `DONE`; Engineers cannot alter core task specifications).
- **Optimistic Concurrency Conflict Handler (409)**: Dedicated interactive modal handling version token mismatches without data loss or full page reloads.
- **Dependency Violation Guard (422)**: Catches prerequisite dependency violations when attempting to advance blocked deliverables.
- **Immutable Audit Trail Viewer**: Embedded chronological change ledger displaying field modifications, actors, and timestamps.
- **Daily Standup Auto-Summary (Bonus)**: Cross-department summary dashboard compiling deliverables completed in the last 24 hours alongside currently blocked items, with one-click clipboard export for team communication channels.
- **Tenant-Isolated Client Portal**: Sanitized stakeholder portal displaying only client-visible deliverables, masking internal engineer identities as "NodeWave Team" and hiding internal audit records.

---

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org) (v16 App Router)
- **Language**: TypeScript (Strict Mode)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com) (v4) with custom NodeWave branding (`#070607`, `#50B1D2`, `#094C86`)
- **Server State**: [TanStack Query](https://tanstack.com/query) (v5)
- **Client State**: [Zustand](https://zustand-demo.pmnd.rs) (v5)
- **HTTP Client**: [Axios](https://axios-http.com) with request and response interceptors
- **Icons**: [Lucide React](https://lucide.dev)
- **Code Quality**: [Biome](https://biomejs.dev) (Formatting and Linting)
- **Git Hooks**: [Husky](https://typicode.github.io/husky) and [Commitlint](https://commitlint.js.org) (Conventional Commits)
- **Test Runner**: Built-in Bun Test runner (`bun test`)

---

## Core Feature Implementations

### 1. 1-Click Persona Switcher
Evaluators can change active roles instantly via the navigation bar dropdown or the `/login` demo grid:
- **Product Manager (`pm@nodewave.id`)**: Full management rights; cannot mark deliverables as `DONE`.
- **UI/UX Designer (`uiux@nodewave.id`)**: Can update deliverable progress and attach Figma/design assets.
- **Frontend Engineer (`fe@nodewave.id`)**: Can update deliverable status and link pull requests.
- **Backend Engineer (`be@nodewave.id`)**: Can advance backend deliverables and manage technical debt.
- **Client Guest (`client@nodewave.id`)**: Restricted portal view; internal team names and audit trails are masked.

*All demo accounts share the password `password123`.*

### 2. Dependency-Aware Kanban Board (`/projects/[id]/board`)
- Tasks calculate prerequisite dependencies dynamically. If any prerequisite is not `DONE`, the deliverable displays a prominent `BLOCKED` badge indicating the blocking items.
- Attempting to move a blocked deliverable to `IN_PROGRESS` triggers an API error (`422 Unprocessable Entity`), which the board catches and renders as an actionable dependency banner.
- Department-level filtering allows engineers to focus on relevant team scopes.

### 3. Optimistic Concurrency Conflict Modal (`409 Conflict`)
- Every deliverable update payload submits the observed `version` token.
- If concurrent edits occur in another session, the backend rejects the mutation with HTTP `409 Conflict`.
- The frontend captures this response and displays `ConflictModal`, prompting the user to reload the latest state without overwriting concurrent modifications.

### 4. Immutable Audit Trail Drawer
- Opening deliverable details provides an "Audit Trail" tab for internal roles.
- Fetches chronological change records (`GET /api/audit-logs`) displaying the actor, action, modified field, old value, new value, and ISO timestamp.

### 5. Daily Standup Auto-Summary (`/projects/[id]/standup`)
- Automatically groups deliverables completed in the last 24 hours and currently blocked items across four departments (`UIUX`, `FRONTEND`, `BACKEND`, `PRODUCT_MANAGEMENT`).
- Includes a "Copy Standup Text" button that formats the daily report for Slack, Discord, or Microsoft Teams.

### 6. Client Stakeholder Portal (`/client-portal`)
- Provides an isolated view for external stakeholders.
- Only displays deliverables where `isClientVisible = true`.
- Masks internal engineer identities as "NodeWave Team" and omits internal audit logs.

---

## Local Development Setup

### Prerequisites

- [Bun](https://bun.sh) (v1.2+) or Node.js (v20+)
- Running NodeWave Backend Service on `http://localhost:5000`

### 1. Installation

```bash
bun install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Default configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Running the Development Server

```bash
bun run dev
```

The web client runs on `http://localhost:3000`.

### 4. Production Build

```bash
bun run build
bun run start
```

---

## Code Quality & Verification

### Linting and Formatting
The project enforces strict coding style using Biome:

```bash
# Check code style and lint rules
bun run lint

# Auto-format files
bun run format
```

### Git Hooks & Conventional Commits
Husky ensures code quality before committing:
- `pre-commit`: Runs `biome check`.
- `commit-msg`: Enforces Conventional Commits via Commitlint (e.g. `feat:`, `fix:`, `docs:`, `chore:`).

### Automated Testing

Run the automated test suite:

```bash
bun test
```

Test coverage verifies:
- Evaluation of deliverable `BLOCKED` states against prerequisite dependencies.
- State-based permission logic (ABAC) restricting Product Managers from completing tasks directly.
- Concurrency version token propagation in update payloads.
- Anonymization and masking of internal assignee identities in client portal views.

---

## Directory Structure

```
fe-nodewave/
├── public/                     # Static assets
├── src/
│   ├── app/
│   │   ├── client-portal/      # Isolated client stakeholder portal
│   │   ├── login/              # Authentication and 1-click persona switcher
│   │   ├── projects/
│   │   │   ├── page.tsx        # Projects dashboard & aggregate metrics
│   │   │   └── [id]/
│   │   │       ├── board/      # Dependency-aware Kanban board
│   │   │       └── standup/    # Daily standup auto-summary
│   │   ├── globals.css         # NodeWave theme tokens & Tailwind v4 imports
│   │   ├── layout.tsx          # Root layout with QueryProvider and Navbar
│   │   └── page.tsx            # Auth-aware route redirect
│   ├── components/
│   │   ├── kanban/             # TaskCard, TaskDetailModal, ConflictModal, CreateTaskModal
│   │   ├── layout/             # Top Navbar and persona selector
│   │   └── projects/           # ProjectCard, CreateProjectModal
│   ├── lib/
│   │   └── axios.ts            # Axios instance with JWT interceptors
│   ├── providers/
│   │   └── QueryProvider.tsx   # React Query client provider
│   ├── services/               # API service layer (auth, project, task, audit, standup)
│   ├── store/
│   │   └── useAuthStore.ts     # Zustand store with seed persona switcher
│   └── types/
│       └── index.ts            # Domain models and TypeScript contracts
├── tests/
│   └── task-card.test.ts       # Automated unit tests
├── biome.json                  # Biome linting and formatting configuration
├── commitlint.config.js        # Commitlint conventional config
├── package.json
└── tsconfig.json
```