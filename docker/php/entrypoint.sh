#!/bin/sh
set -e

MYSQL="mysql --skip-ssl -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME"

echo "Waiting for MySQL to be ready..."
until $MYSQL -e "SELECT 1" > /dev/null 2>&1; do
    echo "  MySQL not ready yet, retrying in 2s..."
    sleep 2
done
echo "MySQL is ready."

echo "Running migrations..."
for f in /app/db/migrations/*.sql; do
    echo "  Applying $f"
    $MYSQL < "$f"
done

echo "Migrations complete. Starting php-fpm..."
exec "$@"
