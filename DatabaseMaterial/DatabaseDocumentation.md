# TÀI LIỆU HỆ THỐNG DATABASE - TUYỂN DỤNG KHOA CNPM

## 📋 TỔNG QUAN

Hệ thống database được thiết kế cho ứng dụng quản lý tuyển dụng của Khoa Công Nghệ Phần Mềm, hỗ trợ 2 ngành chính:
- **Kỹ Thuật Phần Mềm (SE)**
- **Truyền Thông Đa Phương Tiện (MM)**

### Công nghệ sử dụng
- **Database:** PostgreSQL
- **Số lượng bảng:** 35+ bảng chính
- **Tính năng đặc biệt:** Full-text search, Triggers, Views, Indexes optimization

---

## 🎯 CẤU TRÚC DATABASE THEO MODULE

### **MODULE 1: NGƯỜI DÙNG & PHÂN QUYỀN**

#### 1.1. Bảng `roles` - Vai trò người dùng
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| role_id | SERIAL PK | ID vai trò |
| role_name | VARCHAR(50) | Tên vai trò (admin/company/student) |
| description | TEXT | Mô tả |

**Dữ liệu mẫu:**
- `admin` - Quản trị viên khoa
- `company` - Doanh nghiệp
- `student` - Sinh viên

#### 1.2. Bảng `users` - Thông tin đăng nhập
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| user_id | SERIAL PK | ID người dùng |
| email | VARCHAR(255) UNIQUE | Email đăng nhập |
| password_hash | VARCHAR(255) | Mật khẩu đã hash |
| role_id | INTEGER FK | Vai trò |
| is_active | BOOLEAN | Tài khoản active |
| is_verified | BOOLEAN | Đã xác thực email |
| verification_token | VARCHAR(255) | Token xác thực |
| reset_token | VARCHAR(255) | Token reset password |
| last_login | TIMESTAMP | Lần đăng nhập cuối |

**Quan hệ:**
- `role_id` → `roles(role_id)`

---

### **MODULE 2: DOANH NGHIỆP**

#### 2.1. Bảng `companies` - Thông tin doanh nghiệp
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| company_id | SERIAL PK | ID công ty |
| user_id | INTEGER UNIQUE FK | Liên kết user |
| company_name | VARCHAR(255) | Tên công ty |
| tax_code | VARCHAR(50) UNIQUE | Mã số thuế |
| industry | VARCHAR(100) | Ngành nghề |
| company_size | VARCHAR(50) | Quy mô (1-50, 51-200, 201-500, 500+) |
| website | VARCHAR(255) | Website |
| logo_url | VARCHAR(500) | Link logo |
| description | TEXT | Giới thiệu |
| address | TEXT | Địa chỉ |
| city | VARCHAR(100) | Thành phố |
| is_verified | BOOLEAN | Đã xác minh bởi khoa |
| is_partner | BOOLEAN | Đối tác chiến lược |
| rating | DECIMAL(2,1) | Đánh giá trung bình |

**Quan hệ:**
- `user_id` → `users(user_id)` [1-1]
- `company_id` → `job_postings(company_id)` [1-N]

---

### **MODULE 3: SINH VIÊN**

#### 3.1. Bảng `majors` - Ngành học
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| major_id | SERIAL PK | ID ngành |
| major_code | VARCHAR(20) UNIQUE | Mã ngành (SE/MM) |
| major_name | VARCHAR(255) | Tên ngành |

**Dữ liệu mặc định:**
- SE - Kỹ Thuật Phần Mềm
- MM - Truyền Thông Đa Phương Tiện

#### 3.2. Bảng `students` - Thông tin sinh viên
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| student_id | SERIAL PK | ID sinh viên |
| user_id | INTEGER UNIQUE FK | Liên kết user |
| student_code | VARCHAR(20) UNIQUE | Mã sinh viên |
| full_name | VARCHAR(255) | Họ tên |
| date_of_birth | DATE | Ngày sinh |
| phone | VARCHAR(20) | Số điện thoại |
| avatar_url | VARCHAR(500) | Ảnh đại diện |
| major_id | INTEGER FK | Ngành học |
| enrollment_year | INTEGER | Năm nhập học |
| expected_graduation_year | INTEGER | Năm tốt nghiệp dự kiến |
| current_year | INTEGER | Năm học hiện tại (1-4) |
| gpa | DECIMAL(3,2) | Điểm GPA |
| cv_url | VARCHAR(500) | Link CV chính |
| bio | TEXT | Giới thiệu bản thân |
| desired_position | VARCHAR(255) | Vị trí mong muốn |
| desired_salary_min/max | INTEGER | Mức lương mong muốn |
| is_open_to_work | BOOLEAN | Đang tìm việc |

