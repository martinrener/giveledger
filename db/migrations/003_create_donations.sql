CREATE TABLE IF NOT EXISTS donations (
    id           CHAR(36)     NOT NULL,
    campaign_id  CHAR(36)     NOT NULL,
    donor_name   VARCHAR(80)  NOT NULL,
    amount_cents INT UNSIGNED NOT NULL,
    recorded_at  DATETIME     NOT NULL,

    PRIMARY KEY (id),
    INDEX idx_donations_campaign_id (campaign_id),
    CONSTRAINT fk_donations_campaign
        FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
