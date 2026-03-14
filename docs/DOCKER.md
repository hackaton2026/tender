# Docker Setup & Deployment

This guide covers Docker development setup and Coolify deployment for the Tender platform.

## Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Node 20+ (for local development outside Docker)

### Local Development

1. **Clone and setup environment:**
```bash
git clone https://git.myceli.al/deiim/tender.git
cd tender
cp .env.example .env
# Edit .env with your configuration
```

2. **Build and start services:**
```bash
# Build all services
docker-compose build

# Start all services (postgres, api, app)
docker-compose up -d

# View logs
docker-compose logs -f
```

3. **Access services:**
- Frontend (app): http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

### Useful Docker Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v

# Rebuild a specific service
docker-compose build app
docker-compose up -d app

# Run commands in a container
docker-compose exec api sh
docker-compose exec app sh
docker-compose exec postgres psql -U tender

# View logs for specific service
docker-compose logs -f api
docker-compose logs -f app
```

## Architecture

### Services

#### PostgreSQL
- **Image:** postgres:16-alpine
- **Port:** 5432
- **Data Volume:** `postgres_data` (persistent)
- **Health Check:** PG_ISREADY endpoint
- **Default Database:** `tender`

Configuration via environment variables:
- `POSTGRES_USER` (default: tender)
- `POSTGRES_PASSWORD` (default: tender_dev_password)
- `POSTGRES_DB` (default: tender)
- `POSTGRES_PORT` (default: 5432)

#### API
- **Base:** Node 20 with Alpine Linux
- **Port:** 3001
- **Volumes:** 
  - `./api:/app/api` (hot reload in development)
  - `./shared:/app/shared`
  - `node_modules` (cached)
  - `api-build` (build artifacts)
- **Dependencies:** PostgreSQL container (waits for healthy status)
- **Health Check:** HTTP GET /health endpoint

#### App (Frontend)
- **Base:** Node 20 with Alpine Linux
- **Port:** 3000
- **Volumes:**
  - `./app:/app/app` (hot reload in development)
  - `./shared:/app/shared`
  - `node_modules` (cached)
  - `app-build` (build artifacts)
- **Dependencies:** API container

### Networks
All services communicate over the `tender-network` bridge network. Services can reference each other by service name (e.g., `postgres://postgres:5432/...`).

### Volumes
- `postgres_data`: PostgreSQL database persistence
- `node_modules`: Shared Node modules cache
- `api-build`: API build artifacts
- `app-build`: Frontend build artifacts

## Coolify Deployment

### Prerequisites
- Coolify account on myceli.al
- Repository access to tender on myceli.al
- Coolify CLI (optional but recommended)

### Initial Setup

1. **Configure Coolify repository:**
```bash
# Install Coolify CLI
npm install -g @coolify/sdk-cli

# Login and configure
coolify login
```

### Deployment Strategy

For Tender, we recommend **separate deployments** for development and production:

#### Option A: Single Deployment (Simpler)
Deploy all services (postgres, api, app) in one composite service.

**Pros:** Easier setup, shared networking
**Cons:** Harder to scale independently

#### Option B: Separate Services (Recommended)
Deploy each service as a separate Coolify app.

**Pros:**
- Independent scaling
- Better resource allocation
- Easier debugging
- Can scale API independently of frontend

**Cons:** More initial setup

### Step-by-Step Coolify Deployment

#### 1. PostgreSQL Deployment

1. In Coolify, create a new "Database" application
2. Set image to: `postgres:16-alpine`
3. Environment variables:
```
POSTGRES_USER=tender
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=tender
```
4. Add persistent volume: `/var/lib/postgresql/data`
5. Deploy and note the generated connection string

#### 2. API Deployment

1. Create a new "Node.js" application
2. Set repository to your tender repo
3. Branch: `main` (or your production branch)
4. Build settings:
   - **Dockerfile path:** `Dockerfile`
   - **Docker build context:** `.`
   - **Build target:** `api`
5. Environment variables:
```
NODE_ENV=production
DATABASE_URL=${DATABASE_URL}
API_PORT=3001
# Add other necessary env vars from .env.example
```
6. Port: `3001`
7. Health check endpoint: `/health`
8. Link to PostgreSQL service for networking
9. Deploy

#### 3. App Deployment

1. Create a new "Node.js" or "Static Site" application
2. Set repository to your tender repo
3. Branch: `main`
4. Build settings:
   - **Dockerfile path:** `Dockerfile`
   - **Docker build context:** `.`
   - **Build target:** `app`
