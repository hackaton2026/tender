# Quick Start Guide

Docker commands and workflows for Tender development.

## Local Development

### First Time Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or your preferred editor

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

Access the application at http://localhost:3000

### Daily Development

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart api
docker-compose restart app

# View logs for a service
docker-compose logs -f api
docker-compose logs -f app

# Rebuild after code changes
docker-compose build api
docker-compose up -d api
```

### Database Operations

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U tender

# Run migrations (when implemented)
docker-compose exec api npm run migrate

# Reset database (careful!)
docker-compose down -v
docker-compose up -d postgres
docker-compose up -d api app
```

### Debugging

```bash
# Enter container shell
docker-compose exec api sh
docker-compose exec app sh

# Check container status
docker-compose ps

# Inspect container logs
docker-compose logs postgres
docker-compose logs api
docker-compose logs app

# Check health status
docker-compose exec api curl http://localhost:3001/health
docker-compose exec app curl http://localhost:3000/
```

### Cleanup

```bash
# Stop and remove containers (keeps data)
docker-compose down

# Stop, remove containers and volumes (clears database)
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a

# Remove images only
docker image prune -a
```

## Production Deployment

### Update Environment

```bash
# Update production secrets
# Variables:
# POSTGRES_PASSWORD
# JWT_SECRET
# Any API keys needed
```

### Build Production Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build --no-cache api
```

### Check Configuration

```bash
# Verify docker-compose syntax
docker-compose config

# Check environment variables
docker-compose config | grep -v "_"
```

## Service URL Reference

| Service | Local URL | Description |
|---------|-----------|-------------|
| App | http://localhost:3000 | Frontend application |
| API | http://localhost:3001 | Backend API |
| PostgreSQL | localhost:5432 | Database |

## Common Issues

**Container won't start:**
```bash
docker-compose logs <service-name>
```

**Port conflict:**
```bash
# Change port in .env
# APP_PORT=3001
# API_PORT=3002
```

**Database connection failed:**
```bash
# Check postgres is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U tender -c "SELECT 1"
```

## Useful Aliases

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcr='docker-compose restart'
alias dcb='docker-compose build'
```

Then use:
```bash
dcu    # up -d
dcd    # down
dcl    # logs -f
```

## Next Steps

1. Complete `.env` configuration
2. `docker-compose up -d` to start
3. Visit http://localhost:3000
4. Check logs with `docker-compose logs -f`
