-- ============================================================================
-- NeuroThrive Database Schema - PostgreSQL
-- ============================================================================
-- Complete schema for Autism Care Platform with all required tables
-- ============================================================================

-- ============================================================================
-- 1. CORE USER & AUTHENTICATION TABLES
-- ============================================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,  -- 'parent', 'clinician', 'therapist', 'admin'
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clinicians (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE,
    specialization VARCHAR(100),  -- 'speech_therapy', 'behavioral', 'occupational', etc
    qualification VARCHAR(255),
    bio TEXT,
    availability_status VARCHAR(50),  -- 'available', 'busy', 'on_leave'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. CHILD/PATIENT MANAGEMENT TABLES
-- ============================================================================

CREATE TABLE children (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    diagnosis VARCHAR(255),  -- autism spectrum details
    severity_level VARCHAR(50),  -- 'mild', 'moderate', 'severe'
    medical_history TEXT,
    special_notes TEXT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parent_child_relationships (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50),  -- 'mother', 'father', 'guardian', etc
    is_primary_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id, child_id)
);

CREATE TABLE clinician_patient_assignments (
    id SERIAL PRIMARY KEY,
    clinician_id INTEGER NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    assignment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50),  -- 'active', 'inactive', 'completed'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clinician_id, child_id)
);

-- ============================================================================
-- 3. VIDEO SCREENING & ANALYSIS TABLES
-- ============================================================================

