# 🐳 Docker & Infrastructure

## Docker Compose (Desarrollo Local)

### Iniciar todo

```bash
docker-compose up -d
```

### Detener

```bash
docker-compose down
```

---

## 🏗️ docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: adastrasky
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: adastrasky
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules

  # Python Service
  python-service:
    build:
      context: ./python-service
      dockerfile: Dockerfile
    ports:
      - "5001:5001"
    environment:
      ENVIRONMENT: development
      FLASK_ENV: development
    volumes:
      - ./python-service:/app
      - /app/__pycache__

  # Frontend (opcional con Vite)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public

volumes:
  postgres_data:
```

---

## 🐳 Dockerfiles

### Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

### Python Service

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=5001"]
```

---

## 🚀 Deployment

### Variables de Producción

```bash
NODE_ENV=production
FRONTEND_URL=https://adastrasky.com

# Database
DB_HOST=prod-db.example.com
DB_USER=adastrasky_prod
DB_PASSWORD=secure_password_here
DB_NAME=adastrasky_prod

# APIs
WEATHER_API_KEY=prod_key
ASTRONOMY_API_KEY=prod_key
NASA_API_KEY=prod_key

# Seguridad
JWT_SECRET=very_secure_jwt_secret_key
```

---

## 📊 Monitoreo

### Health Checks

**Backend**: `http://localhost:5000/health`  
**Python**: `http://localhost:5001/health`

---

## 🔄 CI/CD Workflow

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy
        run: ./scripts/deploy.sh
```

---

**Documentación**: Actualizada 25/05/2024