**Quan hệ:**
- `user_id` → `users(user_id)` [1-1]
- `major_id` → `majors(major_id)` [N-1]

#### 3.3. Bảng `skills` - Kỹ năng
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| skill_id | SERIAL PK | ID kỹ năng |
| skill_name | VARCHAR(100) UNIQUE | Tên kỹ năng |
| skill_category | VARCHAR(50) | Loại (programming/design/soft_skill/tool/language) |

**Danh mục kỹ năng có sẵn:**
- **Programming:** JavaScript, TypeScript, Python, Java, C#, C++, PHP, Swift, Kotlin, Dart
- **Frontend:** React, Vue.js, Angular, HTML/CSS, Tailwind, Bootstrap
- **Backend:** Node.js, Express.js, Django, Spring Boot, .NET Core
- **Mobile:** React Native, Flutter, Android, iOS
- **Database:** MySQL, PostgreSQL, MongoDB, Redis, Firebase
- **Design:** Figma, Photoshop, Illustrator, Adobe XD, Sketch
- **Multimedia:** Premiere Pro, After Effects, Blender, Cinema 4D, Unity, Unreal
- **DevOps:** Git, Docker, Kubernetes, AWS, Azure, CI/CD
- **Soft Skills:** Communication, Teamwork, Problem Solving, Time Management
- **Languages:** English, Japanese, Korean

#### 3.4. Bảng `student_skills` - Kỹ năng của sinh viên (Many-to-Many)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| student_skill_id | SERIAL PK | ID |
| student_id | INTEGER FK | ID sinh viên |
| skill_id | INTEGER FK | ID kỹ năng |
| proficiency_level | VARCHAR(20) | Trình độ (beginner/intermediate/advanced/expert) |
| years_of_experience | INTEGER | Số năm kinh nghiệm |

#### 3.5. Các bảng bổ sung cho hồ sơ sinh viên

**`student_education`** - Học vấn bổ sung
- Trường học, bằng cấp, chuyên ngành
- Thời gian học

**`student_experience`** - Kinh nghiệm làm việc
- Công ty, vị trí, loại hình
- Thời gian làm việc, mô tả công việc

**`student_projects`** - Dự án cá nhân
- Tên dự án, mô tả, công nghệ sử dụng
- Link demo, GitHub

**`student_certificates`** - Chứng chỉ
- Tên chứng chỉ, tổ chức cấp
- Ngày cấp, ngày hết hạn

---

### **MODULE 4: TUYỂN DỤNG**

#### 4.1. Bảng `job_categories` - Danh mục công việc
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| category_id | SERIAL PK | ID danh mục |
| category_name | VARCHAR(100) UNIQUE | Tên danh mục |

**Danh mục có sẵn:**
- Backend Development
- Frontend Development
- Mobile Development
- Full Stack Development
- UI/UX Design
- Game Development
- DevOps
- Data Science/AI
- QA/Testing
- Project Management
- Graphic Design
- Video Editing
- 3D Modeling/Animation
- Content Creation

#### 4.2. Bảng `job_postings` - Tin tuyển dụng
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| job_id | SERIAL PK | ID công việc |
| company_id | INTEGER FK | ID công ty |
| category_id | INTEGER FK | Danh mục |
| job_title | VARCHAR(255) | Tiêu đề |
| job_description | TEXT | Mô tả công việc |
| requirements | TEXT | Yêu cầu |
| benefits | TEXT | Quyền lợi |
| employment_type | VARCHAR(50) | Loại hình (full-time/part-time/internship/contract) |
| experience_level | VARCHAR(50) | Cấp độ (entry/junior/mid/senior/lead) |
| salary_min/max | INTEGER | Mức lương |
| salary_type | VARCHAR(20) | Kiểu lương (monthly/hourly/negotiable) |
| work_location | VARCHAR(255) | Địa điểm |
| city | VARCHAR(100) | Thành phố |
| is_remote | BOOLEAN | Làm việc remote |
| application_deadline | DATE | Hạn nộp hồ sơ |
| status | VARCHAR(20) | Trạng thái (pending/approved/rejected/closed/expired) |
| is_featured | BOOLEAN | Tin nổi bật |
| is_urgent | BOOLEAN | Tuyển gấp |
| view_count | INTEGER | Lượt xem |
| application_count | INTEGER | Số đơn ứng tuyển |

