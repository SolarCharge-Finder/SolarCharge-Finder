# CI/CD Documentation

## Overview

This project uses a comprehensive CI/CD pipeline with GitHub Actions, Docker, and automated testing to ensure code quality and streamline deployments.

## 📋 Components

### 1. GitHub Actions Workflows

#### CI Pipeline (`.github/workflows/ci.yml`)
- **Triggers**: Push/PR to `main` and `develop` branches
- **Backend CI**:
  - Tests on Node.js 18.x and 20.x
  - Runs linting and tests
  - Generates code coverage reports
- **Frontend CI**:
  - Tests on Node.js 18.x and 20.x
  - Runs linting and tests
  - Builds production bundle
  - Checks bundle size
- **Security Audit**:
  - Runs npm audit on both backend and frontend
  - Fails on high severity vulnerabilities

#### CD Pipeline (`.github/workflows/cd.yml`)
- **Triggers**: Push to `main` branch or manual dispatch
- **Actions**:
  - Deploys backend to production
  - Builds and deploys frontend
  - Sends deployment notifications

#### Code Quality (`.github/workflows/code-quality.yml`)
- **Triggers**: Push/PR to `main` and `develop`
- **Actions**:
  - Runs ESLint on backend and frontend
  - Checks for TODO/FIXME comments
  - Optional SonarCloud integration

#### Dependency Updates (`.github/workflows/dependency-update.yml`)
- **Triggers**: Weekly on Mondays at 9 AM UTC
- **Actions**:
  - Checks for outdated dependencies
  - Reports available updates

### 2. Testing Infrastructure

#### Backend Testing (Jest)
- **Config**: `backend/jest.config.js`
- **Test files**: `backend/__tests__/*.test.js`
- **Commands**:
  ```bash
  npm test              # Run tests
  npm run test:watch    # Watch mode
  npm run test:coverage # With coverage
  ```

#### Frontend Testing (Vitest + React Testing Library)
- **Config**: `client/vitest.config.js`
- **Test files**: `client/src/**/*.test.jsx`
- **Commands**:
  ```bash
  npm test              # Run tests
  npm run test:watch    # Watch mode
  npm run test:coverage # With coverage
  ```

### 3. Docker Configuration

#### Development Environment
```bash
# Start all services (MongoDB + Backend + Frontend)
docker-compose up

# With rebuild
docker-compose up --build

# Stop services
docker-compose down
```

**Services**:
- MongoDB: Port 27017
- Backend: Port 5001
- Frontend: Port 3000

#### Production Environment
```bash
# Start production services
docker-compose -f docker-compose.prod.yml up

# With rebuild
docker-compose -f docker-compose.prod.yml up --build
```

**Features**:
- Multi-stage builds for optimization
- Non-root users for security
- Health checks for all services
- Nginx for frontend serving

### 4. Pre-commit Hooks (Husky)

Automatically runs before commits:
- Lints staged files
- Fixes auto-fixable issues
- Prevents commits with errors

Before push:
- Runs all tests
- Prevents push if tests fail

### 5. Code Quality Tools

#### ESLint
- Backend: `.eslintrc.cjs`
- Frontend: `eslint.config.js`

#### Prettier
- Config: `.prettierrc`
- Ignored files: `.prettierignore`

#### EditorConfig
- Config: `.editorconfig`
- Ensures consistent formatting across editors

## 🚀 Getting Started

### Initial Setup

1. **Install dependencies**:
   ```bash
   npm run install:all
   # or
   make install
   ```

2. **Setup Git hooks**:
   ```bash
   npm run prepare
   ```

3. **Configure environment variables**:
   - Backend: `backend/.env`
   - Frontend: `client/.env`

### Development

#### Local Development
```bash
# Start both frontend and backend
npm run dev
# or
make dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend
```

#### Docker Development
```bash
# Using npm
npm run docker:dev

# Using make
make docker-dev
```

### Testing

```bash
# Run all tests
npm test
# or
make test

# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend
```

### Linting

```bash
# Lint all code
npm run lint
# or
make lint

# Auto-fix issues
npm run lint:fix
# or
make lint-fix
```

### Building

```bash
# Build both frontend and backend
npm run build
# or
make build

# Backend build
npm run build:backend

# Frontend build
npm run build:frontend
```

## 📦 Deployment

### GitHub Secrets Required

Set these in GitHub Settings → Secrets → Actions:

**Backend**:
- `MONGODB_PROD_URI`: Production MongoDB connection string
- `JWT_SECRET`: JWT signing secret

**Frontend**:
- `VITE_API_URL`: Production API URL

**Optional**:
- `MONGODB_TEST_URI`: Test database URI for CI
- `SONAR_TOKEN`: SonarCloud token (if using)

### Manual Deployment

1. **Backend Deployment**:
   ```bash
   cd backend
   npm ci --production
   npm start
   ```

2. **Frontend Deployment**:
   ```bash
   cd client
   npm ci
   npm run build
   # Deploy dist/ folder to your hosting service
   ```

### Docker Production Deployment

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

## 🔧 Makefile Commands

Quick reference for available make commands:

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make install` | Install all dependencies |
| `make dev` | Start development servers |
| `make build` | Build for production |
| `make test` | Run all tests |
| `make lint` | Run linters |
| `make lint-fix` | Fix linting issues |
| `make clean` | Clean node_modules and artifacts |
| `make docker-dev` | Start Docker dev environment |
| `make docker-prod` | Start Docker prod environment |
| `make docker-down` | Stop Docker containers |
| `make docker-clean` | Remove containers and volumes |

## 📊 Monitoring & Quality

### Code Coverage
- Backend coverage reports: `backend/coverage/`
- Frontend coverage reports: `client/coverage/`
- Uploaded to Codecov in CI pipeline

### Bundle Analysis
- Frontend bundle size checked in CI
- View in build logs

### Security
- npm audit runs automatically in CI
- Fails build on high severity issues
- Weekly dependency update checks

## 🔐 Best Practices

1. **Never commit**:
   - `.env` files with real credentials
   - `node_modules/`
   - Build artifacts

2. **Always**:
   - Write tests for new features
   - Run linter before committing
   - Update README when adding features
   - Use meaningful commit messages

3. **Code Review**:
   - All changes via Pull Requests
   - Require CI checks to pass
   - At least one approval before merge

## 🐛 Troubleshooting

### CI Failing

**Linting errors**:
```bash
npm run lint:fix
```

**Test failures**:
```bash
npm test
# Check logs and fix failing tests
```

**Build errors**:
```bash
npm run build
# Check error messages
```

### Docker Issues

**Port already in use**:
```bash
# Stop conflicting services
lsof -ti:5001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

**Clean Docker state**:
```bash
make docker-clean
docker system prune -a
```

### Husky Hooks Not Running

```bash
# Reinstall hooks
rm -rf .husky
npm run prepare
```

## 📝 Contributing

1. Create a feature branch
2. Make changes with tests
3. Ensure all tests pass
4. Ensure linter passes
5. Create Pull Request
6. Wait for CI checks
7. Get approval and merge

## 🔄 Continuous Improvement

- Review and update dependencies weekly
- Monitor CI/CD performance
- Add more tests as needed
- Update documentation with changes
- Consider adding:
  - E2E tests with Cypress/Playwright
  - Performance monitoring
  - Error tracking (Sentry)
  - API documentation (Swagger)
