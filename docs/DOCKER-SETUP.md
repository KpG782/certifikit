# 🐳 Docker Deployment Guide

Complete guide for deploying CertifiKit using Docker and Docker Compose.

## 📋 Prerequisites

- Docker Engine 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose v2.0+ (included with Docker Desktop)
- Git (for cloning the repository)
- 2GB+ available RAM
- 5GB+ available disk space

## 🚀 Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/KpG782/certifikit.git
cd certifikit
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit with your preferred text editor
nano .env.local  # or vim, code, etc.
```

**Minimum required configuration:**

```env
# Authentication
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=YourSecurePassword123!

# Session (generate a random 32+ character string)
SESSION_SECRET=your-random-secret-key-minimum-32-characters

# Optional: Database for email queue
# DATABASE_URL=postgresql://user:password@postgres:5432/certifikit_db

# Optional: n8n webhook for email automation
# N8N_WEBHOOK_URL=https://your-n8n.com/webhook/certificate-email-api
```

### 3. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Check status
docker-compose ps
```

### 4. Access the Application

Open your browser and navigate to:

- **Application**: http://localhost:3000
- **Login**: Use the credentials from `.env.local`

## 🏗️ Architecture

### Docker Compose Services

```yaml
services:
  app: # Next.js application (Port 3000)
  postgres: # PostgreSQL database (Optional, Port 5432)
  n8n: # n8n workflow automation (Optional, Port 5678)
```

### Container Structure

```
certifikit:latest
├── Node.js 20 Alpine
├── pnpm package manager
├── Next.js 14 (production build)
├── Environment variables
└── User: nextjs (non-root)
```

## 📦 Docker Configuration Files

### Dockerfile

Multi-stage build optimized for production:

1. **base**: Node.js 20 Alpine with pnpm
2. **deps**: Install dependencies with frozen lockfile
3. **builder**: Build Next.js application
4. **runner**: Production runtime (minimal size)

Key features:

- ✅ Multi-stage build (smaller final image ~200MB)
- ✅ Non-root user (security)
- ✅ Production optimizations
- ✅ Health checks
- ✅ Layer caching

### docker-compose.yml

Complete stack configuration:

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.local
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: certifikit_db
      POSTGRES_USER: cert_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### .dockerignore

Optimized to exclude unnecessary files:

```ignore
node_modules
.next/
.git
*.log
.env*.local
docs/
```

## 🔧 Common Docker Commands

### Basic Operations

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app

# Execute commands in container
docker-compose exec app sh

# Rebuild after code changes
docker-compose up -d --build
```

### Maintenance

```bash
# View resource usage
docker stats

# Clean up unused images
docker image prune -a

# Clean up everything (CAUTION: removes volumes)
docker-compose down -v

# Backup database
docker-compose exec postgres pg_dump -U cert_admin certifikit_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U cert_admin certifikit_db < backup.sql
```

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs app

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues

```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U cert_admin -d certifikit_db -c '\dt'
```

### Out of Memory

```bash
# Increase Docker memory limit (Docker Desktop)
# Settings > Resources > Memory > 4GB+

# Or add to docker-compose.yml
services:
  app:
    mem_limit: 2g
```

## 🔒 Security Best Practices

### 1. Change Default Credentials

```env
NEXT_PUBLIC_ADMIN_USERNAME=your_secure_username
NEXT_PUBLIC_ADMIN_PASSWORD=ComplexPassword123!@#
DB_PASSWORD=AnotherSecurePassword456!
```

### 2. Use Secrets Management

For production, use Docker secrets:

```yaml
secrets:
  db_password:
    external: true

services:
  app:
    secrets:
      - db_password
```

### 3. Enable HTTPS

Use a reverse proxy (nginx, Traefik, Caddy):

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

### 4. Network Isolation

```yaml
networks:
  frontend:
  backend:

services:
  app:
    networks:
      - frontend
      - backend

  postgres:
    networks:
      - backend # Not exposed to internet
```

## 📊 Performance Optimization

### 1. Build Cache

Use BuildKit for faster builds:

```bash
DOCKER_BUILDKIT=1 docker-compose build
```

### 2. Multi-stage Efficiency

The Dockerfile already uses multi-stage builds:

- Dependencies cached in separate layer
- Only production files in final image
- ~80% smaller final image

### 3. Resource Limits

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M
```

## 🌐 Production Deployment

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml certifikit

# Scale service
docker service scale certifikit_app=3
```

### Using Kubernetes

```bash
# Convert docker-compose to k8s
kompose convert

# Deploy to k8s
kubectl apply -f .
```

### Cloud Platforms

#### AWS ECS

```bash
# Install ECS CLI
ecs-cli compose up

# Or use CDK/CloudFormation
```

#### Azure Container Instances

```bash
az container create \
  --resource-group certifikit \
  --name certifikit-app \
  --image certifikit:latest
```

#### Google Cloud Run

```bash
gcloud run deploy certifikit \
  --source . \
  --platform managed
```

## 🔄 Updates and Upgrades

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Verify new version
docker-compose exec app node -v
```

### Database Migrations

```bash
# Backup before migration
docker-compose exec postgres pg_dump -U cert_admin certifikit_db > backup-$(date +%Y%m%d).sql

# Run migrations (if applicable)
docker-compose exec app npm run migrate

# Rollback if needed
docker-compose exec -T postgres psql -U cert_admin certifikit_db < backup-20250117.sql
```

## 📝 Environment Variables Reference

| Variable                     | Required | Default      | Description            |
| ---------------------------- | -------- | ------------ | ---------------------- |
| `NODE_ENV`                   | No       | `production` | Node environment       |
| `NEXT_PUBLIC_ADMIN_USERNAME` | Yes      | `admin`      | Admin username         |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Yes      | -            | Admin password         |
| `SESSION_SECRET`             | Yes      | -            | Session encryption key |
| `DATABASE_URL`               | No       | -            | PostgreSQL connection  |
| `N8N_WEBHOOK_URL`            | No       | -            | n8n webhook endpoint   |
| `PORT`                       | No       | `3000`       | Application port       |

## 🆘 Support

- **Issues**: https://github.com/KpG782/certifikit/issues
- **Discussions**: https://github.com/KpG782/certifikit/discussions
- **Email**: support@certifikit.com

## 📄 License

MIT License - See [LICENSE](../LICENSE) for details