**Quan hệ:**
- `company_id` → `companies(company_id)` [N-1]
- `category_id` → `job_categories(category_id)` [N-1]

#### 4.3. Bảng `job_required_skills` - Kỹ năng yêu cầu (Many-to-Many)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| job_skill_id | SERIAL PK | ID |
| job_id | INTEGER FK | ID công việc |
| skill_id | INTEGER FK | ID kỹ năng |
| is_required | BOOLEAN | Bắt buộc hay ưu tiên |
| proficiency_level | VARCHAR(20) | Trình độ yêu cầu |

#### 4.4. Bảng `job_suitable_majors` - Ngành phù hợp (Many-to-Many)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| job_major_id | SERIAL PK | ID |
| job_id | INTEGER FK | ID công việc |
| major_id | INTEGER FK | ID ngành |

---

### **MODULE 5: ỨNG TUYỂN**

#### 5.1. Bảng `applications` - Đơn ứng tuyển
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| application_id | SERIAL PK | ID đơn |
| job_id | INTEGER FK | ID công việc |
| student_id | INTEGER FK | ID sinh viên |
| cv_url | VARCHAR(500) | Link CV nộp |
| cover_letter | TEXT | Thư xin việc |
| status | VARCHAR(50) | Trạng thái |
| company_notes | TEXT | Ghi chú của công ty |
| interview_date | TIMESTAMP | Lịch phỏng vấn |
| interview_location | VARCHAR(255) | Địa điểm phỏng vấn |
| interview_type | VARCHAR(50) | Loại (online/offline/phone) |
| company_rating | INTEGER | Đánh giá công ty (1-5) |
| company_review | TEXT | Review công ty |
| viewed_at | TIMESTAMP | Thời điểm công ty xem |
| responded_at | TIMESTAMP | Thời điểm công ty phản hồi |

**Các trạng thái:**
- `submitted` - Đã nộp
- `viewed` - Đã xem
- `shortlisted` - Được chọn
- `interview_scheduled` - Đã hẹn phỏng vấn
- `interviewed` - Đã phỏng vấn
- `offered` - Đã offer
- `accepted` - Đã chấp nhận
- `rejected` - Bị từ chối
- `withdrawn` - Rút đơn

**Constraint:** UNIQUE(job_id, student_id) - Mỗi sinh viên chỉ ứng tuyển 1 lần cho 1 công việc

#### 5.2. Bảng `application_status_history` - Lịch sử thay đổi trạng thái
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| history_id | SERIAL PK | ID |
| application_id | INTEGER FK | ID đơn |
| old_status | VARCHAR(50) | Trạng thái cũ |
| new_status | VARCHAR(50) | Trạng thái mới |
| changed_by | INTEGER FK | Người thay đổi |
| notes | TEXT | Ghi chú |

---

### **MODULE 6: TÌM KIẾM & GỢI Ý**

#### 6.1. Bảng `search_history` - Lịch sử tìm kiếm
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| search_id | SERIAL PK | ID |
| student_id | INTEGER FK | ID sinh viên |
| search_query | TEXT | Từ khóa tìm kiếm |
| filters | JSONB | Bộ lọc (JSON) |
| results_count | INTEGER | Số kết quả |

#### 6.2. Bảng `saved_searches` - Bộ lọc đã lưu
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| saved_search_id | SERIAL PK | ID |
| student_id | INTEGER FK | ID sinh viên |
| search_name | VARCHAR(255) | Tên bộ lọc |
| search_query | TEXT | Query |
| filters | JSONB | Bộ lọc (JSON) |
| is_alert_enabled | BOOLEAN | Bật thông báo |

