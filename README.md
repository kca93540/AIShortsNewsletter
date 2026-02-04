# AICards

AICards is a Chrome new tab extension that shows a sticky-note style AI flashcard widget with rotating AI concepts. It runs with a small Node/Express backend, SQLite database, and seeded curriculum-based cards so it works offline and without API keys.

## Requirements

- Node.js 18+
- npm

## Setup

```bash
npm install
```

Copy env file for the server:

```bash
cp .env.example server/.env
```

Initialize the database and seed cards:

```bash
npm run db:setup
```

## Run locally

Start both server and extension dev servers:

```bash
npm run dev:all
```

- Server runs on `http://localhost:4000`
- Extension dev server runs on `http://localhost:5173`

## Build the extension

```bash
npm --prefix extension run build
```

The extension build output is in `extension/dist`.

## Load the extension in Chrome

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `extension/dist` folder.
5. Open a new tab to see the AICards widget.

## How to use

- **Next**: Load another card (avoids recently seen cards).
- **Save**: Toggle saved status for the current card.
- **Mark understood**: Toggle understood status.
- **Explain simpler**: Simplify the card (uses OpenAI if `OPENAI_API_KEY` is set; otherwise deterministic heuristics).
- **Hide for today**: Hides the widget until tomorrow.
- **Refresh now**: Rotate the active card immediately (requires `ADMIN_KEY`, defaults to `local-admin-key`).

## API endpoints

- `GET /api/card/active` → current active card
- `POST /api/card/next` → next card for the user
- `POST /api/card/:id/save` → toggle save
- `POST /api/card/:id/understood` → toggle understood
- `POST /api/card/:id/simplify` → simplified card fields
- `GET /api/user/state` → saved + understood lists
- `POST /api/admin/rotate` → manual rotate (use `x-admin-key` header)

## Notes

- Rotation schedule defaults to Mon/Wed/Fri at 8:00 AM local time.
- Seed data includes 30+ beginner AI cards so the app works without any API keys.
