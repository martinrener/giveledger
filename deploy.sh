#!/bin/bash
set -e

EC2_IP="98.93.66.233"
EC2_USER="ec2-user"
KEY="$(dirname "$0")/giveledger-key.pem"
REMOTE="$EC2_USER@$EC2_IP"
COMPOSE="docker-compose -f docker-compose.prod.yml"

ssh_run() {
  ssh -i "$KEY" -o StrictHostKeyChecking=no "$REMOTE" "cd ~/giveledger && $*"
}

case "$1" in
  deploy)
    echo "Deploying to $EC2_IP..."
    ssh_run "git pull origin main"
    echo ""
    echo "Rebuilding containers..."
    ssh_run "$COMPOSE up -d --build"
    echo ""
    echo "Waiting for PHP-FPM migrations..."
    until ssh_run "$COMPOSE logs php-fpm 2>/dev/null" | grep -q "Migrations complete"; do
      sleep 3
    done
    echo ""
    echo "Deploy complete. App is at http://$EC2_IP"
    ;;

  up)
    echo "Starting containers on $EC2_IP..."
    ssh_run "$COMPOSE up -d"
    echo "Done. App is at http://$EC2_IP"
    ;;

  down)
    echo "Stopping containers on $EC2_IP..."
    ssh_run "$COMPOSE down"
    echo "Done."
    ;;

  restart)
    echo "Restarting containers on $EC2_IP..."
    ssh_run "$COMPOSE down"
    echo ""
    ssh_run "$COMPOSE up -d"
    echo "Done. App is at http://$EC2_IP"
    ;;

  logs)
    ssh -i "$KEY" -o StrictHostKeyChecking=no "$REMOTE" \
      "cd ~/giveledger && $COMPOSE logs -f ${2:-}"
    ;;

  ps)
    ssh_run "$COMPOSE ps"
    ;;

  seed)
    echo "Running dev seeds on $EC2_IP..."
    ssh_run "$COMPOSE exec -T mysql \
      mysql -u root -p\"\${DB_ROOT_PASS}\" \"\${DB_NAME}\" < db/seeds/dev.sql 2>/dev/null"
    echo "Done."
    ;;

  ssh)
    exec ssh -i "$KEY" -o StrictHostKeyChecking=no "$REMOTE"
    ;;

  status)
    echo "=== Containers ==="
    ssh_run "$COMPOSE ps"
    echo ""
    echo "=== API ping ==="
    curl -s "http://$EC2_IP/api/tenants" | head -c 200
    echo ""
    ;;

  *)
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "  deploy       git pull + rebuild changed containers + wait for migrations"
    echo "  up           Start containers (no rebuild)"
    echo "  down         Stop all containers"
    echo "  restart      down + up"
    echo "  logs [svc]   Tail logs (svc optional: php-fpm, vue, nginx, mysql, redis)"
    echo "  ps           Show container status"
    echo "  seed         Run dev seeds against the production DB"
    echo "  ssh          Open an interactive SSH session"
    echo "  status       Health check: containers + API ping"
    exit 1
    ;;
esac