#### 6.3. Bảng `saved_jobs` - Công việc đã lưu (Bookmark)
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| saved_job_id | SERIAL PK | ID |
| student_id | INTEGER FK | ID sinh viên |
| job_id | INTEGER FK | ID công việc |
| notes | TEXT | Ghi chú cá nhân |

**Constraint:** UNIQUE(student_id, job_id)

#### 6.4. Bảng `job_views` - Lượt xem công việc
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| view_id | SERIAL PK | ID |
| job_id | INTEGER FK | ID công việc |
| student_id | INTEGER FK | ID sinh viên (nullable) |
| ip_address | VARCHAR(45) | IP người xem |
| user_agent | TEXT | User Agent |
| viewed_at | TIMESTAMP | Thời gian xem |

---

### **MODULE 7: THÔNG BÁO**

#### 7.1. Bảng `notifications` - Thông báo
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| notification_id | SERIAL PK | ID |
| user_id | INTEGER FK | ID người nhận |
| type | VARCHAR(50) | Loại thông báo |
| title | VARCHAR(255) | Tiêu đề |
| message | TEXT | Nội dung |
| link | VARCHAR(500) | Link liên quan |
| is_read | BOOLEAN | Đã đọc |

**Các loại thông báo:**
- `job_match` - Có việc phù hợp
- `application_update` - Cập nhật đơn ứng tuyển
- `new_applicant` - Có ứng viên mới
- `system` - Thông báo hệ thống

---

### **MODULE 8: HỆ THỐNG**

#### 8.1. Bảng `system_settings` - Cấu hình hệ thống
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| setting_id | SERIAL PK | ID |
| setting_key | VARCHAR(100) UNIQUE | Key |
| setting_value | TEXT | Giá trị |
| description | TEXT | Mô tả |

**Cấu hình mặc định:**
- `job_posting_approval_required` = true
- `job_posting_default_duration_days` = 30
- `max_applications_per_student` = 20
- `min_gpa_required` = 2.0
- `enable_email_notifications` = true
- `enable_ai_matching` = true

#### 8.2. Bảng `reports` - Báo cáo vi phạm
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| report_id | SERIAL PK | ID |
| reporter_id | INTEGER FK | Người báo cáo |
| reported_type | VARCHAR(50) | Loại (job/company/user) |
| reported_id | INTEGER | ID đối tượng |
| reason | VARCHAR(255) | Lý do |
| status | VARCHAR(50) | Trạng thái |
| resolved_by | INTEGER FK | Người xử lý |

#### 8.3. Bảng `blacklist` - Danh sách cấm
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| blacklist_id | SERIAL PK | ID |
| entity_type | VARCHAR(50) | Loại (company/user/email_domain) |
| entity_id | INTEGER | ID đối tượng |
| reason | TEXT | Lý do |
| added_by | INTEGER FK | Người thêm |
| expires_at | TIMESTAMP | Hết hạn |

#### 8.4. Bảng `daily_statistics` - Thống kê hàng ngày
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| stat_id | SERIAL PK | ID |
| stat_date | DATE UNIQUE | Ngày |
| new_jobs | INTEGER | Tin mới |
| new_applications | INTEGER | Đơn mới |
| new_companies | INTEGER | DN mới |
| new_students | INTEGER | SV mới |
| total_job_views | INTEGER | Tổng lượt xem |

---

### **MODULE 9: NỘI DUNG**

#### 9.1. Bảng `blog_posts` - Bài viết blog
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| post_id | SERIAL PK | ID |
| author_id | INTEGER FK | Tác giả |
| title | VARCHAR(255) | Tiêu đề |
| slug | VARCHAR(255) UNIQUE | Slug URL |
| content | TEXT | Nội dung |
| featured_image | VARCHAR(500) | Ảnh nổi bật |
| category | VARCHAR(100) | Danh mục |
| status | VARCHAR(20) | Trạng thái (draft/published/archived) |
| view_count | INTEGER | Lượt xem |
| published_at | TIMESTAMP | Ngày xuất bản |

#### 9.2. Bảng `faqs` - Câu hỏi thường gặp
| Cột | Kiểu | Mô tả |
|-----|------|-------|
| faq_id | SERIAL PK | ID |
| question | TEXT | Câu hỏi |
| answer | TEXT | Câu trả lời |
| category | VARCHAR(100) | Danh mục (student/company/general) |
| display_order | INTEGER | Thứ tự hiển thị |
| is_active | BOOLEAN | Active |

