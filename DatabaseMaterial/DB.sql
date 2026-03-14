-- =============================================
-- HỆ THỐNG QUẢN LÝ TUYỂN DỤNG - KHOA CÔNG NGHỆ PHẦN MỀM
-- Database: PostgreSQL
-- Ngành: Kỹ Thuật Phần Mềm & Truyền Thông Đa Phương Tiện
-- Chưa có bảng lưu ảnh công ty
-- =============================================

-- =============================================
-- 1. BẢNG NGƯỜI DÙNG VÀ PHÂN QUYỀN
-- =============================================

-- Bảng vai trò người dùng
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL, -- 'admin', 'company', 'student'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng người dùng chính
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(role_id),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. BẢNG DOANH NGHIỆP
-- =============================================
-- Chưa có phần hình ảnh công ty (ảnh bìa và ảnh công ty), phần giới thiệu công ty
CREATE TABLE companies (
    company_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    --tax_code VARCHAR(50) UNIQUE,
    industry VARCHAR(100), -- Ngành nghề
    company_size VARCHAR(50), -- '1-50', '51-200', '201-500', '500+'
    website VARCHAR(255),
    logo_url VARCHAR(500),
    description TEXT,
    address TEXT,
    city VARCHAR(100), -- chuyên môn công ty 
    district VARCHAR(100),
    --phone VARCHAR(20),
    --contact_person VARCHAR(255), -- Người liên hệ
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE, -- Đã xác minh bởi khoa
    rating DECIMAL(2,1) DEFAULT 0.0, -- Đánh giá từ sinh viên
    total_jobs_posted INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_images (
    image_id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL 
        REFERENCES companies(company_id) 
        ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- =============================================
-- 3. BẢNG SINH VIÊN
-- =============================================

-- Bảng ngành học
CREATE TABLE majors (
    major_id SERIAL PRIMARY KEY,
    major_code VARCHAR(20) UNIQUE NOT NULL, -- 'SE' (Software Engineering), 'MM' (Multimedia)
    major_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng sinh viên
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    student_code VARCHAR(20) UNIQUE NOT NULL, -- Mã sinh viên
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10), -- 'male', 'female', 'other'
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    address TEXT,
    email_student TEXT,
    
    -- Thông tin học tập
    major_id INTEGER REFERENCES majors(major_id),
    enrollment_year INTEGER, -- Năm nhập học
    expected_graduation_year INTEGER,
    current_year INTEGER, -- Năm học hiện tại (1,2,3,4)
    gpa DECIMAL(3,2),
    
    -- CV và thông tin nghề nghiệp
    cv_url VARCHAR(500), -- Link CV chính
    bio TEXT, -- Giới thiệu bản thân
    career_goals TEXT, -- Mục tiêu nghề nghiệp
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    
    -- Tùy chọn việc làm
    desired_position VARCHAR(255), -- Vị trí mong muốn
    desired_salary_min INTEGER,
    desired_salary_max INTEGER,
    desired_location VARCHAR(255), -- Địa điểm làm việc mong muốn
    work_type VARCHAR(50), -- 'full-time', 'part-time', 'internship', 'freelance'
    is_open_to_work BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng kỹ năng
CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    --skill_category VARCHAR(50), -- 'programming', 'design', 'soft_skill', 'tool', 'language'
    --description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -- Bảng kỹ năng của sinh viên (Many-to-Many)
-- CREATE TABLE student_skills (
--     student_skill_id SERIAL PRIMARY KEY,
--     student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
--     skill_id INTEGER REFERENCES skills(skill_id) ON DELETE CASCADE,
--     proficiency_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced', 'expert'
--     years_of_experience INTEGER DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(student_id, skill_id)
-- );

-- -- Bảng học vấn bổ sung (nếu có)
-- CREATE TABLE student_education (
--     education_id SERIAL PRIMARY KEY,
--     student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
--     institution_name VARCHAR(255) NOT NULL,
--     degree VARCHAR(100), -- 'Bachelor', 'Certificate', etc.
--     field_of_study VARCHAR(255),
--     start_date DATE,
--     end_date DATE,
--     is_current BOOLEAN DEFAULT FALSE,
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Bảng kinh nghiệm làm việc
-- CREATE TABLE student_experience (
--     experience_id SERIAL PRIMARY KEY,
--     student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
--     company_name VARCHAR(255) NOT NULL,
--     position VARCHAR(255) NOT NULL,
--     employment_type VARCHAR(50), -- 'full-time', 'part-time', 'internship', 'freelance'
--     start_date DATE,
--     end_date DATE,
--     is_current BOOLEAN DEFAULT FALSE,
--     description TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Bảng dự án cá nhân
-- CREATE TABLE student_projects (
--     project_id SERIAL PRIMARY KEY,
--     student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
--     project_name VARCHAR(255) NOT NULL,
--     description TEXT,
--     technologies_used TEXT, -- JSON hoặc text phân cách bằng dấu phẩy
--     project_url VARCHAR(500),
--     github_url VARCHAR(500),
--     start_date DATE,
--     end_date DATE,
--     is_ongoing BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Bảng chứng chỉ
-- CREATE TABLE student_certificates (
--     certificate_id SERIAL PRIMARY KEY,
--     student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
--     certificate_name VARCHAR(255) NOT NULL,
--     issuing_organization VARCHAR(255),
--     issue_date DATE,
--     expiry_date DATE,
--     credential_id VARCHAR(255),
--     credential_url VARCHAR(500),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- =============================================
-- 4. BẢNG TIN TUYỂN DỤNG
-- =============================================

-- Bảng danh mục công việc
CREATE TABLE job_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL, -- 'Backend', 'Frontend', 'Mobile', 'UI/UX', 'Game', 'AI/ML'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng tin tuyển dụng
CREATE TABLE job_postings (
    job_id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(company_id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES job_categories(category_id),
    
    -- Thông tin cơ bản
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    benefits TEXT,
    
    -- Chi tiết công việc
    employment_type VARCHAR(50), -- 'full-time', 'part-time', 'internship', 'contract'
    experience_level VARCHAR(50), -- 'entry', 'junior', 'mid', 'senior', 'lead'
    position_level VARCHAR(50), -- 'staff', 'team_lead', 'manager', 'director'
    number_of_positions INTEGER DEFAULT 1,
    
    -- Mức lương
    salary_min INTEGER,
    salary_max INTEGER,
    salary_type VARCHAR(20), -- 'monthly', 'hourly', 'negotiable'
    is_salary_negotiable BOOLEAN DEFAULT TRUE,
    
    -- Địa điểm
    work_location VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    is_remote BOOLEAN DEFAULT FALSE,
    
    -- Thời gian
    application_deadline DATE,
    start_date DATE,
    
    -- Trạng thái
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'closed', 'expired'
    is_featured BOOLEAN DEFAULT FALSE, -- Tin nổi bật
    is_urgent BOOLEAN DEFAULT FALSE, -- Tuyển gấp
    
    -- Thống kê
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    
    -- Ghi chú nội bộ (chỉ admin/khoa thấy)
    admin_notes TEXT,
    rejection_reason TEXT,
    approved_by INTEGER REFERENCES users(user_id),
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Bảng kỹ năng yêu cầu cho công việc (Many-to-Many)
CREATE TABLE job_required_skills (
    job_skill_id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES job_postings(job_id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(skill_id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE, -- required hoặc preferred
    proficiency_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced', 'expert'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, skill_id)
);

-- -- Bảng ngành học phù hợp cho công việc
-- CREATE TABLE job_suitable_majors (
--     job_major_id SERIAL PRIMARY KEY,
--     job_id INTEGER REFERENCES job_postings(job_id) ON DELETE CASCADE,
--     major_id INTEGER REFERENCES majors(major_id) ON DELETE CASCADE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(job_id, major_id)
-- );

-- =============================================
-- 5. BẢNG ỨNG TUYỂN
-- =============================================

CREATE TABLE applications (
    application_id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES job_postings(job_id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    
    -- CV và thư xin việc
    cv_url VARCHAR(500) NOT NULL, -- CV đã nộp
    cover_letter TEXT, -- Thư xin việc
    
    -- Trạng thái đơn ứng tuyển
    status VARCHAR(50) DEFAULT 'submitted', 
    -- 'submitted', 'viewed', 'shortlisted', 'interview_scheduled', 
    -- 'interviewed', 'offered', 'accepted', 'rejected', 'withdrawn'
    
    -- Ghi chú
    company_notes TEXT, -- Ghi chú của công ty
    student_notes TEXT, -- Ghi chú của sinh viên
    
    -- Lịch phỏng vấn (nếu có)
    interview_date TIMESTAMP,
    interview_location VARCHAR(255),
    interview_type VARCHAR(50), -- 'online', 'offline', 'phone'
    interview_notes TEXT,
    
    -- Rating (sau khi kết thúc)
    company_rating INTEGER, -- Sinh viên đánh giá công ty (1-5 sao)
    company_review TEXT,
    
    viewed_at TIMESTAMP, -- Thời điểm công ty xem CV
    responded_at TIMESTAMP, -- Thời điểm công ty phản hồi
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(job_id, student_id) -- Mỗi sinh viên chỉ ứng tuyển 1 lần cho 1 công việc
);

-- Lịch sử thay đổi trạng thái đơn ứng tuyển
CREATE TABLE application_status_history (
    history_id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(application_id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by INTEGER REFERENCES users(user_id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 6. BẢNG TÌM KIẾM VÀ GỢI Ý
-- =============================================

-- Lịch sử tìm kiếm của sinh viên
CREATE TABLE search_history (
    search_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    search_query TEXT,
    filters JSONB, -- Lưu các bộ lọc đã áp dụng
    results_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bộ lọc tìm kiếm đã lưu
CREATE TABLE saved_searches (
    saved_search_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    search_name VARCHAR(255),
    search_query TEXT,
    filters JSONB,
    is_alert_enabled BOOLEAN DEFAULT FALSE, -- Gửi thông báo khi có việc mới
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Công việc đã lưu (bookmark)
CREATE TABLE saved_jobs (
    saved_job_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES job_postings(job_id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, job_id)
);

-- Lượt xem công việc
CREATE TABLE job_views (
    view_id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES job_postings(job_id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(student_id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 7. BẢNG THÔNG BÁO
-- =============================================

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50), -- 'job_match', 'application_update', 'new_applicant', 'system'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500), -- Link đến nội dung liên quan
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 8. BẢNG HỆ THỐNG VÀ CẤU HÌNH
-- =============================================

-- Cấu hình hệ thống
CREATE TABLE system_settings (
    setting_id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Báo cáo vi phạm
CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    reporter_id INTEGER REFERENCES users(user_id),
    reported_type VARCHAR(50), -- 'job', 'company', 'user'
    reported_id INTEGER, -- ID của đối tượng bị báo cáo
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
    resolved_by INTEGER REFERENCES users(user_id),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Blacklist (công ty/người dùng bị cấm)
CREATE TABLE blacklist (
    blacklist_id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50), -- 'company', 'user', 'email_domain'
    entity_id INTEGER,
    reason TEXT NOT NULL,
    added_by INTEGER REFERENCES users(user_id),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 9. BẢNG THỐNG KÊ VÀ BÁO CÁO
-- =============================================

-- Thống kê hàng ngày
CREATE TABLE daily_statistics (
    stat_id SERIAL PRIMARY KEY,
    stat_date DATE UNIQUE NOT NULL,
    new_jobs INTEGER DEFAULT 0,
    new_applications INTEGER DEFAULT 0,
    new_companies INTEGER DEFAULT 0,
    new_students INTEGER DEFAULT 0,
    total_job_views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 10. BẢNG CONTENT VÀ BÀI VIẾT
-- =============================================

-- Bài viết blog/tin tức
-- CREATE TABLE blog_posts (
--     post_id SERIAL PRIMARY KEY,
--     author_id INTEGER REFERENCES users(user_id),
--     title VARCHAR(255) NOT NULL,
--     slug VARCHAR(255) UNIQUE NOT NULL,
--     content TEXT NOT NULL,
--     excerpt TEXT,
--     featured_image VARCHAR(500),
--     category VARCHAR(100), -- 'career_tips', 'interview_guide', 'industry_news'
--     tags TEXT, -- JSON hoặc text phân cách
--     status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'archived'
--     view_count INTEGER DEFAULT 0,
--     published_at TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- FAQ
-- CREATE TABLE faqs (
--     faq_id SERIAL PRIMARY KEY,
--     question TEXT NOT NULL,
--     answer TEXT NOT NULL,
--     category VARCHAR(100), -- 'student', 'company', 'general'
--     display_order INTEGER DEFAULT 0,
--     is_active BOOLEAN DEFAULT TRUE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- =============================================
-- 11. INDEXES ĐỂ TỐI ƯU HIỆU SUẤT
-- =============================================

-- Users & Authentication
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);

-- Companies
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_is_verified ON companies(is_verified);
CREATE INDEX idx_companies_city ON companies(city);

-- Students
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_code ON students(student_code);
CREATE INDEX idx_students_major ON students(major_id);
CREATE INDEX idx_students_graduation_year ON students(expected_graduation_year);

-- Job Postings
CREATE INDEX idx_jobs_company ON job_postings(company_id);
CREATE INDEX idx_jobs_category ON job_postings(category_id);
CREATE INDEX idx_jobs_status ON job_postings(status);
CREATE INDEX idx_jobs_deadline ON job_postings(application_deadline);
CREATE INDEX idx_jobs_city ON job_postings(city);
CREATE INDEX idx_jobs_created_at ON job_postings(created_at DESC);
CREATE INDEX idx_jobs_featured ON job_postings(is_featured) WHERE is_featured = TRUE;

-- Applications
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

-- Skills
CREATE INDEX idx_student_skills_student ON student_skills(student_id);
CREATE INDEX idx_student_skills_skill ON student_skills(skill_id);
CREATE INDEX idx_job_skills_job ON job_required_skills(job_id);
CREATE INDEX idx_job_skills_skill ON job_required_skills(skill_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Full-text search indexes
CREATE INDEX idx_jobs_fulltext ON job_postings USING gin(to_tsvector('english', job_title || ' ' || job_description));
CREATE INDEX idx_companies_fulltext ON companies USING gin(to_tsvector('english', company_name || ' ' || COALESCE(description, '')));

-- =============================================
-- 12. DỮ LIỆU MẪU BAN ĐẦU
-- =============================================

-- Thêm các vai trò
INSERT INTO roles (role_name, description) VALUES
('admin', 'Quản trị viên khoa'),
('company', 'Doanh nghiệp tuyển dụng'),
('student', 'Sinh viên');

-- Thêm các ngành học
INSERT INTO majors (major_code, major_name, description) VALUES
('SE', 'Kỹ Thuật Phần Mềm', 'Software Engineering - Đào tạo kỹ sư phần mềm chuyên nghiệp'),
('MM', 'Truyền Thông Đa Phương Tiện', 'Multimedia Communications - Đào tạo chuyên gia thiết kế và truyền thông số');

-- Thêm danh mục công việc
INSERT INTO job_categories (category_name, description) VALUES
('Backend Development', 'Phát triển Backend (Node.js, Java, Python, .NET)'),
('Frontend Development', 'Phát triển Frontend (React, Vue, Angular)'),
('Mobile Development', 'Phát triển ứng dụng di động (iOS, Android, React Native, Flutter)'),
('Full Stack Development', 'Phát triển Full Stack'),
('UI/UX Design', 'Thiết kế giao diện và trải nghiệm người dùng'),
('Game Development', 'Phát triển game'),
('DevOps', 'DevOps và Cloud'),
('Data Science/AI', 'Khoa học dữ liệu và Trí tuệ nhân tạo'),
('QA/Testing', 'Kiểm thử phần mềm'),
('Project Management', 'Quản lý dự án'),
('Graphic Design', 'Thiết kế đồ họa'),
('Video Editing', 'Biên tập video'),
('3D Modeling/Animation', 'Mô hình hóa và hoạt họa 3D'),
('Content Creation', 'Sáng tạo nội dung');

-- Thêm kỹ năng phổ biến
INSERT INTO skills (skill_name, skill_category, description) VALUES
-- Programming Languages
('JavaScript', 'programming', 'Ngôn ngữ lập trình JavaScript'),
('TypeScript', 'programming', 'Ngôn ngữ lập trình TypeScript'),
('Python', 'programming', 'Ngôn ngữ lập trình Python'),
('Java', 'programming', 'Ngôn ngữ lập trình Java'),
('C#', 'programming', 'Ngôn ngữ lập trình C#'),
('C++', 'programming', 'Ngôn ngữ lập trình C++'),
('PHP', 'programming', 'Ngôn ngữ lập trình PHP'),
('Swift', 'programming', 'Ngôn ngữ lập trình Swift cho iOS'),
('Kotlin', 'programming', 'Ngôn ngữ lập trình Kotlin cho Android'),
('Dart', 'programming', 'Ngôn ngữ lập trình Dart cho Flutter'),

-- Frontend Technologies
('React', 'tool', 'Thư viện React'),
('Vue.js', 'tool', 'Framework Vue.js'),
('Angular', 'tool', 'Framework Angular'),
('HTML/CSS', 'tool', 'HTML và CSS'),
('Tailwind CSS', 'tool', 'Framework CSS Tailwind'),
('Bootstrap', 'tool', 'Framework CSS Bootstrap'),

-- Backend Technologies
('Node.js', 'tool', 'Runtime Node.js'),
('Express.js', 'tool', 'Framework Express.js'),
('Django', 'tool', 'Framework Django'),
('Spring Boot', 'tool', 'Framework Spring Boot'),
('.NET Core', 'tool', 'Framework .NET Core'),

-- Mobile Development
('React Native', 'tool', 'Framework React Native'),
('Flutter', 'tool', 'Framework Flutter'),
('Android Development', 'tool', 'Phát triển Android native'),
('iOS Development', 'tool', 'Phát triển iOS native'),

-- Database
('MySQL', 'tool', 'Hệ quản trị CSDL MySQL'),
('PostgreSQL', 'tool', 'Hệ quản trị CSDL PostgreSQL'),
('MongoDB', 'tool', 'Hệ quản trị CSDL MongoDB'),
('Redis', 'tool', 'Hệ quản trị CSDL Redis'),
('Firebase', 'tool', 'Platform Firebase'),

-- Design Tools
('Figma', 'design', 'Công cụ thiết kế Figma'),
('Adobe Photoshop', 'design', 'Phần mềm Adobe Photoshop'),
('Adobe Illustrator', 'design', 'Phần mềm Adobe Illustrator'),
('Adobe XD', 'design', 'Công cụ thiết kế Adobe XD'),
('Sketch', 'design', 'Công cụ thiết kế Sketch'),

-- Multimedia Tools
('Adobe Premiere Pro', 'design', 'Phần mềm biên tập video'),
('Adobe After Effects', 'design', 'Phần mềm hiệu ứng và motion graphics'),
('Blender', 'design', 'Phần mềm 3D modeling'),
('Cinema 4D', 'design', 'Phần mềm 3D Cinema 4D'),
('Unity', 'tool', 'Game engine Unity'),
('Unreal Engine', 'tool', 'Game engine Unreal'),

-- DevOps & Tools
('Git', 'tool', 'Hệ thống quản lý version control'),
('Docker', 'tool', 'Containerization với Docker'),
('Kubernetes', 'tool', 'Container orchestration'),
('AWS', 'tool', 'Amazon Web Services'),
('Azure', 'tool', 'Microsoft Azure'),
('CI/CD', 'tool', 'Continuous Integration/Deployment'),

-- Soft Skills
('Communication', 'soft_skill', 'Kỹ năng giao tiếp'),
('Teamwork', 'soft_skill', 'Làm việc nhóm'),
('Problem Solving', 'soft_skill', 'Giải quyết vấn đề'),
('Time Management', 'soft_skill', 'Quản lý thời gian'),
('Critical Thinking', 'soft_skill', 'Tư duy phản biện'),
('Presentation', 'soft_skill', 'Kỹ năng thuyết trình'),

-- Languages
('English', 'language', 'Tiếng Anh'),
('Japanese', 'language', 'Tiếng Nhật'),
('Korean', 'language', 'Tiếng Hàn');

-- Thêm cấu hình hệ thống mặc định
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('job_posting_approval_required', 'true', 'Yêu cầu phê duyệt tin tuyển dụng'),
('job_posting_default_duration_days', '30', 'Thời gian hiển thị tin mặc định (ngày)'),
('max_applications_per_student', '20', 'Số đơn ứng tuyển tối đa mỗi sinh viên trong 1 tháng'),
('min_gpa_required', '2.0', 'GPA tối thiểu để ứng tuyển'),
('enable_email_notifications', 'true', 'Bật thông báo qua email'),
('enable_ai_matching', 'true', 'Bật tính năng gợi ý thông minh'),
('site_name', 'Hệ Thống Tuyển Dụng - Khoa CNPM', 'Tên website'),
('contact_email', 'cnpm@university.edu.vn', 'Email liên hệ');

-- =============================================
-- 13. TRIGGERS VÀ FUNCTIONS
-- =============================================

-- Function cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger cho các bảng cần cập nhật updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function tự động tăng view_count khi có lượt xem
CREATE OR REPLACE FUNCTION increment_job_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE job_postings 
    SET view_count = view_count + 1 
    WHERE job_id = NEW.job_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_increment_job_views AFTER INSERT ON job_views
    FOR EACH ROW EXECUTE FUNCTION increment_job_view_count();

-- Function tự động tăng application_count
CREATE OR REPLACE FUNCTION increment_application_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE job_postings 
    SET application_count = application_count + 1 
    WHERE job_id = NEW.job_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_increment_application_count AFTER INSERT ON applications
    FOR EACH ROW EXECUTE FUNCTION increment_application_count();

-- Function ghi lịch sử thay đổi trạng thái đơn ứng tuyển
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO application_status_history (application_id, old_status, new_status, changed_by)
        VALUES (NEW.application_id, OLD.status, NEW.status, NEW.student_id);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_log_application_status AFTER UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION log_application_status_change();

-- =============================================
-- 14. VIEWS HỖ TRỢ TRUY VẤN
-- =============================================

-- View thống kê công ty
CREATE VIEW company_statistics AS
SELECT 
    c.company_id,
    c.company_name,
    COUNT(DISTINCT jp.job_id) as total_jobs,
    COUNT(DISTINCT CASE WHEN jp.status = 'approved' THEN jp.job_id END) as active_jobs,
    COUNT(DISTINCT a.application_id) as total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'submitted' THEN a.application_id END) as pending_applications,
    AVG(a.company_rating) as average_rating
FROM companies c
LEFT JOIN job_postings jp ON c.company_id = jp.company_id
LEFT JOIN applications a ON jp.job_id = a.job_id
GROUP BY c.company_id, c.company_name;

-- View thống kê sinh viên
CREATE VIEW student_statistics AS
SELECT 
    s.student_id,
    s.full_name,
    s.student_code,
    m.major_name,
    COUNT(DISTINCT a.application_id) as total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'interview_scheduled' THEN a.application_id END) as interviews,
    COUNT(DISTINCT CASE WHEN a.status = 'offered' THEN a.application_id END) as offers,
    COUNT(DISTINCT sj.saved_job_id) as saved_jobs,
    COUNT(DISTINCT ss.skill_id) as total_skills
FROM students s
LEFT JOIN majors m ON s.major_id = m.major_id
LEFT JOIN applications a ON s.student_id = a.student_id
LEFT JOIN saved_jobs sj ON s.student_id = sj.student_id
LEFT JOIN student_skills ss ON s.student_id = ss.student_id
GROUP BY s.student_id, s.full_name, s.student_code, m.major_name;

-- View công việc phổ biến
CREATE VIEW popular_jobs AS
SELECT 
    jp.job_id,
    jp.job_title,
    c.company_name,
    jc.category_name,
    jp.view_count,
    jp.application_count,
    jp.created_at
FROM job_postings jp
JOIN companies c ON jp.company_id = c.company_id
LEFT JOIN job_categories jc ON jp.category_id = jc.category_id
WHERE jp.status = 'approved'
ORDER BY jp.view_count DESC, jp.application_count DESC;

-- =============================================
-- KẾT THÚC SCHEMA
-- =============================================

-- Ghi chú: 
-- 1. Nhớ thay đổi mật khẩu mặc định và các thông tin nhạy cảm
-- 2. Cấu hình backup định kỳ
-- 3. Cấu hình connection pool phù hợp với lượng truy cập
-- 4. Monitor performance và tối ưu indexes khi cần
-- 5. Implement rate limiting ở application layer
-- 6. Encrypt sensitive data (password, personal info)
-- 7. Setup audit logs cho các thao tác quan trọng