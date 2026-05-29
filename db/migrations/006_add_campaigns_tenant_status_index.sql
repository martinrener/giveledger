-- Composite index for queries that filter by tenant + status (allOpenForTenant, autoClose).
-- Covers the single-column idx_campaigns_tenant_id for those query patterns.
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_status ON campaigns(tenant_id, status);
