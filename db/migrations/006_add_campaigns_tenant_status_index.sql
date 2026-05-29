-- Composite index for queries that filter by tenant + status.
-- Uses information_schema check for idempotency (MySQL 8.0 lacks IF NOT EXISTS for CREATE INDEX).
SET @exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name   = 'campaigns'
      AND index_name   = 'idx_campaigns_tenant_status'
);
SET @sql = IF(
    @exists = 0,
    'ALTER TABLE campaigns ADD INDEX idx_campaigns_tenant_status (tenant_id, status)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
