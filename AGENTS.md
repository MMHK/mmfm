# AGENTS.md - Project Guidelines (Mandatory for AI Models)

This document is the behavior contract for this project. All AI-generated code MUST strictly follow these rules.
Violating any mandatory rule 鈫?rewrite and fix immediately.

---

## 0. Project Overview

MMFM 鈥?intranet music radio panel. Vue 3 SPA frontend + Express/Socket.IO backend serving music search/playback via multi-provider APIs (Netease, QQ, Migu, Kuwo, Kugou, Bilibili).

### Tech Stack
- **Vue 3** + Rspack (frontend, Options API)
- **Express** + Socket.IO 4 (backend, port 8011)
- **Rspack** (frontend via rspack.config.js; backend via rspack.config.service.js)
- **SCSS** (`sass` implementation, dart sass)
- **yarn** (鍞竴 package manager锛宯pm 宸茬鐢?via `preinstall: only-allow yarn`)
- **dotenv** (devDependency, for `.env` file loading in rspack.config.js)

---

## 1. Core Principles (Highest Priority, Violation = Rewrite)

1. **No over-engineering**
   - Unless the requirement explicitly states "high scalability" or "multi-team maintenance" 鈥?always use the simplest, most understandable approach.
   - No premature abstraction, layering, future-proofing code, or early design patterns.

2. **Follow existing patterns**
   - New code must match existing code style, naming, and structure.
   - Before modifying any module, read the surrounding files to understand design intent.
   - When in doubt about a design decision, **ask the user for confirmation before proceeding**.

3. **Confirm before assuming**
   - If the requirement is ambiguous, **ask the user to clarify** before implementing.
   - If multiple valid approaches exist, **present options and let the user choose**.
   - Never silently pick an approach when the user might have a different expectation.

---

## 2. Commands

| Task | Command |
|---|---|
| Dev server (frontend, proxies to :8011) | `yarn serve` |
| Build frontend 鈫?`dist/public/` | `yarn build` |
| Bundle backend 鈫?`dist/service.js` | `yarn build:service` |
| Run backend (dev) | `yarn web` |
| Run backend (production) | `cd dist && node service.js -d ./public` |
| Tests (single provider) | `npx mocha tests/mocha.<provider>.test.js` |
| Lint | `yarn lint` |

### Verification Order
After making changes, run in this order:
1. `npx eslint src/` 鈥?lint check
2. `yarn build` 鈥?frontend build verification
3. `yarn build:service` 鈥?backend build verification

---

## 3. Architecture

- **Frontend entry**: `src/main.js` 鈫?`src/App.vue` 鈫?`src/components/{Player,Search}.vue`
- **Backend entry**: `src/services/WebService.js` (Express + Socket.IO on port 8011, socket path `/io`)
- **Music API aggregator**: `src/services/MusieApi.js` (note: filename typo is intentional/historical)
- **Provider modules**: `src/services/provider/{netease,qq,migu,kuwo,kugou,bilibili}.js`
- **Event bus**: `src/services/Bus.js` (Vue EventBus for cross-component communication)
- Backend has its own `src/services/package.json` and `Dockerfile` for standalone Docker deployment
- **Local player mode**: `Player.vue` supports browser-side HTML5 Audio playback when `LOCAL_PLAYER_MODE=true` (build-time env via DefinePlugin)

### Key gotchas

- **Package manager**: yarn (yarn.lock present). `.npmrc` uses npmmirror 鈥?may need updating if unreachable.
- **Dev proxy**: rspack.config.js proxies `/api`, `/io`, `/song`, `/cache` to `127.0.0.1:8011` 鈥?backend must be running separately during dev.
- **splitChunks disabled** in rspack.config.js 鈥?single JS bundle output.
- **Backend bundling**: rspack.config.service.js targets `node`, uses `externalsPresets: { node: true }`. Copies `swagger.json`, `Dockerfile`, and `package.json` to `dist/`.
- **Tests are live integration tests** hitting real music APIs with timeouts up to 3 hours. No mocks. No test for `mocha.webserice.test.js` exists despite it being the `yarn test` target 鈥?run individual provider test files directly.
- **Song list persistence**: Playlist is saved to `cache/playlist.json` (file-based). Loaded on server startup, written on each `/song/save` request.
- **No TypeScript, no CSS modules**. Styles use SCSS (`sass` implementation, not `node-sass`).
- **Docker base**: `node:18-alpine`.

