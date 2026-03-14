# Multi-stage Dockerfile for Tender platform
# Supports building both app (frontend) and api (backend) services

# Base image with Node.js
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Set default environment variables
ENV NODE_ENV=production
ENV PNPM_VERSION=9

# Install pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# API build stage
FROM dependencies AS api-build
# Copy shared types and utilities
COPY shared ./shared
COPY api ./api

# Build API (adjust based on your build tool)
RUN pnpm --filter api build

# API production stage
FROM base AS api
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=api-build /app/api ./api
COPY --from=api-build /app/shared ./shared

# Expose API port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start API
CMD ["pnpm", "--filter", "api", "start"]

# App build stage
FROM dependencies AS app-build
# Copy shared types and utilities
COPY shared ./shared
COPY app ./app

# Build app (adjust based on your build tool)
RUN pnpm --filter app build

# App production stage
FROM node:20-alpine AS app
WORKDIR /app

# Copy built app
COPY --from=app-build /app/app/build ./app/build
COPY app/package.json ./app

# Expose app port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start app
CMD ["npm", "start"]
