# Multi-Environment Docker Compose Guide

This setup enables DEV, TEST, and PROD environments to run simultaneously on the same machine with zero port conflicts.

## Architecture Overview

### Base Configuration (`docker-compose.yml`)
- Contains ONLY shared configuration (services, networks, build contexts)
- NO port mappings
- NO container names
- NO environment-specific settings
- Generic volume names (no `-dev`, `-test`, `-prod` suffixes)

### Environment Overrides

#### Development (`docker-compose.dev.yml`)
```
Database Ports:  5432, 5433, 5434
Backend Ports:   8081, 8082, 8083
Frontend Port:   3000
Profile:         dev
Volumes:         *_data_dev
```

#### Testing (`docker-compose.test.yml`)
```
Database Ports:  None exposed (internal only)
Backend Ports:   8181, 8182, 8183
Frontend Port:   3001
Profile:         test
Volumes:         *_data_test
Restart Policy:  on-failure
```

#### Production (`docker-compose.prod.yml`)
```
Database Ports:  None exposed (internal only)
Backend Ports:   None exposed (internal only)
Frontend Port:   8080 (single entry point)
Profile:         prod
Volumes:         *_data_prod
Restart Policy:  always
```

## Usage

### Run Single Environment

**Development:**
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

**Testing:**
```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml up
```

**Production:**
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Run All Three Simultaneously

```bash
# Terminal 1: Development
docker compose -p dev -f docker-compose.yml -f docker-compose.dev.yml up

# Terminal 2: Testing
docker compose -p test -f docker-compose.yml -f docker-compose.test.yml up

# Terminal 3: Production (background)
docker compose -p prod -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Access Services

**Development:**
- User Service: http://localhost:8081
- Job Service: http://localhost:8082
- Application Service: http://localhost:8083
- Frontend: http://localhost:3000
- User DB: localhost:5432
- Job DB: localhost:5433
- Application DB: localhost:5434

**Testing:**
- User Service: http://localhost:8181
- Job Service: http://localhost:8182
- Application Service: http://localhost:8183
- Frontend: http://localhost:3001
- Databases: Internal only

**Production:**
- Frontend: http://localhost:8080
- Backend Services: Internal only (no external access)
- Databases: Internal only (no external access)

## Key Features

✅ **Zero Port Conflicts** - Each environment uses unique ports
✅ **Data Isolation** - Separate volumes per environment
✅ **Docker Compose Layering** - Override files extend base configuration
✅ **Project Isolation** - Use `-p` flag for unique project names
✅ **Production Security** - Backend services not exposed externally in PROD
✅ **Health Checks** - All databases have built-in health checks
✅ **Service Dependencies** - Proper startup order with health conditions
✅ **Network Isolation** - Services communicate internally via Docker network

## Cleanup

**Remove specific environment:**
```bash
docker compose -p dev -f docker-compose.yml -f docker-compose.dev.yml down -v
docker compose -p test -f docker-compose.yml -f docker-compose.test.yml down -v
docker compose -p prod -f docker-compose.yml -f docker-compose.prod.yml down -v
```

**Remove everything:**
```bash
docker compose down -v  # Default project
docker compose -p dev down -v
docker compose -p test down -v
docker compose -p prod down -v
```

## Notes

- Database containers don't expose ports in TEST and PROD (internal Docker network only)
- Backend services don't expose ports in PROD (internal Docker network only)
- Frontend is the only external entry point in PROD (port 8080)
- Each environment maintains separate persistent data via volumes
- Use `docker compose logs -f` to monitor any environment
- Use `-d` flag for background execution (recommended for PROD)
