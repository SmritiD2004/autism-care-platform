# NeuroThrive Database Schema - Complete Overview

## 📊 Total Tables: 28

### **Table Count by Category:**
- **Core User & Auth**: 3 tables
- **Child/Patient Management**: 3 tables
- **Video Screening & Analysis**: 3 tables
- **Child Progress Tracking**: 2 tables
- **Therapy Sessions**: 2 tables
- **Parent Mental Health**: 3 tables
- **Clinician Communication**: 2 tables
- **Alerts & Notifications**: 2 tables
- **Support Services**: 3 tables
- **Analytics & Correlation**: 1 table
- **System & Audit**: 2 tables

---

## 🗂️ Detailed Table Breakdown

### **GROUP 1: CORE USER & AUTHENTICATION (3 tables)**

#### 1. `roles`
- Stores role types: 'parent', 'clinician', 'therapist', 'admin'
- Links to users for authorization

#### 2. `users`
- Central user table for ALL user types
- Stores: email, password_hash, full_name, phone, role_id
- Tracks: is_active, last_login

#### 3. `clinicians`
- Extends users table specifically for clinician details
- Stores: license_number, specialization, qualification, bio, availability_status
- One-to-one with users via user_id

---

### **GROUP 2: CHILD & PATIENT MANAGEMENT (3 tables)**

#### 4. `children`
- Core child/patient records
- Stores: first_name, last_name, DOB, gender, diagnosis, severity_level
- Tracks: medical_history, special_notes, photo_url

#### 5. `parent_child_relationships`
- Links parents to children (one parent can manage multiple children)
- Stores: parent_id, child_id, relationship_type ('mother', 'father', 'guardian')
- Identifies: is_primary_contact

#### 6. `clinician_patient_assignments`
- Assigns clinicians to children for therapy
- Stores: clinician_id, child_id, assignment_date, status
- Status: 'active', 'inactive', 'completed'

---

### **GROUP 3: VIDEO SCREENING & AI ANALYSIS (3 tables)**

#### 7. `video_screenings`
- Records video uploads from parents
- Stores: child_id, parent_id, video_url, upload_date, file_size_mb
- Tracks: status ('pending', 'processing', 'completed'), processing_progress_percent

#### 8. `screening_results`
- AI analysis results from ML model
- Stores: autism_risk_score (0-100), confidence_level
- Includes: eye_contact_%, speech_clarity, social_interaction, motor_coordination, stimulus_response
- Contains: overall_assessment, recommendations, model_version

#### 9. `screening_feedback`
- Clinician reviews & responses to screening analysis
- Stores: feedback_text, agrees_with_analysis, severity_rating
- Tracks: recommended_interventions, follow_up_required, follow_up_date

---

### **GROUP 4: CHILD PROGRESS TRACKING (2 tables)**

#### 10. `milestones`
- Parent logs child achievements
- Stores: title, description, category, milestone_date
- Categories: 'social', 'communication', 'emotional', 'behavioral', 'academic', 'self_care'
- Tracks: importance_level ('low', 'medium', 'high')

#### 11. `progress_tracking`
- Weekly/monthly progress scores
- Stores: social_skills_score, communication_score, emotional_regulation, behavior_control
- Includes: academic_progress, self_care, overall_development (all 0-100)
- Unique constraint: child_id + week_number + month

---

### **GROUP 5: THERAPY SESSIONS & PLANS (2 tables)**

#### 12. `therapy_sessions`
- Individual therapy session records
- Stores: child_id, clinician_id, session_date, duration_minutes
- Types: 'speech', 'behavioral', 'occupational', 'group'
- Tracks: focus_areas, achievements, challenges, homework_assigned
- Can store: session_recording_url

#### 13. `therapy_plans`
- Long-term therapy treatment plans
- Stores: plan_name, start_date, end_date
- Contains: goals (array), intervention_strategies, frequency_per_week
- Status: 'active', 'paused', 'completed'

---

### **GROUP 6: PARENT MENTAL HEALTH & STRESS (3 tables)**

#### 14. `stress_journal_entries`
- Raw parent journal entries
- Stores: entry_text, entry_date, stress_level_before, mood_before
- Raw input before AI processing

#### 15. `stress_analysis`
- AI-processed analysis of journal entries
- Stores: sentiment_score (-1.0 to 1.0), sentiment_label
- Detects: emotions (array), burnout_risk_score (0-100), burnout_risk_level
- Flags: suicidality_risk (CRITICAL)
- Contains: recommended_support, analysis_model_version

#### 16. `parent_mental_health_summary`
- Aggregated wellness metrics for each parent
- Stores: average_stress_score, trend_direction ('increasing', 'stable', 'decreasing')
- Tracks: respite sessions used, support group attendance
- Calculates: wellness_score (0-100 overall)

---

### **GROUP 7: CLINICIAN COMMUNICATION (2 tables)**

#### 17. `clinician_responses`
- Clinician feedback sent to parents
- Stores: response_text, response_type ('screening_feedback', 'progress_update', 'intervention_advice')
- Tracks: priority_level, read_by_parent, read_date
- Links: parent_id, clinician_id, child_id, screening_id

#### 18. `parent_replies`
- Parent responses to clinician feedback
- Stores: reply_text to clinician_responses
- Creates two-way communication

---

### **GROUP 8: ALERTS & NOTIFICATIONS (2 tables)**

#### 19. `alerts`
- Alerts triggered for clinicians about children
- Types: 'crisis_threshold', 'sleep_disruption', 'therapy_missed', 'milestone'
- Levels: 'critical', 'warning', 'info'
- Tracks: is_active, handled_by_clinician, handled_at, clinician_notes

