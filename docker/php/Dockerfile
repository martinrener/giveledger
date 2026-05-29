FROM composer:2 AS deps
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

FROM php:8.3-fpm AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y default-mysql-client \
    && docker-php-ext-install pdo pdo_mysql \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/vendor ./vendor
COPY app/ ./app/
COPY config/ ./config/
COPY db/ ./db/
COPY public/ ./public/

COPY docker/php/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/php/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN chown -R www-data:www-data /app
USER www-data

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]
