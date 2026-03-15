# Quick Start Guide

Docker commands and workflows for Tender development.

## Local Development

### First Time Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or your preferred editor

# Build and start all services in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f
```

Access the application at http://localhost:8081

### Daily Development

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart app

# View logs for a service
docker-compose logs -f app

# Rebuild after adding new dependencies
docker-compose build app
docker-compose up -d app
```

### Database Operations

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U tender

# Reset database (careful!)
docker-compose down -v
docker-compose up -d postgres app
```

### Debugging

```bash
# Enter container shell
docker-compose exec app sh

# Check container status
docker-compose ps

# Inspect container logs
docker-compose logs postgres
docker-compose logs app

# Check web service
curl http://localhost:8081/
```

### Cleanup

```bash
# Stop and remove containers (keeps data)
docker-compose down

# Stop, remove containers and volumes (clears database)
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a
```

## Production Deployment

### Update Environment

Ensure your `.env` contains the required production credentials.

### Build Production Images

```bash
# Build production web bundle image
docker build --target production -t tender-app-prod .

# Run production container locally on port 80
docker run -p 8080:80 -d tender-app-prod
```

## Service URL Reference

| Service | Local URL | Description |
|---------|-----------|-------------|
| App (Dev) | http://localhost:8081 | Frontend application (hot-reloading) |
| PostgreSQL | localhost:5432 | Database |

## Common Issues

**Container won't start:**
```bash
docker-compose logs <service-name>
```

**Port conflict:**
```bash
# Change port mapping in docker-compose.yml or use APP_PORT in .env
# APP_PORT=8082
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
