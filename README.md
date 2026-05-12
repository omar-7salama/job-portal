# Job Portal System

A full-stack Job Portal System built with microservices architecture, connecting employers and job seekers on a single platform. Backend REST APIs developed with Spring Boot (Java), frontend with React + TypeScript, containerized with Docker, orchestrated with Kubernetes, and monitored with Prometheus + Grafana.

## 📋 Overview

This project implements a scalable recruitment platform where employers can post jobs, manage applications, and review candidates, while job seekers can search for jobs and apply directly. The system uses a microservices architecture deployed on Linux with Docker and Kubernetes.

## 📁 Project Structure

```
job-portal/
├── user-service/              # Spring Boot - User management & auth
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── job-service/               # Spring Boot - Job listings CRUD
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── application-service/       # Spring Boot - Application tracking
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── Frontend/                  # React + TypeScript SPA
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── k8s/                       # Kubernetes manifests
│   ├── namespace.yaml
│   ├── config-and-secrets.yaml
│   ├── persistent-volumes.yaml
│   ├── users-db.yaml
│   ├── jobs-db.yaml
│   ├── applications-db.yaml
│   ├── user-service.yaml
│   ├── job-service.yaml
│   ├── application-service.yaml
│   ├── frontend.yaml
│   ├── ingress.yaml
│   └── deploy.sh
├── prometheus.yml             # Prometheus scrape config
├── docker-compose.yml         # Base compose config
├── docker-compose.dev.yml     # Development environment
├── docker-compose.test.yml    # Testing environment
└── docker-compose.prod.yml    # Production environment
```

## 🔧 Requirements

### Prerequisites
- Docker Engine / Docker Desktop
- Java 17+
- Maven 3.9+
- Node.js 20+
- kubectl + Minikube (for Kubernetes)

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript + Vite | React 18 |
| Backend | Spring Boot (Java) | 3.2.5 |
| Database | PostgreSQL | 15 |
| Containerization | Docker + Docker Compose | Latest |
| Orchestration | Kubernetes (Minikube) | Latest |
| Monitoring | Prometheus + Grafana | Latest |
| Styling | Tailwind CSS | 3.x |

## 📋 Features

### 1. **User Management**
- Register as Job Seeker or Employer
- Login with role-based access control
- Profile management

### 2. **Job Listings**
- Employers can post, update, and delete jobs
- Job Seekers can search by title, company, location, and type
- Filter by: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP

### 3. **Application Tracking**
- Job Seekers apply with cover letters
- Employers manage applications per job
- Status flow: PENDING → REVIEWED → ACCEPTED / REJECTED

### 4. **Docker Multi-Environment**
- Development, Testing, and Production environments
- All three can run simultaneously on the same machine
- Docker Compose layering (base + overrides)

### 5. **Kubernetes Orchestration**
- Deployments with 2 replicas per service
- StatefulSets for databases with PersistentVolumes
- Ingress for unified traffic routing
- ConfigMaps and Secrets for configuration

### 6. **Monitoring & Logging**
- Prometheus scrapes metrics every 15 seconds
- Spring Boot Actuator exposes `/actuator/prometheus`
- Grafana dashboards for JVM, HTTP, and DB metrics

## 🚀 Usage

### Run Development Environment
```bash
docker compose -p dev -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Run All Three Environments Simultaneously
```bash
# Terminal 1 - Development
docker compose -p dev -f docker-compose.yml -f docker-compose.dev.yml up

# Terminal 2 - Testing
docker compose -p test -f docker-compose.yml -f docker-compose.test.yml up

# Terminal 3 - Production
docker compose -p prod -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Deploy to Kubernetes
```bash
# Build and load images into Minikube
docker build -t job-portal/user-service:1.0.0 ./user-service
docker build -t job-portal/job-service:1.0.0 ./job-service
docker build -t job-portal/application-service:1.0.0 ./application-service
docker build -t job-portal/frontend:1.0.0 ./Frontend
minikube image load job-portal/user-service:1.0.0
minikube image load job-portal/job-service:1.0.0
minikube image load job-portal/application-service:1.0.0
minikube image load job-portal/frontend:1.0.0

# Apply all manifests
cd k8s && bash deploy.sh
```

## 📊 Output

### Access Points (Development)

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Register to login |
| User API | http://localhost:8081 | — |
| Job API | http://localhost:8082 | — |
| Application API | http://localhost:8083 | — |
| Prometheus | http://localhost:9090 | No login |
| Grafana | http://localhost:3001 | admin / admin |

### API Endpoints

**User Service (8081)**
```
POST   /api/users/register
POST   /api/users/login
GET    /api/users/{id}
PUT    /api/users/{id}
```

**Job Service (8082)**
```
POST   /api/jobs
GET    /api/jobs
GET    /api/jobs/{id}
PUT    /api/jobs/{id}
DELETE /api/jobs/{id}
GET    /api/jobs/employer/{employerId}
```

**Application Service (8083)**
```
POST   /api/applications
GET    /api/applications/job/{jobId}
GET    /api/applications/applicant/{applicantId}
PUT    /api/applications/{id}/status
DELETE /api/applications/{id}
```

## 🗄️ Data Dictionary

| Entity | Field | Description |
|--------|-------|-------------|
| User | id | UUID primary key |
| User | fullName | Full name |
| User | email | Unique email |
| User | role | JOB_SEEKER or EMPLOYER |
| Job | title | Job title |
| Job | companyName | Company name |
| Job | location | Job location |
| Job | salary | Salary amount |
| Job | jobType | FULL_TIME / PART_TIME / CONTRACT / INTERNSHIP |
| Job | status | OPEN or CLOSED |
| Application | jobId | Reference to job |
| Application | applicantId | Reference to user |
| Application | coverLetter | Application cover letter |
| Application | **status** | **PENDING / REVIEWED / ACCEPTED / REJECTED** |

## 🔍 Architecture

Each service has its own dedicated PostgreSQL database (database-per-service pattern). Services communicate over Docker's internal network. Nginx acts as a reverse proxy in the frontend container, routing API calls to the correct backend service.

```
Browser → Nginx (Frontend) → user-service  → userdb
                           → job-service   → jobdb
                           → app-service   → applicationdb

Prometheus → /actuator/prometheus (all services)
Grafana    → Prometheus
```

## 📝 Notes

- **Linux Deployment**: Runs on Ubuntu (VMware). Add user to docker group to avoid sudo.
- **AppArmor Fix**: If containers fail to stop, run `sudo aa-remove-unknown`
- **Data Persistence**: Use `docker compose down` (without `-v`) to keep database volumes
- **Multi-stage Dockerfiles**: Final images use JRE-only Alpine for minimal size
- **Non-root containers**: All Spring Boot containers run as a dedicated non-root user

## 🛠️ Customization

1. **Add a new service**: Create a Spring Boot module, add Dockerfile, register in docker-compose.yml and k8s/
2. **Change ports**: Update docker-compose.dev.yml port mappings
3. **Add Grafana dashboard**: Import any dashboard ID from grafana.com/grafana/dashboards
4. **Scale a service**: Update `replicas` in the Kubernetes Deployment manifest

## 📄 License

This project is open source. Feel free to use and modify as needed.

## 👤 Author

**Omar Salama** — Computer Science Student, Ain Shams University / University of East London
**Habiba Fahd** — Computer Science Student, Ain Shams University / University of East London
**Eman Mohamed** — Computer Science Student, Ain Shams University / University of East London
**Maria Mark** — Computer Science Student, Ain Shams University / University of East London

## 📧 Questions?

For issues, questions, or suggestions, please open an issue on GitHub.
