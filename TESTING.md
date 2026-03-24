# Testing Instructions

This document describes how to run unit, integration, and performance tests for the SolarCharge Finder project.

## 1) Unit tests (backend)

- Run from the `backend` folder:

```bash
cd backend
npm install
npm test
```

- Notes:
  - Unit tests are written with Jest. Existing unit tests live under `backend/__tests__` and use ESM mocks.
  - The test script sets `NODE_ENV=test` and runs Jest with experimental ESM support.

## 2) Integration tests (backend)

- What they do:
  - Spin up an in-memory MongoDB instance using `mongodb-memory-server`.
  - Import the Express `app` (no server listen) and run HTTP requests against it using `supertest`.

- Run:

```bash
cd backend
npm install
npm test
```

The integration test file is `backend/__tests__/integration.api.test.js` and will run as part of the Jest suite.

## 3) Performance testing (Artillery)

- Requirements:
  - Install Artillery globally or use npx.

- Run a simple load test hitting `/api/stations` (server must be running locally on port 5001):

```bash
cd backend
# start the server (in a separate terminal)
npm run dev

# run the Artillery scenario
npx artillery run artillery.yml
```

Adjust `artillery.yml` to tune duration, arrivalRate and endpoints.

## 4) Testing environment configuration

- Integration tests rely on `process.env.MONGODB_URI` being set to the in-memory server URI. The integration test sets this automatically before importing the app.
- If you want to run tests against a real MongoDB instance, set `MONGODB_URI` in the environment before running tests.

Example (macOS / Linux):

```bash
export MONGODB_URI="mongodb://localhost:27017/solarcharge_test"
npm test
```

## 5) Additional notes and next steps

- Frontend unit/integration testing:
  - The client uses Vite + Vitest/Jest for frontend tests. To add coverage for React components, create tests under `client/src/__tests__` and use the project's existing test runner.

- CI:
  - Ensure CI installs devDependencies, sets `NODE_ENV=test`, and runs `npm test` in the `backend` folder.

If you want, I can:

- Add more integration tests covering authenticated endpoints and CRUD flows.
- Add a simplified Artillery script to POST and GET through common flows.
