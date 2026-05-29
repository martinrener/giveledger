# GiveLedger — AWS Deployment Guide

Target: EC2 t2.micro (free tier — 750 hours/month for 12 months).

---

## Prerequisites

- AWS account with free tier access: https://aws.amazon.com/free
- SSH key pair created in the EC2 console (Step 1 walks through this)
- Your GiveLedger repository pushed to GitHub
- A terminal on your local machine (Terminal on Mac, PowerShell on Windows)

---

## Step 1 — Launch EC2 Instance

**In the AWS Console:**

1. Go to https://console.aws.amazon.com → search bar → type **EC2** → click it
2. Top-right: pick any free-tier region (e.g. `us-east-1 US East N. Virginia`)
3. **Left sidebar → Network & Security → Key Pairs → Create key pair**
   - Name: `giveledger-key`
   - Type: RSA
   - Format: `.pem` (Mac/Linux) or `.ppk` (Windows with PuTTY)
   - Click **Create key pair** — a file downloads automatically
4. **Left sidebar → Instances → Launch instances**
5. Fill in the form:
   - **Name:** `giveledger`
   - **AMI:** Amazon Linux 2023 AMI (the default Amazon Linux — must say *Free tier eligible*)
   - **Instance type:** `t2.micro` (must say *Free tier eligible*)
   - **Key pair:** select `giveledger-key`
   - **Network settings:** click *Edit* → under Firewall select *Create security group* → name it `giveledger-sg` (you'll add rules in Step 2)
   - **Storage:** leave at 8 GB gp3 (default)
6. Click **Launch instance**

Wait ~1 minute for the instance to reach *Running* state.

**Protect your key file (run this on your local machine):**

```bash
chmod 400 ~/Downloads/giveledger-key.pem
```

---

## Step 2 — Configure Security Group

1. Left sidebar → **Network & Security → Security Groups**
2. Click `giveledger-sg` → **Inbound rules** tab → **Edit inbound rules**
3. Add these two rules (SSH should already be there):

| Type | Protocol | Port | Source | Purpose |
|------|----------|------|--------|---------|
| SSH  | TCP | 22 | My IP | Your machine only |
| HTTP | TCP | 80 | 0.0.0.0/0 | Public web traffic |

4. Click **Save rules**

> Do **not** open port 3306 (MySQL) or 9000 (PHP-FPM) — those services stay inside Docker's internal network.

---

## Step 3 — Connect to the Instance

1. In EC2 → Instances, click your `giveledger` instance
2. Copy the **Public IPv4 address** shown in the details panel (looks like `54.123.45.67`)

```bash
# Run on your local machine — replace EC2_PUBLIC_IP with the address you copied
ssh -i ~/Downloads/giveledger-key.pem ec2-user@EC2_PUBLIC_IP
```

First connection will ask:
```
The authenticity of host '54.x.x.x' can't be established. Continue? (yes/no)
```
Type `yes` and press Enter.

You should see `[ec2-user@ip-172-x-x-x ~]$` — you are now inside the server. All remaining commands run here.

---

## Step 4 — Install Docker & Docker Compose

```bash
# Update the system
sudo yum update -y

# Install and start Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker

# Allow your user to run Docker without sudo
sudo usermod -aG docker ec2-user
newgrp docker

# Verify Docker works
docker --version

# Install Docker Compose
sudo curl -L \
  "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker-compose --version
```

---

## Step 5 — Clone the Repository

```bash
# Install git (usually pre-installed, just in case)
sudo yum install -y git

# Clone — replace with your actual GitHub URL
git clone https://github.com/YOUR_GITHUB_USERNAME/giveledger.git

cd giveledger
```

---

## Step 6 — Configure Environment

```bash
cp .env.example .env
nano .env
```

Set every variable below. **Do not leave placeholder values in production.**

```env
# ── Database ──────────────────────────────────────────────────────────────────

# Name of the MySQL database Docker will create automatically on first boot
DB_NAME=giveledger

# MySQL user the application connects with (not the root user)
DB_USER=giveledger_user

# Password for DB_USER — use a long random string (min 20 chars)
# Generate one with: openssl rand -base64 20
DB_PASS=REPLACE_WITH_STRONG_PASSWORD

# Root password for MySQL — must be different from DB_PASS
# Generate one with: openssl rand -base64 20
DB_ROOT_PASS=REPLACE_WITH_DIFFERENT_STRONG_ROOT_PASSWORD

# ── App ───────────────────────────────────────────────────────────────────────

# Controls PHP error reporting and optimizations — must be "production" on the server
APP_ENV=production
```

To generate strong passwords without leaving the server:
```bash
openssl rand -base64 20
# Run it twice — use each output for DB_PASS and DB_ROOT_PASS
```

**Save and exit nano:** `Ctrl+X` → `Y` → `Enter`

> `.env` is in `.gitignore` and is never committed. It lives on the server only.

---

## Step 7 — Start the Application

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

**What the flags mean:**
- `-f docker-compose.prod.yml` — uses the standalone production config (no dev volumes, production Node.js runtime, internal network isolation)
- `-d` — runs in the background (detached mode)
- `--build` — builds all Docker images before starting (always use after pulling new code)

This takes **3–5 minutes** the first time: Docker downloads base images, installs PHP dependencies via Composer, builds the Nuxt app with `npm run build`, and starts MySQL. Subsequent deploys are faster because Docker caches unchanged layers.

---

## Step 8 — Verify

```bash
# All 5 containers should show "Up" in the Status column
docker-compose -f docker-compose.prod.yml ps

# Confirm database migrations ran (should print "Migrations complete. Starting php-fpm...")
docker-compose -f docker-compose.prod.yml logs php-fpm | grep -E "Migrations|ERROR"

# Quick API smoke test — should return a JSON array of tenants
curl http://localhost/api/tenants

# Tail live logs from all services (Ctrl+C to stop)
docker-compose -f docker-compose.prod.yml logs -f

# Tail a single service
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f php-fpm
docker-compose -f docker-compose.prod.yml logs -f vue
```

If a container shows `Restarting` or `Exit`, check its logs for errors:
```bash
docker-compose -f docker-compose.prod.yml logs <service-name>
```

---

## Step 9 — Access the App

Find the public IP in **EC2 → Instances → click your instance → Public IPv4 address**.

Open a browser on your local machine:

```
http://YOUR_EC2_PUBLIC_IP
```

You should see the GiveLedger home page with the church selector.

**Create the first admin account:**
1. Go to `http://YOUR_EC2_PUBLIC_IP/admin/register`
2. Select a tenant from the dropdown
3. Enter email + password (min 8 chars) and submit

> **Note:** the dev seed data (grace-church, hope-chapel) is **not** loaded on a fresh production server. To add a tenant manually:
> ```bash
> docker-compose -f docker-compose.prod.yml exec mysql \
>   mysql -u root -p"${DB_ROOT_PASS}" giveledger -e \
>   "INSERT INTO tenants (id, slug, name, created_at) VALUES (UUID(), 'my-church', 'My Church', NOW());"
> ```

---

## Pulling Updates

When you push new code to GitHub and want to redeploy:

```bash
cd ~/giveledger
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Teardown Checklist

**Run these steps to avoid charges once the free tier ends (12 months).**

```bash
# 1. Stop all containers and remove Docker volumes (on the server)
cd ~/giveledger
docker-compose -f docker-compose.prod.yml down -v
exit
```

Then in the AWS Console:

- [ ] **EC2 → Instances** → select `giveledger` → **Instance state → Terminate instance** → confirm
- [ ] **EC2 → Volumes** → delete any EBS volumes left in `available` state (not attached to an instance)
- [ ] **EC2 → Elastic IPs** → release any unattached Elastic IPs (charged even when idle)
- [ ] **Billing → Bills** → confirm $0 unexpected charges

> The free tier allows exactly 750 hours/month of t2.micro. One instance running 24/7 = 720–744 hours — you stay within the limit. After 12 months you will be charged unless you terminate.