#### 20. `alert_status`
- Status tracking for alerts
- Status values: 'unread', 'read', 'acknowledged', 'in_progress', 'resolved'
- Timestamps status changes

---

### **GROUP 9: SUPPORT SERVICES & RESOURCES (3 tables)**

#### 21. `respite_care_providers`
- Directory of respite care services
- Stores: provider_name, address, phone, email, website
- Services offered (array): 'hourly_respite', 'after_school', 'sibling_support'
- Rating: 0-5 stars, distance_km, availability
- Verified status for quality control

#### 22. `support_groups`
- Directory of parent support groups
- Stores: group_name, focus_area, meeting_schedule, meeting_type
- Types: 'virtual', 'in_person', 'hybrid'
- Tracks: facilitator_name, member_count

#### 23. `resources`
- Articles, guides, videos, apps, books
- Categories: 'self_care', 'therapy', 'behavior', 'nutrition'
- Stores: title, content, author, url
- Tracks: is_published, dates

---

### **GROUP 10: ANALYTICS & CORRELATION (1 table)**

#### 24. `stress_child_correlations`
- **KEY INSIGHT TABLE** - Correlations between parent stress and child progress
- Stores: parent_id, child_id, analysis_period ('weekly', 'monthly', 'all_time')
- Metrics:
  - parent_stress_average
  - child_therapy_adherence_percent
  - behavioral_incidents_count
  - parent_communication_attempts
  - respite_sessions_used
- Calculates: correlation_strength (-1.0 to 1.0)
- Contains: insights_text, recommendations

---

### **GROUP 11: SYSTEM & AUDIT (2 tables)**

#### 25. `permissions`
- Role-based access control mapping
- Stores: role_id, permission_name
- Examples: 'view_own_child', 'upload_videos', 'view_screenings', 'edit_therapy_plans'

#### 26. `audit_log`
- Complete audit trail for compliance
- Logs: user_id, action, entity_type, entity_id
- Stores: changes (JSONB), IP_address, timestamp
- Critical for HIPAA/privacy compliance

#### 27-28. **INDICES** (Not separate tables, but critical for performance)
- 18+ indices created for fast queries
- Indexed on foreign keys, status fields, dates, user lookups

---

## 🔗 Key Relationships & Data Flows

```
┌─────────────────────────────────────────────────────────────┐
│                      USERS (CORE)                            │
└──────────┬──────────────────────────────────────────────────┘
           │
    ┌──────┴────────┬────────────────┐
    │               │                │
   ▼               ▼                 ▼
PARENT ──► CHILDREN   CLINICIAN
    │        │            │
    │        │           │
    │    ┌───┴────────────┴──┐
    │    │                   │
    ▼    ▼                   ▼
  STRESS_  MILESTONES  THERAPY_
  JOURNAL & PROGRESS    SESSIONS
     │         │            │
     └─────┬───┴────────────┘
           │
      (CORRELATION ANALYSIS)
           │
       ┌───┴────────────┐
       │                │
       ▼                ▼
   ALERTS          RESPONSES
   (Clinician)     (Feedback)
       │                │
       ├────────┬───────┘
       │        │
       ▼        ▼
    (PARENT RECEIVES)
   - Alert notifications
   - Clinician feedback
   - Stress support
```

---

## 📈 Data Flow Examples

### **Flow 1: Video Screening Process**
1. Parent uploads video → `video_screenings` (status: 'pending')
2. Backend processes → status changes to 'processing'
3. ML model analyzes → `screening_results` created
4. Clinician reviews → `screening_feedback` created
5. Clinician sends response → `clinician_responses` created
6. Parent reads response → read_by_parent = true

### **Flow 2: Stress Detection & Support**
1. Parent writes journal → `stress_journal_entries` created
2. NLP/BERT analyzes → `stress_analysis` created (burnout_risk_score, emotions)
3. If risk HIGH → `alerts` created for clinician
4. Support recommended → `clinician_responses` sent
5. Parent receives support, takes respite → `parent_mental_health_summary` updated

### **Flow 3: Correlation Analysis**
1. Aggregate parent's last month of stress scores
2. Get child's therapy adherence % from `therapy_sessions`
3. Count behavioral incidents from `alerts` 
4. Calculate correlation → `stress_child_correlations` updated
5. Generate insights → shared back with parent

---

## 🔑 Important Design Decisions

### **1. Separate Stress Tables**
- `stress_journal_entries` = Raw data (what parent wrote)
- `stress_analysis` = Processed AI insights
- `parent_mental_health_summary` = Aggregated trends
- Allows time-series analysis and trend detection

### **2. Clinician vs Users**
- `users` table has ALL users (parents, clinicians, admins)
- `clinicians` extends users with profession-specific details
- Allows flexible role assignment and permission management

### **3. Alerts Instead of Hardcoded Notifications**
- Dynamic alert system in `alerts` table
- Can create new alert types without code changes
- Clinicians can acknowledge/handle alerts
- Trackable for audit logs

### **4. JSONB for Flexible Data**
- `audit_log.changes` - Different entities change different fields
- `therapy_plans.goals` - Array of variable goals
- Provides flexibility while maintaining structure

### **5. Correlation Table**
- Pre-calculated insights in `stress_child_correlations`
- Fast lookup for parent insights page
- Can be updated daily/weekly without recalculating everything

---

## 🚀 Implementation Steps

1. **Create PostgreSQL database**
2. **Run schema.sql** to create all tables
3. **Set up ORM** (Prisma or TypeORM)
4. **Create migrations** for future schema changes
5. **Implement backend APIs** to interact with tables
6. **Add data validation** at ORM level