---

## 🔗 QUAN HỆ CHÍNH

### Quan hệ One-to-One (1-1)
- `users` ↔ `companies` (user_id)
- `users` ↔ `students` (user_id)

### Quan hệ One-to-Many (1-N)
- `roles` → `users` (1 role có nhiều users)
- `companies` → `job_postings` (1 công ty có nhiều tin)
- `students` → `applications` (1 sinh viên có nhiều đơn)
- `job_postings` → `applications` (1 tin có nhiều đơn)
- `majors` → `students` (1 ngành có nhiều sinh viên)

### Quan hệ Many-to-Many (N-N)
- `students` ↔ `skills` (qua `student_skills`)
- `job_postings` ↔ `skills` (qua `job_required_skills`)
- `job_postings` ↔ `majors` (qua `job_suitable_majors`)
- `students` ↔ `job_postings` (qua `saved_jobs`)

---

## ⚡ TRIGGERS & FUNCTIONS

### 1. Auto Update Timestamp
```sql
update_updated_at_column()
```
Tự động cập nhật `updated_at` khi record được update.

**Áp dụng cho:**
- users, companies, students, job_postings, applications

### 2. Auto Increment View Count
```sql
increment_job_view_count()
```
Tự động tăng `view_count` khi có record mới trong `job_views`.

### 3. Auto Increment Application Count
```sql
increment_application_count()
```
Tự động tăng `application_count` khi có đơn ứng tuyển mới.

### 4. Log Status Change
```sql
log_application_status_change()
```
Tự động ghi lịch sử khi trạng thái đơn ứng tuyển thay đổi.

---

## 🔍 INDEXES

### Full-text Search
```sql
-- Tìm kiếm công việc
idx_jobs_fulltext ON job_postings (job_title, job_description)

-- Tìm kiếm công ty
idx_companies_fulltext ON companies (company_name, description)
```

### Performance Indexes
```sql
-- Users
idx_users_email, idx_users_role

-- Companies
idx_companies_city, idx_companies_is_verified

-- Students
idx_students_major, idx_students_graduation_year

-- Jobs
idx_jobs_company, idx_jobs_status, idx_jobs_deadline, idx_jobs_city, idx_jobs_featured

-- Applications
idx_applications_job, idx_applications_student, idx_applications_status

-- Skills
idx_student_skills_student, idx_job_skills_job
```

---

## 📊 VIEWS

### 1. company_statistics
Thống kê tổng quan về công ty:
- Tổng số tin đăng
- Số tin đang active
- Tổng đơn ứng tuyển
- Đánh giá trung bình

### 2. student_statistics
Thống kê về sinh viên:
- Tổng số đơn đã nộp
- Số lần được mời phỏng vấn
- Số lần nhận offer
- Số công việc đã lưu
- Số kỹ năng

### 3. popular_jobs
Danh sách công việc phổ biến dựa trên:
- Lượt xem
- Số đơn ứng tuyển

---

## 🎨 LUỒNG DỮ LIỆU CHÍNH

### LUỒNG 1: Đăng ký & Đăng nhập
```
User Registration
→ Insert into users (email, password_hash, role_id)
→ IF role = 'company': Insert into companies
→ IF role = 'student': Insert into students
→ Send verification email
→ Update is_verified = TRUE
```

### LUỒNG 2: Đăng tin tuyển dụng (Company)
```
Company creates job posting
→ Insert into job_postings (status = 'pending')
→ Insert into job_required_skills (kỹ năng yêu cầu)
→ Insert into job_suitable_majors (ngành phù hợp)
→ Admin reviews (status = 'approved' hoặc 'rejected')
→ IF approved: Visible to students
→ Send notifications to matched students
```

### LUỒNG 3: Ứng tuyển (Student)
```
Student views job
→ Insert into job_views
→ Trigger: Auto increment view_count in job_postings

Student applies
→ Insert into applications (status = 'submitted')
→ Trigger: Auto increment application_count in job_postings
→ Send notification to company
→ Company updates status (viewed/shortlisted/interviewed/offered/rejected)
→ Trigger: Log status change in application_status_history
→ Send notification to student
```

