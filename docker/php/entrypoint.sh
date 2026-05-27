#!/bin/sh
set -e

echo "Running migrations..."
for f in /app/db/migrations/*.sql; do
    echo "  Applying $f"
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$f"
done

echo "Migrations complete. Starting php-fpm..."
exec "$@"