CREATE TABLE video_screenings (
    id SERIAL PRIMARY KEY,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_url VARCHAR(500) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    video_duration_seconds INTEGER,
    file_size_mb DECIMAL(10, 2),
    status VARCHAR(50),  -- 'pending', 'processing', 'completed', 'failed'
    processing_progress_percent INTEGER DEFAULT 0,
    is_analyzed BOOLEAN DEFAULT false,
    analyzed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE screening_results (
    id SERIAL PRIMARY KEY,
    screening_id INTEGER NOT NULL UNIQUE REFERENCES video_screenings(id) ON DELETE CASCADE,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    autism_risk_score DECIMAL(5, 2),  -- 0-100
    confidence_level DECIMAL(5, 2),  -- 0-100
    detected_behaviors TEXT[],  -- Array of detected behaviors
    eye_contact_percentage DECIMAL(5, 2),
    speech_clarity_score DECIMAL(5, 2),
    social_interaction_score DECIMAL(5, 2),
    motor_coordination_score DECIMAL(5, 2),
    stimulus_response_score DECIMAL(5, 2),
    overall_assessment TEXT,
    recommendations TEXT,
    model_version VARCHAR(50),  -- Version of ML model used
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE screening_feedback (
    id SERIAL PRIMARY KEY,
    screening_id INTEGER NOT NULL REFERENCES video_screenings(id) ON DELETE CASCADE,
    clinician_id INTEGER NOT NULL REFERENCES clinicians(id) ON DELETE SET NULL,
    feedback TEXT,
    agrees_with_analysis BOOLEAN,
    severity_rating VARCHAR(50),  -- 'mild', 'moderate', 'severe'
    recommended_interventions TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. CHILD PROGRESS TRACKING TABLES
-- ============================================================================

CREATE TABLE milestones (
    id SERIAL PRIMARY KEY,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),  -- 'social', 'communication', 'emotional', 'behavioral', 'academic', 'self_care'
    icon VARCHAR(50),
    milestone_date DATE NOT NULL,
    importance_level VARCHAR(50),  -- 'low', 'medium', 'high'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE progress_tracking (
    id SERIAL PRIMARY KEY,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    month DATE NOT NULL,
    social_skills_score DECIMAL(5, 2),  -- 0-100
    communication_score DECIMAL(5, 2),
    emotional_regulation_score DECIMAL(5, 2),
    behavioral_control_score DECIMAL(5, 2),
    academic_progress_score DECIMAL(5, 2),
    self_care_score DECIMAL(5, 2),
    overall_development_score DECIMAL(5, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(child_id, week_number, month)
);

-- ============================================================================
-- 5. THERAPY SESSION TABLES
-- ============================================================================

CREATE TABLE therapy_sessions (
    id SERIAL PRIMARY KEY,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    clinician_id INTEGER NOT NULL REFERENCES clinicians(id) ON DELETE SET NULL,
    session_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    session_type VARCHAR(100),  -- 'speech', 'behavioral', 'occupational', 'group'
    focus_areas TEXT,
    achievements TEXT,
    challenges TEXT,
    homework_assigned TEXT,
    notes TEXT,
    session_recording_url VARCHAR(500),
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE therapy_plans (
    id SERIAL PRIMARY KEY,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    clinician_id INTEGER NOT NULL REFERENCES clinicians(id) ON DELETE SET NULL,
    plan_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    goals TEXT[],  -- Array of therapy goals
    intervention_strategies TEXT,
    frequency_per_week INTEGER,
    status VARCHAR(50),  -- 'active', 'paused', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. PARENT MENTAL HEALTH & STRESS TABLES
-- ============================================================================

CREATE TABLE stress_journal_entries (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_text TEXT NOT NULL,
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stress_level_before INTEGER,  -- 1-100
    mood_before VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stress_analysis (
    id SERIAL PRIMARY KEY,
    journal_entry_id INTEGER NOT NULL UNIQUE REFERENCES stress_journal_entries(id) ON DELETE CASCADE,
    parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sentiment_score DECIMAL(5, 2),  -- -1.0 to 1.0
    sentiment_label VARCHAR(50),  -- 'positive', 'neutral', 'negative'
    detected_emotions VARCHAR(255)[],  -- Array of emotions: ['exhaustion', 'guilt', 'hopelessness']
    burnout_risk_score DECIMAL(5, 2),  -- 0-100
    burnout_risk_level VARCHAR(50),  -- 'low', 'medium', 'high'
    burnout_indicators VARCHAR(255)[],  -- Array of indicators detected
    suicidality_risk BOOLEAN DEFAULT false,
    recommended_support TEXT,
    analysis_model_version VARCHAR(50),
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parent_mental_health_summary (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    average_stress_score DECIMAL(5, 2),
    trend_direction VARCHAR(50),  -- 'increasing', 'stable', 'decreasing'
    last_analysis_date TIMESTAMP,
    respite_sessions_used_this_month INTEGER DEFAULT 0,
    support_group_attendance_this_month INTEGER DEFAULT 0,
    wellness_score DECIMAL(5, 2),  -- 0-100 overall parent wellness
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. CLINICIAN RESPONSES & COMMUNICATION TABLES
-- ============================================================================

CREATE TABLE clinician_responses (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clinician_id INTEGER NOT NULL REFERENCES clinicians(id) ON DELETE SET NULL,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    related_screening_id INTEGER REFERENCES video_screenings(id) ON DELETE SET NULL,
    response_text TEXT NOT NULL,
    response_type VARCHAR(50),  -- 'screening_feedback', 'progress_update', 'intervention_advice'
    priority_level VARCHAR(50),  -- 'low', 'medium', 'high'
    read_by_parent BOOLEAN DEFAULT false,
    read_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parent_replies (
    id SERIAL PRIMARY KEY,
    response_id INTEGER NOT NULL REFERENCES clinician_responses(id) ON DELETE CASCADE,
    parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reply_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. ALERTS & NOTIFICATIONS TABLES
-- ============================================================================

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    clinician_id INTEGER NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
    alert_type VARCHAR(50),  -- 'crisis_threshold', 'sleep_disruption', 'therapy_missed', 'milestone', etc
    title VARCHAR(255) NOT NULL,
    description TEXT,
    crisis_level VARCHAR(50),  -- 'critical', 'warning', 'info'
    severity_score DECIMAL(5, 2),  -- 0-100
    related_screening_id INTEGER REFERENCES video_screenings(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    handled_by_clinician BOOLEAN DEFAULT false,
    handled_at TIMESTAMP,
    clinician_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alert_status (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    status VARCHAR(50),  -- 'unread', 'read', 'acknowledged', 'in_progress', 'resolved'
    last_status_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. SUPPORT SERVICES & RESOURCES TABLES
-- ============================================================================

CREATE TABLE respite_care_providers (
    id SERIAL PRIMARY KEY,
    provider_name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    services_offered VARCHAR(255)[],  -- Array: ['hourly_respite', 'after_school', etc]
    rating DECIMAL(3, 1),  -- 0-5 star rating
    distance_km DECIMAL(6, 2),
    availability VARCHAR(50),  -- 'available', 'waitlist', 'unavailable'
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    description TEXT,
    focus_area VARCHAR(100),  -- 'shared_experiences', 'stress_management', 'therapy_progress'
    meeting_schedule VARCHAR(255),  -- 'Tuesdays 7 PM', 'Weekly'
    meeting_type VARCHAR(50),  -- 'virtual', 'in_person', 'hybrid'
    location VARCHAR(255),
    facilitator_name VARCHAR(255),
    contact_email VARCHAR(255),
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    resource_type VARCHAR(50),  -- 'article', 'guide', 'video', 'app', 'book'
    category VARCHAR(100),  -- 'self_care', 'therapy', 'behavior', 'nutrition', etc
    author VARCHAR(255),
    url VARCHAR(500),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. CORRELATION & ANALYTICS TABLES
-- ============================================================================

CREATE TABLE stress_child_correlations (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    analysis_period VARCHAR(50),  -- 'weekly', 'monthly', 'all_time'
    parent_stress_average DECIMAL(5, 2),
    child_therapy_adherence_percent DECIMAL(5, 2),
    behavioral_incidents_count INTEGER,
    parent_communication_attempts INTEGER,
    respite_sessions_used INTEGER,
    correlation_strength DECIMAL(5, 2),  -- -1.0 to 1.0
    insights_text TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. SYSTEM & AUDIT TABLES
-- ============================================================================

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_name)
);

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id INTEGER,
    changes JSONB,  -- Store what changed
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. INDICES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_children_created_at ON children(created_at);
CREATE INDEX idx_parent_child_relationships_parent_id ON parent_child_relationships(parent_id);
CREATE INDEX idx_parent_child_relationships_child_id ON parent_child_relationships(child_id);
CREATE INDEX idx_clinician_patient_child_id ON clinician_patient_assignments(child_id);
CREATE INDEX idx_video_screenings_child_id ON video_screenings(child_id);
CREATE INDEX idx_video_screenings_status ON video_screenings(status);
CREATE INDEX idx_screening_results_child_id ON screening_results(child_id);
CREATE INDEX idx_milestones_child_id ON milestones(child_id);
CREATE INDEX idx_progress_tracking_child_id ON progress_tracking(child_id);
CREATE INDEX idx_therapy_sessions_child_id ON therapy_sessions(child_id);
CREATE INDEX idx_stress_journal_parent_id ON stress_journal_entries(parent_id);
CREATE INDEX idx_stress_analysis_parent_id ON stress_analysis(parent_id);
CREATE INDEX idx_clinician_responses_parent_id ON clinician_responses(parent_id);
CREATE INDEX idx_alerts_child_id ON alerts(child_id);
CREATE INDEX idx_alerts_clinician_id ON alerts(clinician_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
