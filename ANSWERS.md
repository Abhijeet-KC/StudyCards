# Study Flashcards App - Answers

## 1. How to Run

This project uses `pnpm` as the package manager and consists of a Node.js Express backend and a React (Vite) frontend. The SQLite database is automatically generated and seeded on the first backend start.

**Prerequisites:**
- Node.js (v18+)
- pnpm (v8+)

**Step 1: Start the Backend**
Open a terminal at the project root and run:
```bash
cd backend
pnpm install
pnpm run start
```
*The backend will initialize `database.sqlite` automatically and run on `http://localhost:3001`.*

**Step 2: Start the Frontend**
Open a new terminal at the project root and run:
```bash
cd frontend
pnpm install
pnpm run dev
```
*The frontend will run on `http://localhost:5173`. Open this URL in your browser.*

---

## 2. Stack Choice

**Frontend: React + Vite + TypeScript + TailwindCSS**
- **Why:** This stack offers extremely fast local development (Vite), strong type safety preventing runtime crashes (TypeScript), component reusability (React), and rapidly consistent, utility-first styling without context-switching to CSS files (TailwindCSS). It makes building the UI for Study Mode much simpler to organize.

**Backend: Node.js + Express + TypeScript + SQLite**
- **Why:** Express is lightweight and perfect for a relatively small REST API since we don't need a heavy opinionated MVC framework like NestJS. SQLite is chosen because it requires absolutely zero separate database servers, containers, or installations—meeting the requirement for the easiest possible setup on a fresh reviewer machine while still providing relational persistence.

**A Worse Choice: Next.js + MongoDB + AWS Deployment**
- **Why:** Using a hosted MongoDB instance would add an external network dependency, requiring the reviewer to set up `.env` files with connection strings, meaning it fails the "fresh machine execution" test easily. Additionally, a full-stack metaframework like Next.js introduces SSR/hydration complexities that are largely overkill for an offline-first, client-side heavy flashcard application.

---

## 3. One Real Edge Case

**Edge Case:** Defending against global `postcss.config` leaks crashing the Vite server in dirty host environments (e.g., extracting the project ZIP into a `Downloads` folder).
- **File:** `frontend/vite.config.ts`
- **Line Number:** 6 - 8
- **Handling:** I explicitly defined `css: { postcss: {} }` in the Vite configuration. This intercepts and overrides Vite's default behavior, which normally searches recursively up the filesystem tree to find PostCSS configurations.
- **Without this handling:** If a reviewer extracts this project into a directory that happens to harbor a rogue `postcss.config.mjs` from a previous project, Vite would attempt to load it. Because we use `@tailwindcss/vite` natively instead of standard PostCSS plugins, encountering an external config requesting legacy Tailwind modules would instantly crash the `pnpm run dev` server on startup. This expressly isolates the setup so it reliably runs on *any* host machine!

*(Note: Similarly, in `backend/package.json` line 26, `sqlite3` was explicitly added to `pnpm.onlyBuiltDependencies` to stop pnpm from blocking native C++ binding compilations on fresh unzips).*

---

## 4. AI Usage

**Tool:** GitHub Copilot Chat (Agent mode)
**Used for:** 
- Scaffolding the Vite + React workspace and installing core dependencies (`lucide-react`, `tailwindcss`, `react-router-dom`).
- Generating the initial SQLite DB schema and mapping out the CRUD REST routes.
- Generating the skeleton layouts for Tailwind grids.

**What I changed & Why:**
- **Initial Output:** Copilot initially wrote the backend SQLite integration using raw callback patterns (`db.run(sql, params, (err) => {...})`) spread all over the Express routes. 
- **The Change:** I refactored the database initialization into a dedicated `db.ts` file and wrote a Promise-wrapper wrapper around `sqlite3` methods (`query`, `get`, `run`).
- **Why:** Using strictly callback-based code in modern Express creates the "callback hell" pyramid. Wrapping them into Promises allowed me to use clean `async/await` and `try/catch` syntax in the route handlers, greatly improving the maintainability and readability of validation and edge cases.

---

## 5. Honest Gap

**The Gap:** There is **no responsive web design for mobile phones**. The UI layouts, navigation, and flashcard components were rapidly scaffolded for desktop resolutions. Viewing this app on a mobile device will result in a cramped menu, overflowing grids, and a squished or broken Study Mode interface.

**How I would improve it:**
If I had another day, I would systematically refactor the application to be fully mobile-responsive, adhering to a "mobile-first" layout methodology.

- **Fix implementation:** I would leverage Tailwind's responsive screen modifier utility classes (`md:`, `lg:`). Specifically:
  1. I would shift the main `grid` layouts into single-column `flex-col` layouts on small screens, swapping to grids only on `md:` breakpoints or larger.
  2. Implement a hamburger menu to hide the bulky sidebar navigation behind a toggle on cellphones.
  3. Ensure that touch targets on the flashcards, delete buttons, and forms are sufficiently sized (min `44px`) for thumb-tapping.