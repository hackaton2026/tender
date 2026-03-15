# Docker Setup & Deployment

This guide covers Docker development setup and deployment for the Tender application.

## Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Node 20+ (for local development outside Docker, optional)

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
# Build and start the app (development mode) and postgres database
docker-compose up --build -d

# View logs
docker-compose logs -f
```

3. **Access services:**
- Frontend (app): http://localhost:8081
- PostgreSQL: localhost:5432

### Useful Docker Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v

# Rebuild and restart the app service
docker-compose up -d --build app

# Run commands in a container
docker-compose exec app sh
docker-compose exec postgres psql -U tender

# View logs for specific service
docker-compose logs -f app
```

## Architecture

### Services

#### App (Frontend)
- **Base:** Node 20 with Alpine Linux
- **Port:** 8081 (Expo Web development server)
- **Volumes:**
  - `.` -> `/app` (hot reload in development)
  - `node_modules` (cached)
- **Environment:**
  - `DATABASE_URL`
  - `PORT` (default 8081)

#### PostgreSQL
- **Image:** postgres:16-alpine
- **Port:** 5432
- **Data Volume:** `postgres_data` (persistent)
- **Health Check:** PG_ISREADY endpoint
- **Default Database:** `tender`

### Networks
All services communicate over the `tender-network` bridge network.

### Volumes
- `postgres_data`: PostgreSQL database persistence
- `node_modules`: Shared Node modules cache

## Production Deployment

### Building for Production

The `Dockerfile` supports multi-stage builds. The production target (`production`) compiles the Expo web app to static files and serves them using Nginx.

To build and run the production image manually:
```bash
# Build the production image
docker build --target production -t tender-app:latest .

# Run the production image on port 80
docker run -p 80:80 tender-app:latest
```

### Coolify Deployment (Example)

1. Create a new "Static Site" or "Docker" application
2. Set repository to your tender repo
3. Branch: `main`
4. Build settings:
   - **Dockerfile path:** `Dockerfile`
   - **Docker build context:** `.`
   - **Build target:** `production`
5. Environment variables (build time):
```
DATABASE_URL=${DATABASE_URL}
```
6. Port: `80` (Nginx default)
7. Deploy.
