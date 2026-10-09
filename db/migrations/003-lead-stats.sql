CREATE INDEX fa_leads_stats_period ON fa_leads (created_at) INCLUDE (status) WHERE deleted_at IS NULL;
