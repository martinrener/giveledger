<?php

declare(strict_types=1);

use App\Infrastructure\HTTP\Controller\Auth\AuthController;
use App\Infrastructure\HTTP\Controller\Campaign\CampaignController;
use App\Infrastructure\HTTP\Controller\Donation\DonationController;
use App\Infrastructure\HTTP\Controller\Stream\StreamController;
use App\Infrastructure\HTTP\Controller\Tenant\TenantController;

/**
 * Each route: [method, regex pattern, middleware, controller, action]
 *
 * middleware:
 *   'public' → no auth required
 *   'tenant' → TenantResolver resolves slug → tenantId (public donation routes)
 *   'admin'  → AuthMiddleware validates cookie token and slug match
 *
 * Order matters: specific patterns must come before generic /:slug patterns.
 */
return [
    // --- Auth (public) ---
    ['POST', '#^/api/auth/login$#',    'public', AuthController::class, 'login'],
    ['POST', '#^/api/auth/register$#', 'public', AuthController::class, 'register'],

    // --- Tenants (public) ---
    ['GET', '#^/api/tenants$#', 'public', TenantController::class, 'index'],

    // --- Public donation routes (TenantResolver) ---
    ['GET',  '#^/api/donate/(?P<slug>[^/]+)/campaigns$#',                                       'tenant', CampaignController::class,  'index'],
    ['POST', '#^/api/donate/(?P<slug>[^/]+)/campaigns/(?P<campaignId>[^/]+)/donations$#',       'tenant', DonationController::class,  'store'],
    ['GET',  '#^/api/donate/(?P<slug>[^/]+)/stream$#',                                          'tenant', StreamController::class,    'stream'],

    // --- Admin routes (AuthMiddleware) ---
    ['GET',  '#^/api/(?P<slug>[^/]+)/campaigns$#',                                              'admin',  CampaignController::class,  'index'],
    ['POST', '#^/api/(?P<slug>[^/]+)/campaigns$#',                                              'admin',  CampaignController::class,  'store'],
    ['POST', '#^/api/(?P<slug>[^/]+)/campaigns/(?P<campaignId>[^/]+)/close$#',                  'admin',  CampaignController::class,  'close'],
    ['GET',  '#^/api/(?P<slug>[^/]+)/stream$#',                                                 'admin',  StreamController::class,    'stream'],
];
