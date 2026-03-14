-- =============================================
-- SAMPLE DATA - HỆ THỐNG TUYỂN DỤNG KHOA CNPM
-- Dữ liệu mẫu để test và phát triển
-- =============================================

-- Clear existing data (optional - only for development)
-- TRUNCATE TABLE users, companies, students, job_postings, applications CASCADE;

-- =============================================
-- 1. TẠO USERS MẪU
-- =============================================

-- Password: "password123" - hashed bằng bcrypt
-- $2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK

-- Admin Users
INSERT INTO users (email, password_hash, role_id, is_active, is_verified) VALUES
('admin@cnpm.edu.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 1, true, true),
('admin2@cnpm.edu.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 1, true, true);

-- Company Users
INSERT INTO users (email, password_hash, role_id, is_active, is_verified) VALUES
('hr@fpt.com.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 2, true, true),
('recruit@vingroup.net', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 2, true, true),
('jobs@vng.com.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 2, true, true),
('hr@tiki.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 2, true, true),
('careers@shopee.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 2, true, true),
('talent@momo.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 2, true, true),
('hr@nashtech.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 2, true, true),
('jobs@grab.com', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 2, true, true);

-- Student Users
INSERT INTO users (email, password_hash, role_id, is_active, is_verified) VALUES
('2051012001@student.hcmute.edu.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 3, true, true),
('2051012002@student.hcmute.edu.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 3, true, true),
('2051012003@student.hcmute.edu.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 3, true, true),
('2051022001@student.hcmute.edu.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 3, true, true),
('2051022002@student.hcmute.edu.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 3, true, true),
('2151012001@student.hcmute.edu.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 3, true, true),
('2151012002@student.hcmute.edu.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 3, true, true),
('2151022001@student.hcmute.edu.vn', '$2b$10$rjZkxKlHd6vF3pM9j4Dqh.5HLQKQhxF5zYL8K0E8JvC8zZvKdGWWK', 3, true, true);

-- =============================================
-- 2. TẠO COMPANIES MẪU
-- =============================================

INSERT INTO companies (user_id, company_name, tax_code, industry, company_size, website, logo_url, description, address, city, district, phone, contact_person, contact_email, is_verified, is_partner, rating) VALUES
(3, 'FPT Software', '0300456967', 'Information Technology', '500+', 'https://fptsoftware.com', '/logos/fpt.png', 
'FPT Software là công ty phần mềm hàng đầu Việt Nam, cung cấp dịch vụ chuyển đổi số cho khách hàng toàn cầu.', 
'Lô L29B-31B-33B Đường số 02, Phường Tân Thuận Đông, Quận 7', 'Hồ Chí Minh', 'Quận 7', '0282730 7000', 'Nguyễn Văn A', 'hr@fpt.com.vn', true, true, 4.5),

(4, 'VinGroup', '0104831030', 'Conglomerate', '500+', 'https://vingroup.net', '/logos/vingroup.png',
'Tập đoàn VinGroup là tập đoàn kinh tế tư nhân đa ngành lớn nhất Việt Nam.',
'Tầng 45-46 Tòa nhà Landmark 81, 720A Đường Điện Biên Phủ, Phường 22, Quận Bình Thạnh', 'Hồ Chí Minh', 'Bình Thạnh', '1900232389', 'Trần Thị B', 'recruit@vingroup.net', true, true, 4.3),

(5, 'VNG Corporation', '0303675393', 'Internet/Gaming', '201-500', 'https://vng.com.vn', '/logos/vng.png',
'VNG là công ty Internet và Công nghệ hàng đầu tại Việt Nam, sở hữu các sản phẩm như Zalo, ZaloPay.',
'Lầu Z, Tòa nhà Sohude, 234 Cộng Hòa, Phường 12, Quận Tân Bình', 'Hồ Chí Minh', 'Tân Bình', '1900561854', 'Lê Văn C', 'jobs@vng.com.vn', true, true, 4.7),

(6, 'Tiki Corporation', '0312120027', 'E-commerce', '201-500', 'https://tiki.vn', '/logos/tiki.png',
'Tiki là công ty thương mại điện tử hàng đầu Việt Nam.',
'Tòa nhà Rivera Park, 7/28 Thành Thái, Phường 14, Quận 10', 'Hồ Chí Minh', 'Quận 10', '1900 6035', 'Phạm Thị D', 'hr@tiki.vn', true, true, 4.2),

(7, 'Shopee Vietnam', '0313728397', 'E-commerce', '500+', 'https://careers.shopee.vn', '/logos/shopee.png',
'Shopee là nền tảng thương mại điện tử hàng đầu Đông Nam Á và Đài Loan.',
'Tầng 4-5-6, Tòa nhà Capital Place, 29 Liễu Giai, Ba Đình', 'Hà Nội', 'Ba Đình', '19006035', 'Hoàng Văn E', 'careers@shopee.vn', true, true, 4.4),

(8, 'MoMo', '0313018586', 'Fintech', '201-500', 'https://momo.vn', '/logos/momo.png',
'MoMo là ví điện tử và nền tảng thanh toán hàng đầu Việt Nam.',
'Lầu 6, Tòa nhà Phú Mỹ Hưng, 8 Hoàng Văn Thái, Phường Tân Phú, Quận 7', 'Hồ Chí Minh', 'Quận 7', '1900545486', 'Vũ Thị F', 'talent@momo.vn', true, false, 4.6),

(9, 'NashTech Vietnam', '0314504838', 'Software Development', '201-500', 'https://nashtechglobal.com', '/logos/nashtech.png',
'NashTech là công ty phát triển phần mềm toàn cầu có văn phòng tại Việt Nam.',
'Tầng 10, Tòa nhà Viettel Complex, 285 Cách Mạng Tháng 8, Phường 12, Quận 10', 'Hồ Chí Minh', 'Quận 10', '02873036999', 'Ngô Văn G', 'hr@nashtech.vn', true, false, 4.1),

(10, 'Grab Vietnam', '0312652946', 'Technology/Transportation', '201-500', 'https://grab.careers', '/logos/grab.png',
'Grab là siêu ứng dụng hàng đầu Đông Nam Á cung cấp dịch vụ giao thông, giao đồ ăn và thanh toán.',
'Tầng 10-11, Tòa nhà Flemington, 182 Lê Đại Hành, Phường 15, Quận 11', 'Hồ Chí Minh', 'Quận 11', '1900545459', 'Đặng Thị H', 'jobs@grab.com', true, true, 4.5);

-- =============================================
-- 3. TẠO STUDENTS MẪU
-- =============================================

-- Sinh viên ngành Kỹ Thuật Phần Mềm
INSERT INTO students (user_id, student_code, full_name, date_of_birth, gender, phone, major_id, enrollment_year, expected_graduation_year, current_year, gpa, bio, desired_position, desired_salary_min, desired_salary_max, work_type, is_open_to_work) VALUES
(11, '2051012001', 'Nguyễn Văn An', '2002-05-15', 'male', '0901234567', 1, 2020, 2024, 4, 3.45, 
'Sinh viên năm 4 ngành Kỹ thuật phần mềm, đam mê phát triển web và mobile. Có kinh nghiệm làm việc với React, Node.js.',
'Backend Developer', 10000000, 15000000, 'full-time', true),

(12, '2051012002', 'Trần Thị Bình', '2002-08-20', 'female', '0902345678', 1, 2020, 2024, 4, 3.72,
'Passionate about UI/UX design and frontend development. Experienced with React, Vue.js, and modern CSS frameworks.',
'Frontend Developer', 12000000, 18000000, 'full-time', true),

(13, '2051012003', 'Lê Hoàng Cường', '2002-03-10', 'male', '0903456789', 1, 2020, 2024, 4, 3.28,
'Full-stack developer với kinh nghiệm về MERN stack. Đã tham gia 2 dự án freelance.',
'Full Stack Developer', 15000000, 20000000, 'full-time', true),

(16, '2151012001', 'Phạm Minh Đức', '2003-11-05', 'male', '0906789012', 1, 2021, 2025, 3, 3.55,
'Sinh viên năm 3 quan tâm đến AI/ML và Data Science. Thành thạo Python, TensorFlow.',
'AI/ML Intern', 5000000, 8000000, 'internship', true),

(17, '2151012002', 'Vũ Thị Em', '2003-07-18', 'female', '0907890123', 1, 2021, 2025, 3, 3.65,
'Interested in mobile app development. Working with Flutter and React Native.',
'Mobile Developer', 10000000, 15000000, 'full-time', true);

-- Sinh viên ngành Truyền Thông Đa Phương Tiện
INSERT INTO students (user_id, student_code, full_name, date_of_birth, gender, phone, major_id, enrollment_year, expected_graduation_year, current_year, gpa, bio, desired_position, desired_salary_min, desired_salary_max, work_type, is_open_to_work) VALUES
(14, '2051022001', 'Hoàng Minh Giang', '2002-12-25', 'female', '0904567890', 2, 2020, 2024, 4, 3.58,
'Creative designer với kỹ năng về UI/UX, graphic design. Thành thạo Figma, Photoshop, Illustrator.',
'UI/UX Designer', 12000000, 18000000, 'full-time', true),

(15, '2051022002', 'Đỗ Văn Hùng', '2002-09-30', 'male', '0905678901', 2, 2020, 2024, 4, 3.42,
'Video editor and motion graphics artist. Experienced with Adobe Premiere Pro, After Effects.',
'Video Editor', 10000000, 15000000, 'full-time', true),

(18, '2151022001', 'Bùi Thị Lan', '2003-04-12', 'female', '0908901234', 2, 2021, 2025, 3, 3.70,
'3D artist passionate about game development and animation. Proficient in Blender and Unity.',
'3D Artist', 8000000, 12000000, 'internship', true);

-- =============================================
-- 4. TẠO KỸ NĂNG CHO SINH VIÊN
-- =============================================

-- Sinh viên Nguyễn Văn An (Backend)
INSERT INTO student_skills (student_id, skill_id, proficiency_level, years_of_experience) VALUES
(1, 1, 'advanced', 2), -- JavaScript
(1, 3, 'intermediate', 1), -- Python
(1, 10, 'advanced', 2), -- Node.js
(1, 11, 'advanced', 2), -- Express.js
(1, 15, 'intermediate', 1), -- MySQL
(1, 16, 'intermediate', 1), -- PostgreSQL
(1, 17, 'beginner', 1), -- MongoDB
(1, 25, 'intermediate', 2); -- Git

-- Sinh viên Trần Thị Bình (Frontend)
INSERT INTO student_skills (student_id, skill_id, proficiency_level, years_of_experience) VALUES
(2, 1, 'expert', 3), -- JavaScript
(2, 2, 'advanced', 2), -- TypeScript
(2, 7, 'expert', 3), -- React
(2, 8, 'intermediate', 1), -- Vue.js
(2, 10, 'intermediate', 1), -- HTML/CSS
(2, 11, 'advanced', 2), -- Tailwind CSS
(2, 19, 'advanced', 2), -- Figma
(2, 25, 'advanced', 2); -- Git

-- Sinh viên Lê Hoàng Cường (Full Stack)
INSERT INTO student_skills (student_id, skill_id, proficiency_level, years_of_experience) VALUES
(3, 1, 'advanced', 2),
(3, 2, 'intermediate', 1),
(3, 7, 'advanced', 2),
(3, 10, 'advanced', 2),
(3, 11, 'intermediate', 1),
(3, 15, 'intermediate', 1),
(3, 17, 'advanced', 2),
(3, 25, 'advanced', 2);

-- Sinh viên Hoàng Minh Giang (UI/UX Designer)
INSERT INTO student_skills (student_id, skill_id, proficiency_level, years_of_experience) VALUES
(4, 19, 'expert', 3), -- Figma
(4, 20, 'advanced', 2), -- Photoshop
(4, 21, 'advanced', 2), -- Illustrator
(4, 22, 'intermediate', 1), -- Adobe XD
(4, 10, 'intermediate', 2), -- HTML/CSS
(4, 34, 'advanced', 2); -- Communication

-- Sinh viên Đỗ Văn Hùng (Video Editor)
INSERT INTO student_skills (student_id, skill_id, proficiency_level, years_of_experience) VALUES
(5, 24, 'expert', 3), -- Premiere Pro
(5, 25, 'advanced', 2), -- After Effects
(5, 20, 'intermediate', 2), -- Photoshop
(5, 34, 'advanced', 2), -- Communication
(5, 37, 'advanced', 2); -- Presentation

-- =============================================
-- 5. TẠO JOB POSTINGS MẪU
-- =============================================

-- FPT Software - Backend Developer
INSERT INTO job_postings (company_id, category_id, job_title, job_description, requirements, benefits, employment_type, experience_level, position_level, number_of_positions, salary_min, salary_max, salary_type, work_location, city, is_remote, application_deadline, status, is_featured, view_count, application_count) VALUES
(1, 1, 'Backend Developer (Node.js)', 
'Chúng tôi đang tìm kiếm Backend Developer có kinh nghiệm với Node.js để tham gia vào các dự án phát triển hệ thống lớn cho khách hàng quốc tế.',
'- Tốt nghiệp Đại học chuyên ngành CNTT hoặc liên quan
- Có kinh nghiệm 1-2 năm với Node.js, Express.js
- Thành thạo SQL (PostgreSQL, MySQL) và NoSQL (MongoDB)
- Hiểu biết về RESTful APIs, Microservices
- Kỹ năng làm việc nhóm tốt',
'- Lương: 15-25 triệu VNĐ + thưởng theo dự án
- Đào tạo kỹ năng chuyên môn liên tục
- Bảo hiểm sức khỏe cao cấp
- Du lịch công ty hàng năm
- Môi trường làm việc năng động, chuyên nghiệp',
'full-time', 'junior', 'staff', 3, 15000000, 25000000, 'monthly', 'Quận 7, TP.HCM', 'Hồ Chí Minh', false, '2026-02-28', 'approved', true, 125, 8),

-- VNG - Frontend Developer
(2, 2, 'Frontend Developer (React)',
'VNG đang tìm kiếm Frontend Developer tài năng để phát triển các sản phẩm web hiện đại.',
'- Tốt nghiệp hoặc sắp tốt nghiệp chuyên ngành CNTT
- Thành thạo React.js, JavaScript/TypeScript
- Kinh nghiệm với HTML5, CSS3, responsive design
- Hiểu biết về Redux, React Hooks
- Có tinh thần học hỏi, sáng tạo',
'- Lương cạnh tranh: 18-30 triệu VNĐ
- Thưởng hiệu suất hấp dẫn
- Laptop và thiết bị làm việc cao cấp
- Team building định kỳ
- Cơ hội thăng tiến rõ ràng',
'full-time', 'junior', 'staff', 2, 18000000, 30000000, 'monthly', 'Quận Tân Bình, TP.HCM', 'Hồ Chí Minh', false, '2026-03-15', 'approved', true, 98, 12),

-- Tiki - Mobile Developer
(3, 3, 'Mobile Developer (Flutter)',
'Tiki cần Mobile Developer để xây dựng và phát triển ứng dụng mobile cho hệ sinh thái Tiki.',
'- Am hiểu về Flutter/Dart
- Có kinh nghiệm phát triển app iOS/Android
- Hiểu biết về RESTful APIs
- Kỹ năng debug và tối ưu performance
- Có kinh nghiệm làm việc với Git',
'- Lương: 15-25 triệu VNĐ
- Làm việc trong môi trường startup năng động
- Cơ hội học hỏi công nghệ mới
- Flexible working time
- Happy hour thứ 6 hàng tuần',
'full-time', 'entry', 'staff', 2, 15000000, 25000000, 'monthly', 'Quận 10, TP.HCM', 'Hồ Chí Minh', true, '2026-03-31', 'approved', false, 76, 5),

-- Shopee - UI/UX Designer
(4, 5, 'UI/UX Designer',
'Shopee đang tìm kiếm UI/UX Designer sáng tạo để thiết kế trải nghiệm người dùng tuyệt vời.',
'- Tốt nghiệp chuyên ngành Design, Multimedia
- Thành thạo Figma, Adobe XD, Sketch
- Có portfolio thể hiện các dự án đã thực hiện
- Hiểu biết về UI/UX principles, Design Thinking
- Khả năng làm việc nhóm tốt',
'- Lương: 12-20 triệu VNĐ
- Môi trường sáng tạo
- Đào tạo design skills chuyên sâu
- Được làm việc với các designer quốc tế
- Công ty đa quốc gia',
'full-time', 'junior', 'staff', 1, 12000000, 20000000, 'monthly', 'Ba Đình, Hà Nội', 'Hà Nội', false, '2026-03-20', 'approved', true, 134, 15),

-- MoMo - Full Stack Developer
(5, 4, 'Full Stack Developer (MERN Stack)',
'MoMo tìm kiếm Full Stack Developer để phát triển các tính năng mới cho ví điện tử.',
'- Kinh nghiệm với MongoDB, Express.js, React, Node.js
- Hiểu biết về microservices architecture
- Có kiến thức về payment gateway
- Kỹ năng giải quyết vấn đề tốt
- Tiếng Anh giao tiếp',
'- Lương: 20-35 triệu VNĐ
- Cơ hội làm việc với fintech hàng đầu VN
- Stock options
- Bảo hiểm sức khỏe gia đình
- Teambuilding quốc tế',
'full-time', 'mid', 'staff', 2, 20000000, 35000000, 'monthly', 'Quận 7, TP.HCM', 'Hồ Chí Minh', false, '2026-04-10', 'approved', true, 89, 7),

-- NashTech - Internship Backend
(6, 1, 'Backend Developer Intern',
'NashTech cung cấp chương trình thực tập 6 tháng cho sinh viên năm cuối ngành CNPM.',
'- Đang là sinh viên năm 3, 4 ngành CNTT
- Có kiến thức về Java hoặc Node.js
- Hiểu biết cơ bản về database
- Ham học hỏi, nhiệt huyết
- Có thể làm full-time trong 6 tháng',
'- Lương: 5-8 triệu VNĐ/tháng
- Mentor 1-1
- Đào tạo kỹ năng chuyên môn
- Cơ hội được nhận việc full-time sau thực tập
- Chứng chỉ hoàn thành chương trình',
'internship', 'entry', 'staff', 5, 5000000, 8000000, 'monthly', 'Quận 10, TP.HCM', 'Hồ Chí Minh', false, '2026-02-28', 'approved', false, 210, 28),

-- Grab - Data Analyst
(7, 8, 'Data Analyst (Fresher)',
'Grab đang mở vị trí Data Analyst cho sinh viên mới tốt nghiệp.',
'- Tốt nghiệp ngành CNTT, Toán, Thống kê
- Có kiến thức về Python, SQL
- Hiểu biết cơ bản về data visualization (Tableau, PowerBI)
- Tư duy logic tốt
- Tiếng Anh tốt',
'- Lương: 12-18 triệu VNĐ
- Làm việc với big data
- Đào tạo chuyên sâu về analytics
- Môi trường đa quốc gia
- Các chế độ phúc lợi hấp dẫn',
'full-time', 'entry', 'staff', 2, 12000000, 18000000, 'monthly', 'Quận 11, TP.HCM', 'Hồ Chí Minh', false, '2026-03-25', 'approved', false, 67, 4),

-- VNG - Game Developer
(2, 6, 'Unity Game Developer',
'VNG tìm kiếm Game Developer có đam mê với game development.',
'- Có kinh nghiệm với Unity Engine
- Thành thạo C#
- Hiểu biết về game mechanics, physics
- Có portfolio game projects
- Yêu thích chơi game',
'- Lương: 15-28 triệu VNĐ
- Làm việc với các game nổi tiếng
- Môi trường sáng tạo
- Được chơi game trong giờ làm việc (nghiên cứu)
- Game allowance hàng tháng',
'full-time', 'junior', 'staff', 1, 15000000, 28000000, 'monthly', 'Quận Tân Bình, TP.HCM', 'Hồ Chí Minh', false, '2026-04-05', 'approved', true, 156, 11),

-- FPT - DevOps Engineer
(1, 7, 'DevOps Engineer (Junior)',
'FPT Software tìm kiếm DevOps Engineer để xây dựng và duy trì hạ tầng cloud.',
'- Có kiến thức về Linux, Docker, Kubernetes
- Hiểu biết về CI/CD pipeline
- Kinh nghiệm với AWS hoặc Azure
- Có khả năng scripting (Bash, Python)
- Tinh thần trách nhiệm cao',
'- Lương: 18-30 triệu VNĐ
- Đào tạo cloud certification (AWS, Azure)
- Làm việc với công nghệ hiện đại
- International exposure
- Clear career path',
'full-time', 'junior', 'staff', 2, 18000000, 30000000, 'monthly', 'Quận 7, TP.HCM', 'Hồ Chí Minh', false, '2026-04-15', 'approved', false, 45, 3),

-- Shopee - QA Tester
(4, 9, 'QA Tester (Manual & Automation)',
'Shopee cần QA Tester để đảm bảo chất lượng sản phẩm.',
'- Tốt nghiệp ngành CNTT
- Có kiến thức về software testing
- Biết viết test case, test plan
- Có kinh nghiệm với automation testing là một lợi thế (Selenium, Appium)
- Tỉ mỉ, cẩn thận',
'- Lương: 10-15 triệu VNĐ
- Đào tạo testing methodology
- Cơ hội học automation testing
- Làm việc với đội ngũ quốc tế
- Career growth opportunities',
'full-time', 'entry', 'staff', 3, 10000000, 15000000, 'monthly', 'Ba Đình, Hà Nội', 'Hà Nội', true, '2026-03-30', 'approved', false, 82, 9);

-- =============================================
-- 6. LINK KỸ NĂNG YÊU CẦU VỚI JOB POSTINGS
-- =============================================

-- Backend Developer (Node.js) - FPT
INSERT INTO job_required_skills (job_id, skill_id, is_required, proficiency_level) VALUES
(1, 1, true, 'advanced'), -- JavaScript
(1, 10, true, 'advanced'), -- Node.js
(1, 11, true, 'intermediate'), -- Express.js
(1, 15, true, 'intermediate'), -- MySQL
(1, 16, false, 'beginner'), -- PostgreSQL
(1, 17, false, 'beginner'), -- MongoDB
(1, 25, true, 'intermediate'); -- Git

-- Frontend Developer (React) - VNG
INSERT INTO job_required_skills (job_id, skill_id, is_required, proficiency_level) VALUES
(2, 1, true, 'advanced'), -- JavaScript
(2, 2, false, 'intermediate'), -- TypeScript
(2, 7, true, 'advanced'), -- React
(2, 10, true, 'intermediate'), -- HTML/CSS
(2, 11, false, 'intermediate'), -- Tailwind CSS
(2, 25, true, 'intermediate'); -- Git

-- Mobile Developer (Flutter) - Tiki
INSERT INTO job_required_skills (job_id, skill_id, is_required, proficiency_level) VALUES
(3, 9, true, 'intermediate'), -- Dart
(3, 14, true, 'advanced'), -- Flutter
(3, 25, true, 'intermediate'); -- Git

-- UI/UX Designer - Shopee
INSERT INTO job_required_skills (job_id, skill_id, is_required, proficiency_level) VALUES
(4, 19, true, 'advanced'), -- Figma
(4, 20, false, 'intermediate'), -- Photoshop
(4, 21, false, 'intermediate'), -- Illustrator
(4, 22, false, 'intermediate'); -- Adobe XD

-- Full Stack Developer (MERN) - MoMo
INSERT INTO job_required_skills (job_id, skill_id, is_required, proficiency_level) VALUES
(5, 1, true, 'advanced'), -- JavaScript
(5, 7, true, 'advanced'), -- React
(5, 10, true, 'advanced'), -- Node.js
(5, 11, true, 'intermediate'), -- Express.js
(5, 17, true, 'intermediate'); -- MongoDB

-- =============================================
-- 7. LINK NGÀNH HỌC PHÙ HỢP VỚI JOB POSTINGS
-- =============================================

-- Các công việc IT phù hợp với Kỹ Thuật Phần Mềm
INSERT INTO job_suitable_majors (job_id, major_id) VALUES
(1, 1), -- Backend Developer - SE
(2, 1), -- Frontend Developer - SE
(3, 1), -- Mobile Developer - SE
(5, 1), -- Full Stack Developer - SE
(6, 1), -- Backend Intern - SE
(7, 1), -- Data Analyst - SE
(8, 1), -- Game Developer - SE
(9, 1), -- DevOps Engineer - SE
(10, 1); -- QA Tester - SE

-- UI/UX Designer phù hợp với cả 2 ngành
INSERT INTO job_suitable_majors (job_id, major_id) VALUES
(4, 1), -- UI/UX - SE
(4, 2); -- UI/UX - MM

-- Game Developer phù hợp với cả 2 ngành
INSERT INTO job_suitable_majors (job_id, major_id) VALUES
(8, 2); -- Game Developer - MM

-- =============================================
-- 8. TẠO ỨNG TUYỂN MẪU
-- =============================================

-- Sinh viên 1 ứng tuyển Backend Developer
INSERT INTO applications (job_id, student_id, cv_url, cover_letter, status, viewed_at) VALUES
(1, 1, '/cv/student_2051012001_cv.pdf', 
'Em rất quan tâm đến vị trí Backend Developer tại FPT Software. Em có kinh nghiệm 2 năm làm việc với Node.js và các dự án liên quan đến API development.',
'viewed', NOW() - INTERVAL '2 days'),

-- Sinh viên 1 ứng tuyển Internship
(6, 1, '/cv/student_2051012001_cv.pdf',
'Em mong muốn được thực tập tại NashTech để nâng cao kỹ năng backend development.',
'shortlisted', NOW() - INTERVAL '5 days');

-- Sinh viên 2 ứng tuyển Frontend Developer
INSERT INTO applications (job_id, student_id, cv_url, cover_letter, status, viewed_at, responded_at) VALUES
(2, 2, '/cv/student_2051012002_cv.pdf',
'I am very interested in the Frontend Developer position at VNG. I have 3 years of experience with React and modern web technologies.',
'interview_scheduled', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day');

-- Sinh viên 2 ứng tuyển UI/UX Designer
INSERT INTO applications (job_id, student_id, cv_url, cover_letter, status) VALUES
(4, 2, '/cv/student_2051012002_cv.pdf',
'I am passionate about UI/UX design and would love to contribute to Shopee''s design team.',
'submitted');

-- Sinh viên 3 ứng tuyển Full Stack
INSERT INTO applications (job_id, student_id, cv_url, cover_letter, status, viewed_at) VALUES
(5, 3, '/cv/student_2051012003_cv.pdf',
'Em có kinh nghiệm làm việc với MERN stack và rất hứng thú với fintech.',
'viewed', NOW() - INTERVAL '1 day');

-- Sinh viên 4 (MM) ứng tuyển UI/UX
INSERT INTO applications (job_id, student_id, cv_url, cover_letter, status, interview_date, interview_type) VALUES
(4, 4, '/cv/student_2051022001_cv.pdf',
'Em là sinh viên chuyên ngành Truyền thông đa phương tiện với niềm đam mê thiết kế UI/UX. Em đã thực hiện nhiều dự án thiết kế trong thời gian học.',
'interview_scheduled', NOW() + INTERVAL '3 days', 'online');

-- Sinh viên 5 (MM) ứng tuyển Game Developer
INSERT INTO applications (job_id, student_id, cv_url, cover_letter, status) VALUES
(8, 5, '/cv/student_2051022002_cv.pdf',
'Em rất yêu thích game development và đã tự học Unity trong 2 năm qua.',
'submitted');

-- =============================================
-- 9. TẠO SAVED JOBS
-- =============================================

INSERT INTO saved_jobs (student_id, job_id, notes) VALUES
(1, 2, 'Công ty tốt, position phù hợp'),
(1, 5, 'Lương hấp dẫn, cần chuẩn bị kỹ'),
(2, 1, 'Backup option'),
(2, 5, 'Dream company!'),
(3, 2, 'Cần học thêm React'),
(4, 8, 'Interesting game position');

-- =============================================
-- 10. TẠO NOTIFICATIONS
-- =============================================

INSERT INTO notifications (user_id, type, title, message, link, is_read) VALUES
(11, 'application_update', 'Hồ sơ đã được xem', 'FPT Software đã xem hồ sơ ứng tuyển của bạn cho vị trí Backend Developer', '/applications/1', true),
(11, 'job_match', 'Có công việc phù hợp', 'Có 2 công việc mới phù hợp với profile của bạn', '/jobs?matched=true', false),
(12, 'application_update', 'Mời phỏng vấn', 'VNG mời bạn tham gia phỏng vấn vị trí Frontend Developer', '/applications/3', false),
(3, 'new_applicant', 'Có ứng viên mới', '5 ứng viên mới ứng tuyển vào các tin tuyển dụng của bạn', '/company/applications', false),
(4, 'new_applicant', 'Có ứng viên mới', '3 ứng viên mới ứng tuyển vị trí UI/UX Designer', '/company/applications', false);

-- =============================================
-- 11. TẠO BLOG POSTS
-- =============================================

INSERT INTO blog_posts (author_id, title, slug, content, excerpt, category, status, published_at, view_count) VALUES
(1, '10 Tips để viết CV ấn tượng cho IT Freshers', '10-tips-viet-cv-an-tuong',
'Bài viết chia sẻ 10 tips quan trọng để viết một CV ấn tượng dành cho sinh viên mới tốt nghiệp ngành IT...',
'Hướng dẫn chi tiết cách viết CV chuyên nghiệp cho sinh viên IT',
'career_tips', 'published', NOW() - INTERVAL '7 days', 234),

(1, 'Chuẩn bị gì cho buổi phỏng vấn đầu tiên', 'chuan-bi-phong-van-dau-tien',
'Phỏng vấn là bước quan trọng trong quá trình tìm việc. Bài viết này sẽ giúp bạn chuẩn bị tốt nhất...',
'Checklist đầy đủ để chuẩn bị cho buổi phỏng vấn',
'interview_guide', 'published', NOW() - INTERVAL '14 days', 189),

(1, 'Xu hướng tuyển dụng IT 2026', 'xu-huong-tuyen-dung-it-2026',
'Phân tích xu hướng tuyển dụng trong ngành IT năm 2026 tại Việt Nam...',
'Các kỹ năng hot và mức lương trung bình trong ngành',
'industry_news', 'published', NOW() - INTERVAL '3 days', 567);

-- =============================================
-- 12. TẠO FAQs
-- =============================================

INSERT INTO faqs (question, answer, category, display_order, is_active) VALUES
('Làm thế nào để tạo tài khoản?', 
'Bạn chỉ cần click vào nút "Đăng ký" ở góc phải màn hình, điền email và mật khẩu, sau đó xác thực email để kích hoạt tài khoản.',
'general', 1, true),

('Tôi có thể ứng tuyển bao nhiêu công việc cùng lúc?',
'Sinh viên có thể ứng tuyển tối đa 20 vị trí trong 1 tháng để đảm bảo chất lượng hồ sơ.',
'student', 2, true),

('Làm thế nào để đăng tin tuyển dụng?',
'Sau khi đăng nhập bằng tài khoản doanh nghiệp, click vào "Đăng tin tuyển dụng", điền đầy đủ thông tin và gửi. Tin của bạn sẽ được phê duyệt trong vòng 24h.',
'company', 3, true),

('Tôi quên mật khẩu, phải làm sao?',
'Click vào "Quên mật khẩu" ở trang đăng nhập, nhập email đã đăng ký và làm theo hướng dẫn trong email để reset mật khẩu.',
'general', 4, true),

('CV của tôi có được bảo mật không?',
'Có, CV của bạn chỉ được hiển thị cho các công ty mà bạn đã ứng tuyển. Thông tin cá nhân được mã hóa và bảo mật tuyệt đối.',
'student', 5, true);

-- =============================================
-- 13. TẠO SEARCH HISTORY & SAVED SEARCHES
-- =============================================

INSERT INTO search_history (student_id, search_query, filters, results_count) VALUES
(1, 'backend nodejs', '{"location": "Hồ Chí Minh", "salary_min": 10000000}', 15),
(1, 'internship', '{"employment_type": "internship"}', 8),
(2, 'frontend react', '{"experience_level": "junior"}', 12),
(2, 'ui ux designer', '{"salary_min": 12000000}', 7);

INSERT INTO saved_searches (student_id, search_name, search_query, filters, is_alert_enabled) VALUES
(1, 'Backend Jobs HCM', 'backend', '{"location": "Hồ Chí Minh", "employment_type": "full-time"}', true),
(2, 'Frontend Remote', 'frontend', '{"is_remote": true}', true),
(4, 'UI/UX Designer', 'designer', '{"category": "UI/UX Design"}', false);

-- =============================================
-- 14. TẠO DAILY STATISTICS
-- =============================================

INSERT INTO daily_statistics (stat_date, new_jobs, new_applications, new_companies, new_students, total_job_views) VALUES
(CURRENT_DATE - INTERVAL '7 days', 5, 12, 2, 8, 245),
(CURRENT_DATE - INTERVAL '6 days', 3, 15, 1, 5, 312),
(CURRENT_DATE - INTERVAL '5 days', 7, 18, 3, 12, 398),
(CURRENT_DATE - INTERVAL '4 days', 4, 10, 0, 7, 276),
(CURRENT_DATE - INTERVAL '3 days', 6, 22, 2, 10, 421),
(CURRENT_DATE - INTERVAL '2 days', 8, 19, 1, 9, 367),
(CURRENT_DATE - INTERVAL '1 day', 5, 16, 2, 11, 389);

-- =============================================
-- 15. TẠO SYSTEM SETTINGS
-- =============================================

UPDATE system_settings SET setting_value = 'true' WHERE setting_key = 'job_posting_approval_required';
UPDATE system_settings SET setting_value = '30' WHERE setting_key = 'job_posting_default_duration_days';
UPDATE system_settings SET setting_value = '20' WHERE setting_key = 'max_applications_per_student';

-- =============================================
-- KẾT THÚC SAMPLE DATA
-- =============================================

-- Verify data
SELECT 'Users created: ' || COUNT(*) FROM users;
SELECT 'Companies created: ' || COUNT(*) FROM companies;
SELECT 'Students created: ' || COUNT(*) FROM students;
SELECT 'Job postings created: ' || COUNT(*) FROM job_postings;
SELECT 'Applications created: ' || COUNT(*) FROM applications;
SELECT 'Skills created: ' || COUNT(*) FROM skills;