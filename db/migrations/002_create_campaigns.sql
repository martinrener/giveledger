CREATE TABLE IF NOT EXISTS campaigns (
    id         CHAR(36)                  NOT NULL,
    tenant_id  CHAR(36)                  NOT NULL,
    name       VARCHAR(100)              NOT NULL,
    goal_cents INT UNSIGNED              NOT NULL,
    currency   CHAR(3)                   NOT NULL,
    status     ENUM('open', 'closed')    NOT NULL DEFAULT 'open',
    deadline   DATE                      NOT NULL,
    created_at DATETIME                  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_campaigns_tenant_id (tenant_id),
    CONSTRAINT fk_campaigns_tenant
        FOREIGN KEY (tenant_id) REFERENCES tenants (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
