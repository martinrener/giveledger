# DevOps Skill — Docker, Nginx & Deployment

Reference for all infrastructure in GiveLedger. Multi-stage Dockerfiles required. `docker-compose up` must boot the full stack including migrations.

---

## Services Overview

```
nginx  :80   → reverse proxy: /api/* → php-fpm:9000 · /* → vue:3000
php-fpm:9000 → PHP 8.3-fpm running the hexagonal API
vue    :3000 → Nuxt 3 SSR or static build
mysql  :3306 → internal only — NEVER exposed on host in prod
```

---

## docker-compose.yml (development)

```yaml
version: '3.9'

services:
  nginx:
    build: ./docker/nginx
    ports:
      - "80:80"
    depends_on:
      - php-fpm
      - vue
    networks:
      - app

  php-fpm:
    build: ./docker/php
    volumes:
      - ./app:/app/app        # source mounted in dev only
      - ./config:/app/config
      - ./db:/app/db
    environment:
      DB_HOST: mysql
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASS: ${DB_PASS}
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - app

  vue:
    build: ./docker/vue
    volumes:
      - ./frontend:/app       # source mounted in dev only
    environment:
      NUXT_PUBLIC_API_BASE: http://nginx/api
    networks:
      - app

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER:     ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASS}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASS}
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 3s
      retries: 10
    networks:
      - app

volumes:
  mysql_data:

networks:
  app:
```

---

## docker-compose.prod.yml

```yaml
version: '3.9'

services:
  nginx:
    restart: always
    # no source volumes — image contains built assets

  php-fpm:
    restart: always
    # no source volumes — image contains app code

  vue:
    restart: always
    # no source volumes — nginx serves static build

  mysql:
    restart: always
    # mysql:3306 NOT in ports — internal only
```

Usage: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

---

## Dockerfile.php — Multi-stage

```dockerfile
# Stage 1: install Composer dependencies
FROM composer:2 AS deps
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Stage 2: runtime image
FROM php:8.3-fpm AS runtime
WORKDIR /app

# Install PDO MySQL extension
RUN docker-php-ext-install pdo pdo_mysql

# Copy vendor from deps stage
COPY --from=deps /app/vendor ./vendor

# Copy application source
COPY app/ ./app/
COPY config/ ./config/
COPY db/ ./db/
COPY public/ ./public/

# Copy entrypoint script
COPY docker/php/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN chown -R www-data:www-data /app
USER www-data

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]
```

---

## entrypoint.sh — Run Migrations Before php-fpm

```bash
#!/bin/sh
set -e

echo "Running migrations..."
for f in /app/db/migrations/*.sql; do
  echo "  Applying $f"
  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$f"
done

echo "Migrations complete. Starting php-fpm..."
exec "$@"
```

**Critical:** migrations must run in filename order (`001_`, `002_`, ...). The `for` loop using glob handles this.

---

## Dockerfile.vue — Multi-stage

```dockerfile
# Stage 1: build Nuxt app
FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine AS runtime
COPY --from=build /app/.output/public /usr/share/nginx/html
COPY docker/nginx/vue.conf /etc/nginx/conf.d/default.conf
```

---

## Dockerfile.nginx

```dockerfile
FROM nginx:alpine
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
```

---

## nginx.conf — Reverse Proxy

```nginx
events {}

http {
  upstream php-fpm {
    server php-fpm:9000;
  }

  server {
    listen 80;

    # API requests → PHP-FPM via FastCGI
    location /api/ {
      root /app/public;
      try_files $uri /index.php?$query_string;
      fastcgi_pass php-fpm;
      fastcgi_index index.php;
      include fastcgi_params;
      fastcgi_param SCRIPT_FILENAME /app/public/index.php;
    }

    # Everything else → Vue app
    location / {
      proxy_pass http://vue:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
}
```

---

## .env.example

```env
# Database
DB_NAME=giveledger
DB_USER=giveledger_user
DB_PASS=changeme
DB_ROOT_PASS=changeme_root

# App
APP_ENV=production
APP_DEBUG=false

# Tenants (for local dev without subdomains)
# Pass X-Tenant-ID header with one of these UUIDs
TENANT_GRACE_CHURCH=11111111-1111-4111-a111-111111111111
TENANT_HOPE_CHAPEL=22222222-2222-4222-a222-222222222222
```

Rules:
- Zero hardcoded credentials anywhere in committed code
- `.env` in `.gitignore` — only `.env.example` is committed
- All secrets injected at runtime via environment variables

---

## Deploy — Google Cloud free tier (recommended)

**Target:** GCE e2-micro (always free in `us-central1`, `us-west1`, `us-east1`)

```bash
# 1. Create VM
gcloud compute instances create giveledger \
  --machine-type=e2-micro \
  --zone=us-central1-a \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --tags=http-server

# 2. Open port 80
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --target-tags=http-server

# 3. SSH into VM
gcloud compute ssh giveledger --zone=us-central1-a

# 4. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 5. Clone repo and configure
git clone https://github.com/YOUR_USER/giveledger.git
cd giveledger
cp .env.example .env
# Edit .env with real values

# 6. Boot the stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 7. Get external IP
gcloud compute instances describe giveledger \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

**Live URL:** `http://EXTERNAL_IP` — pass `X-Tenant-ID` header since no custom domain

---

## Deploy — AWS free tier (alternative)

**Target:** EC2 t2.micro (750 hours/month, 12 months)

```bash
# Launch instance via console:
# AMI: Amazon Linux 2023
# Type: t2.micro
# Security group: allow port 80 from 0.0.0.0/0, port 22 from your IP

# SSH in
ssh -i your-key.pem ec2-user@EC2_PUBLIC_IP

# Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Same steps 5–7 as GCloud above
```

---

## Teardown Checklist (avoid surprise billing)

- [ ] `docker-compose down -v` (stops containers, removes volumes)
- [ ] GCloud: `gcloud compute instances delete giveledger --zone=us-central1-a`
- [ ] AWS: Terminate instance from EC2 console
- [ ] Verify no running instances in billing dashboard

---

## Acceptance Criteria — Infrastructure

- [ ] `docker-compose up` boots everything including migrations (no manual SQL needed)
- [ ] Multi-stage Dockerfiles — prod images have zero dev dependencies
- [ ] Source code NOT mounted as volume in prod
- [ ] MySQL port 3306 NOT exposed on host in prod
- [ ] All credentials in `.env` — zero hardcoded values in committed files
- [ ] `docs/deployment.md` has every CLI command, all env vars, teardown checklist
- [ ] Working public URL submitted with project
