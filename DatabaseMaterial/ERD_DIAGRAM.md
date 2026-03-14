erDiagram
    %% ========================================
    %% AUTHENTICATION & AUTHORIZATION
    %% ========================================
    
    ROLES {
        serial role_id PK
        varchar role_name UK "admin, company, student"
        text description
        timestamp created_at
    }
    
    USERS {
        serial user_id PK
        varchar email UK
        varchar password_hash
        integer role_id FK
        boolean is_active
        boolean is_verified
        varchar verification_token
        varchar reset_token
        timestamp reset_token_expires
        timestamp last_login
        timestamp created_at
        timestamp updated_at
    }
    
    %% ========================================
    %% COMPANIES
    %% ========================================
    
    COMPANIES {
        serial company_id PK
        integer user_id UK_FK
        varchar company_name
        varchar tax_code UK
        varchar industry
        varchar company_size
        varchar website
        varchar logo_url
        text description
        text address
        varchar city
        varchar district
        varchar phone
        varchar contact_person
        varchar contact_email
        varchar contact_phone
        boolean is_verified
        boolean is_partner
        decimal rating
        integer total_jobs_posted
        timestamp created_at
        timestamp updated_at
    }
    
    %% ========================================
    %% STUDENTS & EDUCATION
    %% ========================================
    
    MAJORS {
        serial major_id PK
        varchar major_code UK "SE, MM"
        varchar major_name
        text description
        timestamp created_at
    }
    
    STUDENTS {
        serial student_id PK
        integer user_id UK_FK
        varchar student_code UK
        varchar full_name
        date date_of_birth
        varchar gender
        varchar phone
        varchar avatar_url
        text address
        varchar city
        integer major_id FK
        integer enrollment_year
        integer expected_graduation_year
        integer current_year
        decimal gpa
        varchar cv_url
        text bio
        text career_goals
        varchar linkedin_url
        varchar github_url
        varchar portfolio_url
        varchar desired_position
        integer desired_salary_min
        integer desired_salary_max
        varchar desired_location
        varchar work_type
        boolean is_open_to_work
        timestamp created_at
        timestamp updated_at
    }
    
    SKILLS {
        serial skill_id PK
        varchar skill_name UK
        varchar skill_category
        text description
        timestamp created_at
    }
    
    STUDENT_SKILLS {
        serial student_skill_id PK
        integer student_id FK
        integer skill_id FK
        varchar proficiency_level
        integer years_of_experience
        timestamp created_at
    }
    
    STUDENT_EDUCATION {
        serial education_id PK
        integer student_id FK
        varchar institution_name
        varchar degree
        varchar field_of_study
        date start_date
        date end_date
        boolean is_current
        text description
        timestamp created_at
    }
    
    STUDENT_EXPERIENCE {
        serial experience_id PK
        integer student_id FK
        varchar company_name
        varchar position
        varchar employment_type
        date start_date
        date end_date
        boolean is_current
        text description
        timestamp created_at
    }
    
    STUDENT_PROJECTS {
        serial project_id PK
        integer student_id FK
        varchar project_name
        text description
        text technologies_used
        varchar project_url
        varchar github_url
        date start_date
        date end_date
        boolean is_ongoing
        timestamp created_at
    }
    
    STUDENT_CERTIFICATES {
        serial certificate_id PK
        integer student_id FK
        varchar certificate_name
        varchar issuing_organization
        date issue_date
        date expiry_date
        varchar credential_id
        varchar credential_url
        timestamp created_at
    }
    
    %% ========================================
    %% JOB POSTINGS
    %% ========================================
    
    JOB_CATEGORIES {
        serial category_id PK
        varchar category_name UK
        text description
        timestamp created_at
    }
    
    JOB_POSTINGS {
        serial job_id PK
        integer company_id FK
        integer category_id FK
        varchar job_title
        text job_description
        text requirements
        text benefits
        varchar employment_type
        varchar experience_level
        varchar position_level
        integer number_of_positions
        integer salary_min
        integer salary_max
        varchar salary_type
        boolean is_salary_negotiable
        varchar work_location
        varchar city
        varchar district
        boolean is_remote
        date application_deadline
        date start_date
        varchar status
        boolean is_featured
        boolean is_urgent
        integer view_count
        integer application_count
        text admin_notes
        text rejection_reason
        integer approved_by FK
        timestamp approved_at
        timestamp created_at
        timestamp updated_at
        timestamp expires_at
    }
    
    JOB_REQUIRED_SKILLS {
        serial job_skill_id PK
        integer job_id FK
        integer skill_id FK
        boolean is_required
        varchar proficiency_level
        timestamp created_at
    }
    
    JOB_SUITABLE_MAJORS {
        serial job_major_id PK
        integer job_id FK
        integer major_id FK
        timestamp created_at
    }
    
    %% ========================================
    %% APPLICATIONS
    %% ========================================
    
    APPLICATIONS {
        serial application_id PK
        integer job_id FK
        integer student_id FK
        varchar cv_url
        text cover_letter
        varchar status
        text company_notes
        text student_notes
        timestamp interview_date
        varchar interview_location
        varchar interview_type
        text interview_notes
        integer company_rating
        text company_review
        timestamp viewed_at
        timestamp responded_at
        timestamp created_at
        timestamp updated_at
    }
    
    APPLICATION_STATUS_HISTORY {
        serial history_id PK
        integer application_id FK
        varchar old_status
        varchar new_status
        integer changed_by FK
        text notes
        timestamp created_at
    }
    
    %% ========================================
    %% SEARCH & RECOMMENDATIONS
    %% ========================================
    
    SEARCH_HISTORY {
        serial search_id PK
        integer student_id FK
        text search_query
        jsonb filters
        integer results_count
        timestamp created_at
    }
    
    SAVED_SEARCHES {
        serial saved_search_id PK
        integer student_id FK
        varchar search_name
        text search_query
        jsonb filters
        boolean is_alert_enabled
        timestamp created_at
    }
    
    SAVED_JOBS {
        serial saved_job_id PK
        integer student_id FK
        integer job_id FK
        text notes
        timestamp created_at
    }
    
    JOB_VIEWS {
        serial view_id PK
        integer job_id FK
        integer student_id FK
        varchar ip_address
        text user_agent
        timestamp viewed_at
    }
    
    %% ========================================
    %% NOTIFICATIONS
    %% ========================================
    
    NOTIFICATIONS {
        serial notification_id PK
        integer user_id FK
        varchar type
        varchar title
        text message
        varchar link
        boolean is_read
        timestamp created_at
    }
    
    %% ========================================
    %% SYSTEM & ADMIN
    %% ========================================
    
    SYSTEM_SETTINGS {
        serial setting_id PK
        varchar setting_key UK
        text setting_value
        text description
        timestamp updated_at
    }
    
    REPORTS {
        serial report_id PK
        integer reporter_id FK
        varchar reported_type
        integer reported_id
        varchar reason
        text description
        varchar status
        integer resolved_by FK
        text resolution_notes
        timestamp created_at
        timestamp resolved_at
    }
    
    BLACKLIST {
        serial blacklist_id PK
        varchar entity_type
        integer entity_id
        text reason
        integer added_by FK
        timestamp expires_at
        timestamp created_at
    }
    
    DAILY_STATISTICS {
        serial stat_id PK
        date stat_date UK
        integer new_jobs
        integer new_applications
        integer new_companies
        integer new_students
        integer total_job_views
        timestamp created_at
    }
    
    %% ========================================
    %% CONTENT MANAGEMENT
    %% ========================================
    
    BLOG_POSTS {
        serial post_id PK
        integer author_id FK
        varchar title
        varchar slug UK
        text content
        text excerpt
        varchar featured_image
        varchar category
        text tags
        varchar status
        integer view_count
        timestamp published_at
        timestamp created_at
        timestamp updated_at
    }
    
    FAQS {
        serial faq_id PK
        text question
        text answer
        varchar category
        integer display_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    %% ========================================
    %% RELATIONSHIPS
    %% ========================================
    
    %% Users & Roles
    ROLES ||--o{ USERS : "has"
    
    %% Users & Companies (1-1)
    USERS ||--o| COMPANIES : "has_profile"
    
    %% Users & Students (1-1)
    USERS ||--o| STUDENTS : "has_profile"
    
    %% Students & Majors
    MAJORS ||--o{ STUDENTS : "belongs_to"
    
    %% Students & Skills (Many-to-Many)
    STUDENTS ||--o{ STUDENT_SKILLS : "has"
    SKILLS ||--o{ STUDENT_SKILLS : "belongs_to"
    
    %% Students & Additional Info
    STUDENTS ||--o{ STUDENT_EDUCATION : "has"
    STUDENTS ||--o{ STUDENT_EXPERIENCE : "has"
    STUDENTS ||--o{ STUDENT_PROJECTS : "has"
    STUDENTS ||--o{ STUDENT_CERTIFICATES : "has"
    
    %% Companies & Jobs
    COMPANIES ||--o{ JOB_POSTINGS : "posts"
    
    %% Job Categories
    JOB_CATEGORIES ||--o{ JOB_POSTINGS : "categorized_as"
    
    %% Jobs & Skills (Many-to-Many)
    JOB_POSTINGS ||--o{ JOB_REQUIRED_SKILLS : "requires"
    SKILLS ||--o{ JOB_REQUIRED_SKILLS : "required_by"
    
    %% Jobs & Majors (Many-to-Many)
    JOB_POSTINGS ||--o{ JOB_SUITABLE_MAJORS : "suitable_for"
    MAJORS ||--o{ JOB_SUITABLE_MAJORS : "suitable_for"
    
    %% Applications
    JOB_POSTINGS ||--o{ APPLICATIONS : "receives"
    STUDENTS ||--o{ APPLICATIONS : "submits"
    
    %% Application Status History
    APPLICATIONS ||--o{ APPLICATION_STATUS_HISTORY : "has_history"
    USERS ||--o{ APPLICATION_STATUS_HISTORY : "changed_by"
    
    %% Student Search & Saved
    STUDENTS ||--o{ SEARCH_HISTORY : "searches"
    STUDENTS ||--o{ SAVED_SEARCHES : "saves"
    STUDENTS ||--o{ SAVED_JOBS : "bookmarks"
    JOB_POSTINGS ||--o{ SAVED_JOBS : "bookmarked_by"
    
    %% Job Views
    JOB_POSTINGS ||--o{ JOB_VIEWS : "viewed_by"
    STUDENTS ||--o{ JOB_VIEWS : "views"
    
    %% Notifications
    USERS ||--o{ NOTIFICATIONS : "receives"
    
    %% Reports & Blacklist
    USERS ||--o{ REPORTS : "reports"
    USERS ||--o{ REPORTS : "resolves"
    USERS ||--o{ BLACKLIST : "adds_to"
    
    %% Blog Posts
    USERS ||--o{ BLOG_POSTS : "authors"
    
    %% Job Approval
    USERS ||--o{ JOB_POSTINGS : "approves"