### LUỒNG 4: AI Matching
```
New job posted (approved)
→ Query students with matching:
   - skills (from job_required_skills)
   - majors (from job_suitable_majors)
   - desired_position
   - work_type
   - location preferences
→ Calculate match score
→ Insert notifications for top matches
→ Optional: Send email alerts
```

### LUỒNG 5: Search & Filter
```
Student searches
→ Insert into search_history
→ Query job_postings with filters:
   - Full-text search (job_title, job_description)
   - Category filter
   - Location filter
   - Salary range
   - Employment type
   - Skills required
→ Order by relevance + created_at DESC
→ Track views in job_views
```

---

## 🛡️ BẢO MẬT & TỐI ƯU

### Security Best Practices
1. **Password:** Always hash với bcrypt (cost factor ≥ 10)
2. **SQL Injection:** Sử dụng prepared statements/parameterized queries
3. **XSS:** Sanitize user input trước khi lưu
4. **CSRF:** Implement CSRF tokens
5. **Rate Limiting:** Giới hạn số request/IP/user
6. **Email Verification:** Required trước khi active account
7. **2FA:** Optional cho admin accounts

### Performance Optimization
1. **Connection Pooling:** Min 10, Max 100 connections
2. **Query Optimization:** Luôn có WHERE clause trên indexed columns
3. **Pagination:** Limit 20-50 records/page
4. **Caching:** Redis cho:
   - Session data
   - Popular job listings
   - Search results
5. **Background Jobs:** Queue cho:
   - Email sending
   - AI matching
   - Statistics calculation
   - Notification dispatch

### Backup Strategy
1. **Full backup:** Hàng ngày lúc 2:00 AM
2. **Incremental backup:** Mỗi 6 giờ
3. **Retention:** 30 ngày
4. **Off-site backup:** S3/Cloud Storage

---

## 📈 MONITORING

### Metrics cần theo dõi
1. **Database:**
   - Query performance (slow queries > 1s)
   - Connection pool usage
   - Disk I/O
   - Lock conflicts

2. **Application:**
   - Daily active users
   - New job postings/day
   - Application conversion rate
   - Average response time

3. **Business:**
   - Jobs per company
   - Applications per student
   - Time to hire
   - Match accuracy rate

---

## 🚀 TÍNH NĂNG NỔI BẬT

### 1. Smart Matching Algorithm
```sql
-- Pseudo-code cho AI matching
FUNCTION match_students_to_job(job_id):
    GET job details, required_skills, suitable_majors
    
    QUERY students WHERE:
        - major_id IN suitable_majors
        - is_open_to_work = TRUE
        - student_skills OVERLAPS job_required_skills
        - desired_position LIKE job_title
        - desired_location MATCH work_location
    
    FOR EACH student:
        score = 0
        score += skill_match_percentage * 40
        score += gpa_normalized * 20
        score += location_match * 15
        score += work_type_match * 15
        score += experience_match * 10
        
    RETURN students ORDER BY score DESC LIMIT 20
```

### 2. Advanced Search với Full-text
```sql
SELECT * FROM job_postings
WHERE to_tsvector('english', job_title || ' ' || job_description) 
      @@ to_tsquery('english', 'backend & nodejs')
  AND status = 'approved'
  AND application_deadline >= CURRENT_DATE
ORDER BY 
    ts_rank(to_tsvector('english', job_title || ' ' || job_description), 
            to_tsquery('english', 'backend & nodejs')) DESC,
    created_at DESC;
```

### 3. Real-time Notifications
- WebSocket cho real-time updates
- Email notifications cho critical events
- In-app notifications với badge count
- Push notifications (mobile app)

### 4. Analytics Dashboard
- **Admin:** Overview toàn hệ thống
- **Company:** Job performance, applicant funnel
- **Student:** Profile views, application success rate

---

## 📝 SAMPLE QUERIES

### Query 1: Top công ty có nhiều tin tuyển dụng nhất
```sql
SELECT 
    c.company_name,
    COUNT(jp.job_id) as total_jobs,
    AVG(jp.application_count) as avg_applications_per_job,
    c.rating
FROM companies c
JOIN job_postings jp ON c.company_id = jp.company_id
WHERE jp.status = 'approved'
GROUP BY c.company_id
ORDER BY total_jobs DESC
LIMIT 10;
```

