# Architecture & Demo Script

Summary (one page)

- **Project:** SolarCharge-Finder — Node/Express backend + React (Vite) frontend.
- **Backend:** `backend/` — Express (ESM), Mongoose models, controllers in `backend/controllers`, routes in `backend/routes`, middleware in `backend/middleware`. Tests live in `backend/__tests__` and use Jest + mongodb-memory-server for integration tests.
- **Frontend:** `client/` — React 18 + Vite, routing with React Router, map features in `client/src/components/map`. Tests use Vitest + React Testing Library under `client/src/.../__tests__`.
- **CI & Perf:** GitHub Actions workflow added at `.github/workflows/ci.yml`. Performance artifacts and baseline are under `backend/` (`artillery.yml`, `artillery_report.json`, `PERFORMANCE_RESULTS.md`).

Key files
- `backend/app.js` — server entry, middleware wiring, centralized error handler.
- `backend/controllers/*` — business logic (users, stations, reviews).
- `backend/models/*` — Mongoose schemas (`ChargingStationModel.js`, `Review.js`, `User.js`).
- `client/src/pages` & `client/src/components` — UI and features.

Quick demo script

Prereqs: Node 18+, npm, MongoDB (or point to a hosted DB). Create a `.env` using `env.example` if present.

1. Start backend (dev):

```bash
cd backend
npm install
npm run dev
# or: NODE_ENV=development node server.js
```

2. Start frontend (dev):

```bash
cd client
npm install
npm run dev
# open the vite URL (usually http://localhost:5173)
```

3. Run test suites locally

```bash
# Backend
cd backend
npm test

# Frontend
cd ../client
npm test
```

4. Smoke the API (example):

```bash
curl -sS "http://localhost:5001/api/stations" | jq .
```

Notes & recommendations
- Use the GitHub Actions CI added in `.github/workflows/ci.yml` to run tests on PRs.
- For performance runs, see `backend/artillery.yml` and `backend/PERFORMANCE_RESULTS.md`.
- Add a Postman environment for easy auth token injection (there is a scaffold `postman_collection.json`).
