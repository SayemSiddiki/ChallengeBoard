## Challenge Board

Responsive savings challenge board built with **Vite**, **React**, **TypeScript**, and **Tailwind CSS**. Default theme is a modern black UI.

### Features

- **Savings challenge board**: Goal badge, progress, grid of tiles that sum exactly to the goal.
- **Pages**: Home (`/`), Board (`/board`), History (`/history`), Settings (`/settings`), optional Auth (`/auth`).
- **Guest mode**: Fully functional with `localStorage` persistence, no Supabase required.
- **Optional Supabase sync**: Magic link sign-in and data tables for boards, tiles, and deposits.

---

### Tech Stack

- **Build**: Vite (React + TypeScript)
- **UI**: Tailwind CSS (dark / black theme)
- **Routing**: React Router
- **State**: Zustand
- **Persistence**: `localStorage` (guest), optional Supabase

---

### Getting Started

#### 1. Install dependencies

```bash
npm install
```

#### 2. Run the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

---

### App Structure

- `main.tsx`: Bootstraps React and `RouterProvider`.
- `routes.tsx`: Declares routes for Home, Board, History, Settings, and Auth.
- `App.tsx`: Global layout shell (header, footer, dark theme).
- `components/`
  - `Layout.tsx`: Shared layout and navigation.
  - `GoalBadge.tsx`: Top-right goal badge (e.g. `10,000 $`).
  - `TileCard.tsx`: Individual tile card with amount and done state.
  - `ConfirmModal.tsx`: Reusable confirmation modal with note field.
- `screens/`
  - `HomePage.tsx` (`/`): Short headline, **Start** and **Continue as guest** buttons and link to sign in.
  - `BoardPage.tsx` (`/board`): Core challenge board (goal badge, total/remaining, progress bar, tiles, random tile, custom deposit, undo, reset).
  - `HistoryPage.tsx` (`/history`): List of deposits (newest first), filter by month, CSV export.
  - `SettingsPage.tsx` (`/settings`): Set goal amount, tile count (50/100/200), difficulty (easy/mixed/hard), regenerate board.
  - `AuthPage.tsx` (`/auth`): Email magic-link sign-in for Supabase (optional).
- `store/boardStore.ts`: Zustand store with generator, persistence, and actions.
- `utils/csv.ts`: CSV export utility.
- `supabaseClient.ts`: Optional Supabase client factory.

---

### Data & Logic

#### Tile generation

- Generator in `store/boardStore.ts`:
  - `generateTileAmounts(goal, tileCount, difficulty)` creates an array of tile amounts.
  - The **sum always equals the goal** (final adjustments enforce this).
  - **Difficulty rules**:
    - **easy**: more smaller amounts.
    - **mixed**: balanced distribution.
    - **hard**: more larger amounts.
  - Tiles are **shuffled** so their positions feel random.

#### Store shape

`BoardState` in `store/boardStore.ts`:

- `goalAmount`: Total target (e.g. `10000`).
- `tileCount`: Number of tiles (`50 | 100 | 200`).
- `difficulty`: `'easy' | 'mixed' | 'hard'`.
- `tiles`: Array of `{ id, amount, isDone, doneAt?, note? }`.
- `deposits`: Array of `{ id, amount, note?, createdAt, tileId? }`.
- `guestMode`: `true` in this implementation (Supabase sync optional).
- `lastAction`: Keeps last action to support **undo**.

Actions in `BoardStore`:

- `setSettings({ goalAmount, tileCount, difficulty })`: Update goal/settings and regenerate tiles.
- `regenerateBoard()`: Regenerate tiles with current settings.
- `completeTile(tileId, note?)`: Mark tile done, create deposit, and prevent double completion.
- `addCustomDeposit(amount, note?)`: Add manual deposit (does not affect tile states).
- `undoLastAction()`: Undo the most recent tile completion or custom deposit.
- `resetBoard()`: Regenerate tiles and clear deposits.

#### LocalStorage persistence

- Key: `challenge-board-state-v1`.
- Used in `store/boardStore.ts`:
  - `loadInitialState()` loads and parses stored state or generates a default board (`goal=10000`, `tiles=100`, `difficulty='mixed'`).
  - `persistState(state)` saves the board state on every meaningful change.
  - Guest mode works fully offline and persists across refreshes.

#### CSV export utility

- `utils/csv.ts`:
  - `exportDepositsToCsv(deposits)` builds a CSV with columns: `date, amount, note, type`.
  - Automatically downloads a `.csv` file with a date-based filename.
  - Used from the History page **Export CSV** button.

---

### Supabase (Optional)

The app works entirely in **guest mode** using `localStorage`. Supabase is **optional** and only used if environment variables are present.

#### Env vars

Set the following environment variables (e.g. in `.env.local` for local dev, or through your hosting provider):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

When these are present, `supabaseClient.ts` will create a real Supabase client. When missing, it returns `null` and the app gracefully stays in guest mode (no crashes, just disabled auth).

#### Supabase client

- `supabaseClient.ts`:
  - `getSupabaseClient()` reads env vars and creates a `SupabaseClient` using `@supabase/supabase-js`.
  - If env vars are missing, returns `null` so calling code can detect disabled sync.

#### Auth page (`/auth`)

- `screens/AuthPage.tsx`:
  - Simple **email magic link** sign-in form.
  - If Supabase is not configured, the button is disabled and a helper message is shown.
  - On submit, uses `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: <origin>/board } })`.
  - Safe to use even when env vars are missing (it will show a friendly message instead).

#### Suggested Supabase schema

If you want to implement full Supabase sync, create tables with at least:

- `boards`: `id`, `user_id`, `title`, `goal_amount`, `tile_count`, `difficulty`, `created_at`
- `tiles`: `id`, `board_id`, `amount`, `is_done`, `done_at`
- `deposits`: `id`, `board_id`, `amount`, `note`, `created_at`

You can then extend `boardStore` to:

- Load the active board for the current user.
- Push changes (`tiles`, `deposits`) to Supabase on updates.
- Reconcile `localStorage` vs remote data (e.g. on sign-in).

Currently, the app is prepared with a `supabaseClient` and `AuthPage`, but does **not** yet sync the state to Supabase tables so the app remains simple to run locally.

---

### Deployment

#### Build

```bash
npm run build
```

The static files will be generated in the `dist` folder.

---

### Deploy to Vercel

1. Push this project to a Git repository (GitHub, GitLab, etc.).
2. In the Vercel dashboard, **New Project** → Import your repository.
3. Framework preset: **Vite** (or Vercel will auto-detect).
4. Build & output settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Environment variables (if using Supabase):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy.

Vercel will handle preview and production deployments automatically on git pushes.

---

### Deploy to Netlify

1. Push this project to a Git repository.
2. In the Netlify dashboard, **Add new site** → **Import an existing project**.
3. Connect your repository.
4. Build configuration:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Environment variables (if using Supabase):
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
6. Deploy.

Netlify will build and serve the static Vite app with proper history fallback for React Router.

---

### Where to set env vars

- **Local development**: create `.env.local` in the project root:

  ```bash
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

- **Vercel**: Project → Settings → Environment Variables.
- **Netlify**: Site Settings → Build & deploy → Environment → Environment variables.

Remember: variables must be prefixed with `VITE_` to be available at build time in a Vite project.

---

### Notes

- The app is fully usable in **guest mode** out of the box (no Supabase required).
- Tile amounts:
  - Always sum to the current goal.
  - Are shuffled for a random-feeling board.
  - Are weighted by difficulty (easy/mixed/hard).
- Undo is available for the **most recent** action (tile completion or custom deposit).

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