### Query 2: Sinh viên có profile "hot" nhất
```sql
SELECT 
    s.full_name,
    s.student_code,
    m.major_name,
    s.gpa,
    COUNT(DISTINCT ss.skill_id) as total_skills,
    COUNT(DISTINCT a.application_id) as total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'interview_scheduled' THEN a.application_id END) as interviews
FROM students s
JOIN majors m ON s.major_id = m.major_id
LEFT JOIN student_skills ss ON s.student_id = ss.student_id
LEFT JOIN applications a ON s.student_id = a.student_id
WHERE s.is_open_to_work = TRUE
GROUP BY s.student_id, m.major_name
HAVING s.gpa >= 3.0 AND COUNT(DISTINCT ss.skill_id) >= 5
ORDER BY interviews DESC, total_skills DESC
LIMIT 20;
```

### Query 3: Công việc matching với sinh viên cụ thể
```sql
WITH student_skill_ids AS (
    SELECT skill_id FROM student_skills WHERE student_id = :student_id
),
matching_jobs AS (
    SELECT 
        jp.job_id,
        jp.job_title,
        c.company_name,
        COUNT(DISTINCT jrs.skill_id) as matched_skills,
        (SELECT COUNT(*) FROM job_required_skills WHERE job_id = jp.job_id) as total_required_skills
    FROM job_postings jp
    JOIN companies c ON jp.company_id = c.company_id
    JOIN job_required_skills jrs ON jp.job_id = jrs.job_id
    WHERE jp.status = 'approved'
      AND jp.application_deadline >= CURRENT_DATE
      AND jrs.skill_id IN (SELECT skill_id FROM student_skill_ids)
    GROUP BY jp.job_id, c.company_name
)
SELECT 
    *,
    ROUND((matched_skills::DECIMAL / NULLIF(total_required_skills, 0)) * 100, 2) as match_percentage
FROM matching_jobs
WHERE match_percentage >= 50
ORDER BY match_percentage DESC, created_at DESC;
```

### Query 4: Thống kê xu hướng tuyển dụng theo tháng
```sql
SELECT 
    DATE_TRUNC('month', created_at) as month,
    jc.category_name,
    COUNT(*) as job_count,
    AVG(salary_max) as avg_max_salary,
    COUNT(DISTINCT company_id) as companies_hiring
FROM job_postings jp
JOIN job_categories jc ON jp.category_id = jc.category_id
WHERE status = 'approved'
  AND created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at), jc.category_name
ORDER BY month DESC, job_count DESC;
```

### Query 5: Kỹ năng hot nhất
```sql
SELECT 
    s.skill_name,
    s.skill_category,
    COUNT(DISTINCT jrs.job_id) as jobs_requiring,
    COUNT(DISTINCT ss.student_id) as students_having,
    ROUND(COUNT(DISTINCT jrs.job_id)::DECIMAL / NULLIF(COUNT(DISTINCT ss.student_id), 0), 2) as demand_supply_ratio
FROM skills s
LEFT JOIN job_required_skills jrs ON s.skill_id = jrs.skill_id
LEFT JOIN student_skills ss ON s.skill_id = ss.skill_id
WHERE s.skill_category IN ('programming', 'tool', 'design')
GROUP BY s.skill_id
HAVING COUNT(DISTINCT jrs.job_id) > 0
ORDER BY demand_supply_ratio DESC, jobs_requiring DESC
LIMIT 20;
```

---

## 🎓 HƯỚNG DẪN SỬ DỤNG

### Setup Database
```bash
# 1. Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# 2. Create database
createdb recruitment_db

# 3. Run schema
psql recruitment_db < recruitment_database.sql

# 4. Verify
psql recruitment_db -c "\dt"
```

### Connection String
```
postgresql://username:password@localhost:5432/recruitment_db?sslmode=require
```

### Environment Variables
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recruitment_db
DB_USER=your_username
DB_PASSWORD=your_password
DB_POOL_MIN=10
DB_POOL_MAX=100
```

---

## 📚 TÀI LIỆU THAM KHẢO

1. PostgreSQL Documentation: https://www.postgresql.org/docs/
2. Database Design Best Practices
3. SQL Performance Tuning
4. Full-text Search in PostgreSQL
5. Database Security Guidelines

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Maintainer:** Khoa Công Nghệ Phần Mềm