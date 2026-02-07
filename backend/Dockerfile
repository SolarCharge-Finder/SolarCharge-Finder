# Backend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5001

CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

USER expressjs

EXPOSE 5001

ENV NODE_ENV=production

CMD ["node", "server.js"]