### Environment Variables
- **`.env` file** at project root, loaded by `dotenv` in `rspack.config.js`
- Injected at build time via `rspack.DefinePlugin` as `process.env.VAR_NAME`
- Current variables:
  - `LOCAL_PLAYER_MODE` (default `false`): When `true`, Player.vue uses HTML5 `<audio>` for browser-side playback instead of Socket.IO remote control
- `.env` is in `.gitignore` — each developer/deployment maintains their own
- Changes require rebuild (`yarn build`) or dev server restart (`yarn serve`)

---

## 4. Code Style Rules

### Function Length
- **New code**: Functions/methods 鈮?40 lines (split if exceeded)
- **Existing code**: Some functions exceed 40 lines 鈥?treated as tech debt
- When modifying existing long functions, follow the 40-line rule **only within the changed scope** 鈥?do not refactor the entire function

### Naming Conventions
- JavaScript identifiers: `camelCase` for variables/functions, `PascalCase` for components/classes
- Vue component files: `PascalCase` (e.g., `Player.vue`, `Search.vue`)
- Provider modules: lowercase (e.g., `netease.js`, `qq.js`)
- CSS classes: descriptive, no BEM enforcement (follow existing patterns)

### Error Handling
- Use basic patterns only: `try/catch` with `.catch()` for promises
- Log errors with `console.error()` or `console.log()` (existing pattern)
- Non-fatal errors: log and continue gracefully (see provider `.catch(() => [])` pattern in MusieApi.js)

### Vue 3 Conventions
- Use Options API (Vue 3 fully supports Options API; no Composition API migration needed)
- Component registration: local registration in parent component (see App.vue pattern)
- Event bus: use `EventBus.on()` / `EventBus.emit()` from `src/services/Bus.js` (powered by `mitt`)
- Template syntax: standard Vue 3 directives (`v-if`, `v-for`, `v-model`, etc.)
- No `this.$set()` 鈥?Vue 3 uses Proxy-based reactivity, supports direct index assignment on arrays

---

## 5. Testing Rules

### Core Principle
- **No bulk test suite generation**
  Unless the requirement explicitly states "write complete tests from scratch" or "coverage 鈮?90%", add at most 3鈥? test cases per change.

### Incremental Test Modification (Order is mandatory)
1. Check if test file already exists for the module
2. If yes 鈫?only **append** new test functions at the end, or fix existing failing tests
3. If context says "happy path is already covered" 鈫?only add edge case / error case
4. If the module has no tests at all 鈫?only then create a new test file, still limited to 3鈥? cases

### Test Style
- Use `mocha` + `assert` (project standard)
- Tests are **live integration tests** hitting real music APIs
- Set appropriate timeouts: `this.timeout(600000)` or higher for API calls
- When API is unreachable, use `this.skip()` if possible

### Running Tests
- Run individual provider tests: `npx mocha tests/mocha.<provider>.test.js`
- Do NOT run `yarn test` 鈥?it points to a non-existent file
- Tests require network access to real music APIs

---

## 6. Documentation Rules

### No New Standalone Doc Files
Unless explicitly requested, do not create:
- README.md (new version)
- docs/, architecture.md, CHANGELOG.md, CONTRIBUTING.md

### Documentation Principles
- Keep inline comments minimal and focused on "why" not "what"
- Update AGENTS.md if architecture or conventions change significantly
- When adding new provider modules, document any special requirements in this file

---

## 7. Pre-Output Self-Check Checklist

Before outputting any code, evaluate each item:
- Does this code create 2x+ more structure/files than the requirement needs?
- Are there unused interfaces/abstractions/design patterns/middleware?
- Was a new test file created when tests already exist?
- Were >5 new test cases added when the requirement was just a bug fix / field addition?
- Were new README/docs files created without being asked?
- Does new code follow existing patterns (Vue 3 Options API, Express middleware style)?
- Was the verification order followed (lint 鈫?build 鈫?test)?

鈫?If any is "yes" 鈫?immediately simplify to a minimal incremental version and note the reason.

---

## 8. Output Format (Always Follow)

1. First provide the "minimal change" version:
   - Code changes (diff or complete small file)
   - Test additions (only the appended portion)
   - Comment additions (only if necessary)
2. Then confirm whether verification steps pass (lint, build)
3. Then confirm whether documentation needs updating

---

## 9. Agent Orchestration & Workflow (Mandatory)

