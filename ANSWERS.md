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

**Edge Case:** Preventing deletion of the predefined subjects (Math, Physics, DBMS, OS).
- **File:** `backend/src/index.ts`
- **Line Number:** 40 - 43
- **Handling:** When the `DELETE /subjects/:id` endpoint is called, the code explicitly checks if the ID belongs to the seeded default subjects (`[1, 2, 3, 4]`). If it does, it immediately returns a `403 Forbidden` response (`Cannot delete predefined subjects`).
- **Without this handling:** A user could delete the foundational subjects (e.g., "Math"), which would execute the `ON DELETE CASCADE` rule in the database, silently wiping out all topics and flashcards associated with it and ruining the core experience of the app.

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

**The Gap:** The **Study Mode** shuffling logic scales poorly and doesn't actually track learning progress. Right now, it pulls all flashcards into the browser and randomly shuffles the array in React state. It does let you click "Easy/Medium/Hard" which saves back to the database, but it ignores that difficulty when selecting the next cards.

**How I would improve it:**
If I had another day, I would fundamentally rework Study Mode to use a **Spaced Repetition Algorithm** (like SuperMemo-2 or Anki's logic).
- **Fix implementation:** I'd add a `CardReviews` table tracking the next scheduled review date and the ease factor for each card. The backend would provide an endpoint (`GET /flashcards/due`) that intelligently returns only the cards the user is at risk of forgetting today, ordered by urgency, rather than doing a naive random shuffle on the client.