5. Environment variables:
```
NODE_ENV=production
API_URL=https://api.yourdomain.com
APP_PORT=3000
# Add frontend-specific env vars
```
6. Port: `3000`
7. Health check endpoint: `/`
8. Link to API service for networking
9. Deploy

#### 4. Networking Configuration

In Coolify, ensure services can communicate:

1. PostgreSQL -> API: Coolify automatically handles this if you link services
2. App -> API: Configure `API_URL` environment variable to point to your API's Coolify-assigned domain

### Coolify-Specific Environment Variables

Coolify automatically sets these during deployment:
```
COOLIFY_APP_ID=<app-id>
COOLIFY_DOMAIN=<app-domain>
```

Add these to your `.env.example` to detect Coolify deployment.

### CI/CD Pipeline

Coolify automatically deploys on git push to your selected branch. To control this:

**Auto-deploy on push:**
```yaml
# In Coolify app settings
Auto deploy on push: ✅ enabled
```

**Manual deployment only:**
```yaml
# Disable auto-deploy and deploy manually via:
coolify deploy <app-id>
```

### Configuration Management

#### Development vs Production

Use Coolify's environment variable management:

1. **Development branch:** Use `.env.example` defaults for testing
2. **Production branch:** Set secure production values
3. **Coolify secrets:** Store sensitive values as Coolify secrets

#### Example .env for Production

```bash
NODE_ENV=production
POSTGRES_PASSWORD=<secure password from password manager>
DATABASE_URL=postgresql://tender:<password>@postgres-service:5432/tender
API_URL=https://api.yourdomain.com
JWT_SECRET=<generate with openssl rand -hex 32>
```

### Monitoring & Logging

#### Access Logs
```bash
# Via Coolify CLI
coolify logs <app-id> --follow

# Via Coolify web UI
# Navigate to Application > Logs
```

#### Health Checks
All services include health checks:

- **PostgreSQL:** PG_ISREADY endpoint (port 5432)
- **API:** HTTP GET /health (port 3001)
- **App:** HTTP GET / (port 3000)

Coolify monitors these and restarts unhealthy containers automatically.

### Scaling

#### Vertical Scaling
Adjust resources per service in Coolify:

1. Go to Service Settings
2. Set CPU and Memory limits
3. PostgreSQL: Requires at least 512MB RAM
4. API: Scale based on expected load
5. App: Less CPU intensive, 256-512MB sufficient

#### Horizontal Scaling (Advanced)
For high-traffic deployments, create multiple API instances behind a load balancer:

1. Deploy API to multiple Coolify regions
2. Configure Coolify load balancer
3. Configure sticky sessions if needed

### Troubleshooting

#### Container Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Common issues:
# 1. Port conflicts - check with lsof -i :<port>
# 2. Environment variables missing
# 3. Dependency service unhealthy
```

#### Database Connection Issues
```bash
# Test database connection from API container
docker-compose exec api sh
psql $DATABASE_URL

# Verify postgres is healthy
docker-compose ps postgres
```

#### Build Failures
```bash
# Clear build cache
docker-compose build --no-cache

# Check for dependency issues
docker-compose exec api sh
pnpm install
```

#### Coolify Deployment Fails
1. Check build logs in Coolify UI
2. Verify branch status and recent commits
3. Ensure Dockerfile syntax is correct
4. Check environment variable references

### Security Best Practices

1. **Never commit secrets:** Use Coolify secrets or `.env.example` values
2. **Secure database:** Use strong passwords, restrict inbound access
3. **HTTPS everywhere:** Enable HTTPS in Coolify for all services
4. **Regular updates:** Keep base images updated (Dockerfile, docker-compose.yml)

### Resource Requirements

**Minimum for development:**
- CPU: 2 cores
- RAM: 4GB
- Disk: 10GB

**Recommended for production:**
- CPU: 4+ cores (for API)
- RAM: 8GB+ (2GB DB, 4GB API, 2GB App)
- Disk: 50GB+ (video content grows quickly)

## Next Steps

1. Clone and setup your `.env` file
2. Test locally with `docker-compose up -d`
3. Configure services in Coolify
4. Deploy and verify each service
5. Set up monitoring and alerts
6. Configure backup strategy for PostgreSQL

## Additional Resources

- [Coolify Documentation](https://coolify.io/docs)
- [Docker Compose Reference](https://docs.docker.com/compose)
- [PostgreSQL on Docker](https://hub.docker.com/_/postgres)