### 9.1 Role Separation
- **Main Agent** (this session): Orchestrator only. NEVER writes code directly.
  - Creates task plans before any implementation
  - Delegates all code changes to **Sub Agents** via the `task` tool
  - Maintains long-running task loops until the project goal is complete
  - Tracks progress, resolves blockers, and coordinates sub agent outputs
- **Sub Agents**: Executors. Implement code, run tests, perform reviews.
  - `explore` agent: Codebase analysis, file search, architecture questions
  - `general` agent: Code implementation, test writing, file modifications, multi-step tasks

### 9.2 Workflow (Every Task MUST Follow This Order)

```
1. PLAN       鈫?Main agent creates task plan (in memory or in doc file if requested)
2. USER REVIEW 鈫?Main agent presents plan to user and WAITS for explicit approval before proceeding
3. DELEGATE   鈫?Main agent spawns sub agent(s) to implement
4. REVIEW     鈫?Main agent spawns sub agent to review code against plan
5. UPDATE     鈫?Sub agent updates plan with task status (if doc-based plan)
6. LOOP       鈫?Main agent checks progress, spawns next task or loops until done
```

**User Review Gate (Mandatory)**:
- After creating or significantly modifying a plan, the main agent MUST present the plan summary to the user using the `question` tool and wait for approval.
- The prompt MUST include: task list, estimated scope, and any open questions.
- The user may: approve (proceed to DELEGATE), request changes (return to PLAN), or reject (cancel task).
- **NEVER proceed to DELEGATE without explicit user approval.**
- If the user requests changes, update the plan and re-present for review.

### 9.3 Sub Agent Delegation Rules

- **Always include full context** in the prompt: file paths, expected behavior, constraints from AGENTS.md.
- **One sub agent per logical task** 鈥?do not batch unrelated changes.
- **Parallel when independent** 鈥?launch multiple sub agents simultaneously for unrelated tasks.
- **Sequential when dependent** 鈥?wait for prior sub agent to finish before spawning the next.
- Use `explore` agent before `general` agent when the task requires understanding unfamiliar code.

### 9.4 Main Agent Loop Responsibilities

For multi-task or long-running projects, the main agent MUST:
1. Break the project into discrete tasks
2. Execute tasks one-by-one or in parallel batches via sub agents
3. After each batch: verify results, update plan status
4. If a sub agent fails or produces incorrect output: diagnose, adjust prompt, re-delegate
5. Continue the loop until ALL tasks are complete or explicitly skipped
6. After each major milestone, verify with lint + build

### 9.5 Forbidden Main Agent Actions
The main agent MUST NOT:
- Write or edit source code files directly (use sub agents)
- Skip the plan step
- Skip the user review step (NEVER delegate without explicit user approval of the plan)
- Skip the review step
- Mark tasks as complete without verification (lint + build)
- Abandon a task without updating status and noting the reason

---

## 10. User Confirmation Requirements (Mandatory)

### When to Ask the User
The agent MUST ask the user for confirmation in these situations:

1. **Ambiguous requirements**: If the requirement can be interpreted in multiple ways, ask which interpretation is correct.
2. **Multiple valid approaches**: If there are 2+ reasonable ways to implement something, present options and let the user choose.
3. **Breaking changes**: Before modifying existing behavior, confirm with the user that this is intended.
4. **New dependencies**: Before adding any new npm package, ask the user for approval.
5. **Architectural decisions**: Before creating new directories, major files, or changing the project structure, ask the user.
6. **Test strategy**: Before writing tests, confirm what needs to be tested and what can be skipped.

### How to Ask
- Use the `question` tool with clear, concise options.
- Provide context: what you're about to do, why, and what the alternatives are.
- Wait for explicit approval before proceeding.
- If the user says "do whatever you think is best", proceed with the simplest approach and document the decision.

### When NOT to Ask
- Trivial formatting or style fixes that don't change behavior.
- Bug fixes where the expected behavior is clear from the code or tests.
- Adding comments or documentation that was explicitly requested.
- Running verification commands (lint, build, test).

---

## 11. Git Rules

### Forbidden Files
- `*.exe`, `*.dll`, `*.so`, `*.dylib` (binaries)
- `.env` (contains secrets)
- `node_modules/` (dependency dir)
- `.idea/`, `.vscode/` (IDE config)
- `dist/` (build artifacts, except when explicitly building for release)

### Commit Convention
- Use Conventional Commits format
- Check `git status` before committing to ensure no unexpected files
- Never commit secrets or API keys
