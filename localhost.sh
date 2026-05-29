#!/bin/bash
set -e

# Load .env so DB_* variables are available for seeds
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

case "$1" in
  up)
    echo "Starting GiveLedger..."
    docker compose up -d --build

    echo ""
    echo "Waiting for PHP-FPM to finish migrations..."
    until docker compose logs php-fpm 2>/dev/null | grep -q "Migrations complete"; do
      sleep 2
    done

    echo ""
    echo "Running seeds..."
    docker compose exec php-fpm mysql --skip-ssl \
      -h "${DB_HOST:-mysql}" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
      < db/seeds/dev.sql 2>/dev/null || true

    echo ""
    echo "Waiting for Nuxt dev server to be ready..."
    until docker compose logs vue 2>/dev/null | grep -q "Local:"; do
      sleep 2
    done

    echo ""
    echo "GiveLedger is up at http://localhost"
    echo ""
    echo "  Public:  http://localhost"
    echo "  Admin:   http://localhost/admin"
    echo ""
    echo "  Seed tenants: grace-church · hope-chapel"
    echo "  Register at /admin/register before first login."
    ;;

  down)
    echo "Stopping GiveLedger..."
    docker compose down
    echo "Done."
    ;;

  restart)
    echo "Restarting GiveLedger..."
    docker compose down
    echo ""
    exec "$0" up
    ;;

  seed)
    echo "Running seeds..."
    docker compose exec php-fpm mysql --skip-ssl \
      -h "${DB_HOST:-mysql}" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
      < db/seeds/dev.sql 2>/dev/null || true
    echo "Done."
    ;;

  logs)
    docker compose logs -f "${2:-}"
    ;;

  ps)
    docker compose ps
    ;;

  *)
    echo "Usage: ./localhost.sh [command]"
    echo ""
    echo "  up        Build images, start all containers, run migrations + seeds, wait for Nuxt"
    echo "  down      Stop and remove all containers"
    echo "  restart   down + up in one step"
    echo "  seed      Re-run dev seeds against the running DB (containers must be up)"
    echo "  logs      Tail all logs (./localhost.sh logs [php-fpm|vue|nginx|mysql|redis])"
    echo "  ps        Show container status"
    exit 1
    ;;
esac
