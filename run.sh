#!/bin/bash
set -e

# Load .env so DB_* variables are available for the seeds command
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
    echo "GiveLedger is up at http://localhost"
    ;;
  down)
    echo "Stopping GiveLedger..."
    docker compose down
    echo "Done."
    ;;
  *)
    echo "Usage: ./run.sh [up|down]"
    exit 1
    ;;
esac
