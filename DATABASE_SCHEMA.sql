-- ============================================================================
-- ADASTRA SKY - DATABASE SCHEMA (SQL DDL)
-- Complete database structure for production deployment
-- ============================================================================
-- Generated: 2026-05-29
-- Target: PostgreSQL 14+
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: USERS - Authentication and Profiles
-- ============================================================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    language_preference VARCHAR(5) NOT NULL DEFAULT 'ES',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    bio TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Indexes for common queries
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_is_active (is_active)
);

-- ============================================================================
-- TABLE 2: SKY_QUALITY_ZONES - Light Pollution Zones (Bortle Scale)
-- ============================================================================
CREATE TABLE sky_quality_zones (
    id VARCHAR(36) PRIMARY KEY,
    zone_name VARCHAR(200) NOT NULL,
    island VARCHAR(100) NOT NULL,
    bortle_scale INTEGER NOT NULL CHECK (bortle_scale >= 1 AND bortle_scale <= 9),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    altitude INTEGER,
    visible_stars INTEGER,
    best_viewing_season VARCHAR(100),
    description TEXT,
    accessibility VARCHAR(50) NOT NULL DEFAULT 'Moderate',
    is_protected BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for common queries
    INDEX idx_zone_name (zone_name),
    INDEX idx_island (island),
    INDEX idx_bortle_scale (bortle_scale)
);

-- ============================================================================
-- TABLE 3: USER_SAVED_SKY_ZONES - Many-to-Many Junction (User ↔ SkyZone)
-- ============================================================================
CREATE TABLE user_saved_sky_zones (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    zone_id VARCHAR(36) NOT NULL,
    notes TEXT,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_user_saved_zones_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_saved_zones_zone_id 
        FOREIGN KEY (zone_id) REFERENCES sky_quality_zones(id) ON DELETE CASCADE,
    
    -- Unique constraint (user can save a zone only once)
    UNIQUE(user_id, zone_id),
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_zone_id (zone_id)
);

-- ============================================================================
-- TABLE 4: OBSERVATIONS - User Observation Logs
-- ============================================================================
CREATE TABLE observations (
    id VARCHAR(36) PRIMARY KEY,
    zone_id VARCHAR(36) NOT NULL,
    observation_date TIMESTAMP NOT NULL,
    weather_conditions VARCHAR(100),
    objects_observed TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_observations_zone_id 
        FOREIGN KEY (zone_id) REFERENCES sky_quality_zones(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_zone_id (zone_id),
    INDEX idx_observation_date (observation_date)
);

-- ============================================================================
-- TABLE 5: USER_ALERTS - Astronomical Event Alerts
-- ============================================================================
CREATE TABLE user_alerts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    zone_id VARCHAR(36),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notification_method VARCHAR(50) NOT NULL DEFAULT 'email',
    event_name VARCHAR(200),
    event_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    triggered_at TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_user_alerts_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_alerts_zone_id 
        FOREIGN KEY (zone_id) REFERENCES sky_quality_zones(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_alert_type (alert_type),
    INDEX idx_is_active (is_active)
);

-- ============================================================================
-- TABLE 6: CHAT_HISTORY - AI Conversation Audit & Cost Tracking
-- ============================================================================
CREATE TABLE chat_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    response_content TEXT,
    language VARCHAR(5) NOT NULL DEFAULT 'ES',
    rag_sources TEXT,  -- JSON array of document sources
    tools_used TEXT,   -- JSON array of tools invoked
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,
    estimated_cost VARCHAR(20),
    has_error BOOLEAN NOT NULL DEFAULT FALSE,
    error_message TEXT,
    user_satisfaction INTEGER,
    user_feedback TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_chat_history_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for common queries
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at),
    INDEX idx_message_type (message_type)
);

-- ============================================================================
-- TABLE 7: RAG_DOCUMENT_SOURCES - Knowledge Base Document Metadata
-- ============================================================================
CREATE TABLE rag_document_sources (
    id VARCHAR(36) PRIMARY KEY,
    document_name VARCHAR(255) NOT NULL UNIQUE,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    content_summary TEXT,
    content_hash VARCHAR(64),
    file_size_bytes INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    indexed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_citations INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_document_name (document_name),
    INDEX idx_document_type (document_type),
    INDEX idx_is_active (is_active)
);

-- ============================================================================
-- VIEWS (Optional - for common queries)
-- ============================================================================

-- View: Active users with their chat activity
CREATE VIEW v_active_users_chat_stats AS
SELECT 
    u.id,
    u.email,
    u.username,
    u.language_preference,
    COUNT(DISTINCT ch.session_id) as total_sessions,
    COUNT(ch.id) as total_messages,
    SUM(ch.total_tokens) as total_tokens_used,
    MAX(ch.created_at) as last_chat_date
FROM users u
LEFT JOIN chat_history ch ON u.id = ch.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.email, u.username, u.language_preference;

-- View: Dark sky zones accessible to users
CREATE VIEW v_dark_sky_zones AS
SELECT 
    id,
    zone_name,
    island,
    bortle_scale,
    latitude,
    longitude,
    pollution_level,
    visibility_rating
FROM sky_quality_zones
WHERE bortle_scale <= 4
ORDER BY bortle_scale ASC;

-- ============================================================================
-- STORED PROCEDURES / TRIGGERS (Optional)
-- ============================================================================

-- Trigger: Auto-update updated_at timestamp
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW 
SET updated_at = CURRENT_TIMESTAMP;

CREATE TRIGGER update_chat_history_updated_at 
BEFORE UPDATE ON chat_history 
FOR EACH ROW 
SET updated_at = CURRENT_TIMESTAMP;

CREATE TRIGGER update_sky_zones_updated_at 
BEFORE UPDATE ON sky_quality_zones 
FOR EACH ROW 
SET updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Common joins and filters
CREATE INDEX idx_chat_user_session ON chat_history(user_id, session_id);
CREATE INDEX idx_saved_zones_user ON user_saved_sky_zones(user_id);
CREATE INDEX idx_observations_zone ON observations(zone_id);
CREATE INDEX idx_alerts_user_active ON user_alerts(user_id, is_active);

-- Temporal queries
CREATE INDEX idx_chat_created_range ON chat_history(created_at DESC);
CREATE INDEX idx_observations_date_range ON observations(observation_date DESC);

-- ============================================================================
-- DATA COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts with authentication and preferences';
COMMENT ON TABLE sky_quality_zones IS 'Astronomical observation zones with Bortle light pollution scale';
COMMENT ON TABLE chat_history IS 'Complete audit trail of AI conversations for compliance and cost tracking';
COMMENT ON TABLE rag_document_sources IS 'Metadata for RAG knowledge base documents indexed in ChromaDB';

COMMENT ON COLUMN users.language_preference IS 'ISO 639-1 code: ES (Spanish), EN (English), DE (German)';
COMMENT ON COLUMN sky_quality_zones.bortle_scale IS 'Bortle scale 1-9: 1=pristine dark sky, 9=heavily light-polluted';
COMMENT ON COLUMN chat_history.rag_sources IS 'JSON array of document sources cited in response';
COMMENT ON COLUMN chat_history.tools_used IS 'JSON array of external tools invoked (OpenWeather, Astronomy, etc.)';

-- ============================================================================
-- BACKUP / EXPORT INSTRUCTIONS
-- ============================================================================
-- Backup: pg_dump -U username -d adastra_sky_db -f backup.sql
-- Restore: psql -U username -d adastra_sky_db -f backup.sql
-- Export to CSV: \copy (SELECT * FROM users) TO 'users.csv' WITH CSV;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
