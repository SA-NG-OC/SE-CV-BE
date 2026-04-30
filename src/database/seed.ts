import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
    console.log('🚀 Đang bắt đầu quá trình Seeding...');

    // 1. Xóa dữ liệu cũ (Theo thứ tự ngược lại để tránh lỗi khóa ngoại)
    console.log('🧹 Đang làm sạch database cũ...');
    await db.delete(schema.comments);
    await db.delete(schema.job_invitations);
    await db.delete(schema.application_status_history);
    await db.delete(schema.applications);
    await db.delete(schema.saved_jobs);
    await db.delete(schema.job_views);
    await db.delete(schema.job_required_skills);
    await db.delete(schema.job_postings);
    await db.delete(schema.followed_companies);
    await db.delete(schema.company_images);
    await db.delete(schema.companies);
    await db.delete(schema.student_skills);
    await db.delete(schema.student_resumes);
    await db.delete(schema.students);
    await db.delete(schema.users);
    await db.delete(schema.skills);
    await db.delete(schema.majors);
    await db.delete(schema.roles);
    await db.delete(schema.job_categories);

    // 2. Thêm ROLES (Độc lập) — bắt đầu từ 100
    console.log('📦 Thêm Roles...');
    await db.insert(schema.roles).values([
        { role_id: 1, role_name: 'admin', description: 'Quản trị viên hệ thống' },
        { role_id: 2, role_name: 'company', description: 'Nhà tuyển dụng' },
        { role_id: 3, role_name: 'student', description: 'Sinh viên/Ứng viên' },
    ]);

    // 3. Thêm MAJORS (Độc lập) — bắt đầu từ 100
    console.log('📦 Thêm Majors...');
    await db.insert(schema.majors).values([
        { major_id: 100, major_name: 'Công nghệ thông tin' },
        { major_id: 101, major_name: 'Kỹ thuật phần mềm' },
        { major_id: 102, major_name: 'Hệ thống thông tin' },
        { major_id: 103, major_name: 'Khoa học máy tính' },
    ]);

    // 4. Thêm SKILLS (Độc lập) — bắt đầu từ 100
    console.log('📦 Thêm Skills...');
    await db.insert(schema.skills).values([
        { skill_id: 100, skill_name: 'React' },
        { skill_id: 101, skill_name: 'Node.js' },
        { skill_id: 102, skill_name: 'TypeScript' },
        { skill_id: 103, skill_name: 'Python' },
        { skill_id: 104, skill_name: 'Java' },
        { skill_id: 105, skill_name: 'Spring Boot' },
        { skill_id: 106, skill_name: 'Docker' },
        { skill_id: 107, skill_name: 'Kubernetes' },
        { skill_id: 108, skill_name: 'AWS' },
        { skill_id: 109, skill_name: 'PostgreSQL' },
        { skill_id: 110, skill_name: 'MongoDB' },
        { skill_id: 111, skill_name: 'Redis' },
        { skill_id: 112, skill_name: 'GraphQL' },
        { skill_id: 113, skill_name: 'Next.js' },
        { skill_id: 114, skill_name: 'Flutter' },
        { skill_id: 115, skill_name: 'Swift' },
        { skill_id: 116, skill_name: 'Kotlin' },
        { skill_id: 117, skill_name: 'Machine Learning' },
        { skill_id: 118, skill_name: 'Data Analysis' },
        { skill_id: 119, skill_name: 'Figma' },
    ]);

    // 4.1 Thêm JOB CATEGORIES (Độc lập) — bắt đầu từ 100
    console.log('📦 Thêm Job Categories...');
    await db.insert(schema.job_categories).values([
        { category_id: 100, category_name: 'Software Development' },
        { category_id: 101, category_name: 'Data & AI' },
        { category_id: 102, category_name: 'DevOps & Cloud' },
        { category_id: 103, category_name: 'Mobile Development' },
        { category_id: 104, category_name: 'UI/UX Design' },
    ]);

    // 5. Thêm USERS (Phụ thuộc vào Roles — role_id cập nhật 100/101/102)
    console.log('📦 Thêm Users...');
    await db.insert(schema.users).values([
        // Admin
        { user_id: 1000, email: 'admin@test.com', password_hash: '$2a$10$IQHd4uBdkCS7hoV4uVDI1OCfW7aq.3kCd6ca4ZeqfCJkTniPRp5lO', role_id: 1, is_active: true, is_verified: true },
        { user_id: 4000, email: 'test@example.com', password_hash: '$2a$10$IQHd4uBdkCS7hoV4uVDI1OCfW7aq.3kCd6ca4ZeqfCJkTniPRp5lO.', role_id: 1, is_active: true, is_verified: true },

        // Companies
        { user_id: 2000, email: 'company@test.com', password_hash: '$2a$10$BukqDjmK.Nc.AMG8yZxN6O8mqPR/s5fmq8ZMFNiEXYIL5lJMsb8Jm', role_id: 2, is_active: true, is_verified: true },
        { user_id: 1100, email: 'sang22102005@gmail.com', password_hash: '$2b$10$z4alfCAmpcYnmDZMi/9g6ewB0NdDBvHODzqsJ27pOK9uHQGnXr.ja', role_id: 2, is_active: true, is_verified: true, oauth_provider: 'google', oauth_provider_id: '100844144305870518667' },
        { user_id: 2001, email: 'hr@fpt-software.com', password_hash: '$2a$10$BukqDjmK.Nc.AMG8yZxN6O8mqPR/s5fmq8ZMFNiEXYIL5lJMsb8Jm', role_id: 2, is_active: true, is_verified: true },
        { user_id: 2002, email: 'recruit@vng.com.vn', password_hash: '$2a$10$BukqDjmK.Nc.AMG8yZxN6O8mqPR/s5fmq8ZMFNiEXYIL5lJMsb8Jm', role_id: 2, is_active: true, is_verified: true },
        { user_id: 2003, email: 'talent@tiki.vn', password_hash: '$2a$10$BukqDjmK.Nc.AMG8yZxN6O8mqPR/s5fmq8ZMFNiEXYIL5lJMsb8Jm', role_id: 2, is_active: true, is_verified: true },
        { user_id: 2004, email: 'jobs@momo.vn', password_hash: '$2a$10$BukqDjmK.Nc.AMG8yZxN6O8mqPR/s5fmq8ZMFNiEXYIL5lJMsb8Jm', role_id: 2, is_active: true, is_verified: true },

        // Students
        { user_id: 3000, email: 'student@test.com', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3, is_active: true, is_verified: true },
        { user_id: 1200, email: '23521348@gm.uit.edu.vn', password_hash: null, role_id: null, oauth_provider: 'google', oauth_provider_id: '102693512867141333079' },
        { user_id: 100, email: 'nguyenvana@student.edu.vn', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3, is_active: true, is_verified: true },
        { user_id: 101, email: 'tranthib@student.edu.vn', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3, is_active: true, is_verified: true },
        { user_id: 102, email: 'levanc@student.edu.vn', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3, is_active: true, is_verified: true },
        { user_id: 103, email: 'phamthid@student.edu.vn', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3, is_active: true, is_verified: true },
        { user_id: 104, email: 'hoangvane@student.edu.vn', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3, is_active: true, is_verified: true },
        { user_id: 105, email: 'ngothif@student.edu.vn', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3, is_active: true, is_verified: true },
        { user_id: 106, email: 'dinhvang@student.edu.vn', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3, is_active: true, is_verified: true },
        { user_id: 107, email: 'vuthih@student.edu.vn', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3, is_active: true, is_verified: true },
        { user_id: 108, email: 'buivani@student.edu.vn', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3, is_active: true, is_verified: true },
        { user_id: 109, email: 'dothij@student.edu.vn', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3, is_active: true, is_verified: true },
    ]);

    // 6. Thêm COMPANIES — bắt đầu từ 100, user_id giữ nguyên
    console.log('📦 Thêm Companies...');
    await db.insert(schema.companies).values([
        {
            company_id: 100,
            user_id: 2000,
            company_name: 'Tech Solutions Vietnam',
            industry: 'Công nghệ thông tin',
            slogan: 'Innovate. Build. Grow.',
            company_size: '100-500',
            website: 'https://techsolutions.vn',
            description: 'Công ty phát triển phần mềm hàng đầu tại Việt Nam, chuyên cung cấp các giải pháp công nghệ cho doanh nghiệp.',
            address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
            contact_email: 'company@test.com',
            contact_phone: '0281234567',
            status: 'APPROVED',
            rating: '4.2',
            total_jobs_posted: 5,
        },
        {
            company_id: 101,
            user_id: 1100,
            company_name: 'FPT Software',
            industry: 'Phần mềm & Dịch vụ CNTT',
            slogan: 'Made by FPT. Powered by Technology.',
            company_size: '10000+',
            website: 'https://fptsoftware.com',
            description: 'FPT Software là công ty cung cấp dịch vụ và giải pháp công nghệ thông tin hàng đầu tại Việt Nam và thế giới.',
            address: 'Tòa nhà FPT, Đường Duy Tân, Cầu Giấy, Hà Nội',
            contact_email: 'sang22102005@gmail.com',
            contact_phone: '02435768888',
            status: 'APPROVED',
            rating: '4.5',
            total_jobs_posted: 6,
        },
        {
            company_id: 102,
            user_id: 2001,
            company_name: 'VNG Corporation',
            industry: 'Công nghệ & Game',
            slogan: 'Reach further.',
            company_size: '1000-5000',
            website: 'https://vng.com.vn',
            description: 'VNG là tập đoàn công nghệ hàng đầu Việt Nam, nổi tiếng với Zalo và các sản phẩm game trực tuyến.',
            address: '182 Lê Đại Hành, Phường 15, Quận 11, TP.HCM',
            contact_email: 'hr@fpt-software.com',
            contact_phone: '0287102288',
            status: 'APPROVED',
            rating: '4.3',
            total_jobs_posted: 4,
        },
        {
            company_id: 103,
            user_id: 2002,
            company_name: 'Tiki Corporation',
            industry: 'Thương mại điện tử',
            slogan: 'Tin là mua.',
            company_size: '1000-5000',
            website: 'https://tiki.vn',
            description: 'Tiki là nền tảng thương mại điện tử hàng đầu Việt Nam, cung cấp hàng triệu sản phẩm đến tay người tiêu dùng.',
            address: '52 Út Tịch, Phường 4, Quận Tân Bình, TP.HCM',
            contact_email: 'recruit@vng.com.vn',
            contact_phone: '0287300000',
            status: 'APPROVED',
            rating: '4.0',
            total_jobs_posted: 4,
        },
        {
            company_id: 104,
            user_id: 2003,
            company_name: 'MoMo (M_Service)',
            industry: 'Fintech',
            slogan: 'Siêu ứng dụng thanh toán.',
            company_size: '500-1000',
            website: 'https://momo.vn',
            description: 'MoMo là ví điện tử và siêu ứng dụng thanh toán số 1 tại Việt Nam với hơn 31 triệu người dùng.',
            address: '178/10 Nguyễn Văn Thương, Phường 25, Bình Thạnh, TP.HCM',
            contact_email: 'talent@tiki.vn',
            contact_phone: '1900545441',
            status: 'APPROVED',
            rating: '4.4',
            total_jobs_posted: 4,
        },
        {
            company_id: 105,
            user_id: 2004,
            company_name: 'Startup XYZ',
            industry: 'SaaS / B2B',
            slogan: 'Building the future.',
            company_size: '10-50',
            website: 'https://startupxyz.io',
            description: 'Startup công nghệ trẻ tập trung vào giải pháp SaaS cho doanh nghiệp vừa và nhỏ tại Đông Nam Á.',
            address: '456 Lê Văn Việt, Quận 9, TP.HCM',
            contact_email: 'jobs@momo.vn',
            contact_phone: '0901234567',
            status: 'PENDING',
            rating: '0.0',
            total_jobs_posted: 2,
        },
    ]);

    // 7. Thêm STUDENTS (major_id cập nhật 100–103)
    console.log('📦 Thêm Students...');
    await db.insert(schema.students).values([
        {
            student_id: 100,
            user_id: 100,
            student_code: '2021601234',
            full_name: 'Nguyễn Văn A',
            date_of_birth: '2003-05-15',
            gender: 'Nam',
            phone: '0912345678',
            email_student: 'nguyenvana@student.edu.vn',
            major_id: 100,
            enrollment_year: 2021,
            expected_graduation_year: 2025,
            current_year: 4,
            gpa: '3.45',
            bio: 'Sinh viên năm 4 đam mê lập trình web và backend.',
            career_goals: 'Trở thành Full-stack Developer tại công ty công nghệ hàng đầu.',
            linkedin_url: 'https://linkedin.com/in/nguyenvana',
            github_url: 'https://github.com/nguyenvana',
            desired_position: 'Full-stack Developer',
            desired_salary_min: 12000000,
            desired_salary_max: 18000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: true,
            student_status: 'STUDYING',
        },
        {
            student_id: 101,
            user_id: 101,
            student_code: '2021601235',
            full_name: 'Trần Thị B',
            date_of_birth: '2003-08-20',
            gender: 'Nữ',
            phone: '0923456789',
            email_student: 'tranthib@student.edu.vn',
            major_id: 101,
            enrollment_year: 2021,
            expected_graduation_year: 2025,
            current_year: 4,
            gpa: '3.70',
            bio: 'Sinh viên Kỹ thuật phần mềm với kinh nghiệm thực tập tại FPT.',
            career_goals: 'Phát triển sự nghiệp trong lĩnh vực AI/ML.',
            desired_position: 'AI Engineer / Data Scientist',
            desired_salary_min: 15000000,
            desired_salary_max: 22000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: true,
            student_status: 'STUDYING',
        },
        {
            student_id: 102,
            user_id: 102,
            student_code: '2022601001',
            full_name: 'Lê Văn C',
            date_of_birth: '2004-01-10',
            gender: 'Nam',
            phone: '0934567890',
            email_student: 'levanc@student.edu.vn',
            major_id: 100,
            enrollment_year: 2022,
            expected_graduation_year: 2026,
            current_year: 3,
            gpa: '3.10',
            bio: 'Sinh viên năm 3 quan tâm đến lập trình mobile.',
            career_goals: 'Trở thành Mobile Developer.',
            desired_position: 'Mobile Developer',
            desired_salary_min: 10000000,
            desired_salary_max: 15000000,
            desired_location: 'Hà Nội',
            work_type: 'internship',
            is_open_to_work: true,
            student_status: 'STUDYING',
        },
        {
            student_id: 103,
            user_id: 103,
            student_code: '2020601100',
            full_name: 'Phạm Thị D',
            date_of_birth: '2002-11-25',
            gender: 'Nữ',
            phone: '0945678901',
            email_student: 'phamthid@student.edu.vn',
            major_id: 102,
            enrollment_year: 2020,
            expected_graduation_year: 2024,
            current_year: 4,
            gpa: '3.55',
            bio: 'Vừa tốt nghiệp, có kinh nghiệm làm BA và phân tích dữ liệu.',
            career_goals: 'Business Analyst hoặc Data Analyst.',
            desired_position: 'Business Analyst',
            desired_salary_min: 14000000,
            desired_salary_max: 20000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: true,
            student_status: 'GRADUATED',
        },
        {
            student_id: 104,
            user_id: 104,
            student_code: '2021601500',
            full_name: 'Hoàng Văn E',
            date_of_birth: '2003-03-07',
            gender: 'Nam',
            phone: '0956789012',
            email_student: 'hoangvane@student.edu.vn',
            major_id: 103,
            enrollment_year: 2021,
            expected_graduation_year: 2025,
            current_year: 4,
            gpa: '3.20',
            bio: 'Sinh viên Khoa học máy tính, đam mê DevOps và Cloud.',
            career_goals: 'Cloud/DevOps Engineer tại công ty product.',
            desired_position: 'DevOps Engineer',
            desired_salary_min: 13000000,
            desired_salary_max: 20000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: true,
            student_status: 'STUDYING',
        },
        {
            student_id: 105,
            user_id: 105,
            student_code: '2022601200',
            full_name: 'Ngô Thị F',
            date_of_birth: '2004-06-18',
            gender: 'Nữ',
            phone: '0967890123',
            email_student: 'ngothif@student.edu.vn',
            major_id: 101,
            enrollment_year: 2022,
            expected_graduation_year: 2026,
            current_year: 3,
            gpa: '3.80',
            bio: 'Sinh viên xuất sắc, có kinh nghiệm về React và UI/UX.',
            career_goals: 'Frontend Developer với tư duy thiết kế tốt.',
            desired_position: 'Frontend Developer',
            desired_salary_min: 10000000,
            desired_salary_max: 16000000,
            desired_location: 'TP.HCM',
            work_type: 'part-time',
            is_open_to_work: true,
            student_status: 'STUDYING',
        },
        {
            student_id: 106,
            user_id: 106,
            student_code: '2021601600',
            full_name: 'Đinh Văn G',
            date_of_birth: '2003-09-30',
            gender: 'Nam',
            phone: '0978901234',
            email_student: 'dinhvang@student.edu.vn',
            major_id: 100,
            enrollment_year: 2021,
            expected_graduation_year: 2025,
            current_year: 4,
            gpa: '2.95',
            bio: 'Sinh viên CNTT với kinh nghiệm backend Java/Spring Boot.',
            career_goals: 'Backend Engineer tại công ty fintech.',
            desired_position: 'Backend Developer',
            desired_salary_min: 12000000,
            desired_salary_max: 18000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: false,
            student_status: 'STUDYING',
        },
        {
            student_id: 107,
            user_id: 107,
            student_code: '2023601001',
            full_name: 'Vũ Thị H',
            date_of_birth: '2005-02-14',
            gender: 'Nữ',
            phone: '0989012345',
            email_student: 'vuthih@student.edu.vn',
            major_id: 101,
            enrollment_year: 2023,
            expected_graduation_year: 2027,
            current_year: 2,
            gpa: '3.60',
            bio: 'Sinh viên năm 2 ham học hỏi, đang tìm kiếm thực tập hè.',
            career_goals: 'Học hỏi và phát triển kỹ năng lập trình.',
            desired_position: 'Intern Software Engineer',
            desired_salary_min: 5000000,
            desired_salary_max: 8000000,
            desired_location: 'TP.HCM',
            work_type: 'internship',
            is_open_to_work: true,
            student_status: 'STUDYING',
        },
        {
            student_id: 108,
            user_id: 108,
            student_code: '2021601700',
            full_name: 'Bùi Văn I',
            date_of_birth: '2003-12-05',
            gender: 'Nam',
            phone: '0990123456',
            email_student: 'buivani@student.edu.vn',
            major_id: 102,
            enrollment_year: 2021,
            expected_graduation_year: 2025,
            current_year: 4,
            gpa: '3.30',
            bio: 'Sinh viên Hệ thống thông tin, thành thạo SQL và Power BI.',
            career_goals: 'Data Analyst hoặc BI Developer.',
            desired_position: 'Data Analyst',
            desired_salary_min: 12000000,
            desired_salary_max: 18000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: true,
            student_status: 'STUDYING',
        },
        {
            student_id: 109,
            user_id: 109,
            student_code: '2020601200',
            full_name: 'Đỗ Thị J',
            date_of_birth: '2002-07-22',
            gender: 'Nữ',
            phone: '0901234567',
            email_student: 'dothij@student.edu.vn',
            major_id: 103,
            enrollment_year: 2020,
            expected_graduation_year: 2024,
            current_year: 4,
            gpa: '3.90',
            bio: 'Tốt nghiệp loại giỏi, đã có 6 tháng kinh nghiệm thực tập tại VNG.',
            career_goals: 'Software Engineer tại công ty product lớn.',
            desired_position: 'Software Engineer',
            desired_salary_min: 18000000,
            desired_salary_max: 28000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: true,
            student_status: 'GRADUATED',
        },
    ]);

    // 8. Thêm STUDENT_SKILLS (skill_id cập nhật 100–119)
    console.log('📦 Thêm Student_Skills...');
    await db.insert(schema.student_skills).values([
        // Nguyễn Văn A - Full-stack
        { student_id: 100, skill_id: 100, proficiency_level: 'Advanced' },   // React
        { student_id: 100, skill_id: 101, proficiency_level: 'Advanced' },   // Node.js
        { student_id: 100, skill_id: 102, proficiency_level: 'Intermediate' }, // TypeScript
        { student_id: 100, skill_id: 109, proficiency_level: 'Intermediate' }, // PostgreSQL
        // Trần Thị B - AI/ML
        { student_id: 101, skill_id: 103, proficiency_level: 'Advanced' },   // Python
        { student_id: 101, skill_id: 117, proficiency_level: 'Intermediate' }, // Machine Learning
        { student_id: 101, skill_id: 118, proficiency_level: 'Advanced' },   // Data Analysis
        // Lê Văn C - Mobile
        { student_id: 102, skill_id: 114, proficiency_level: 'Intermediate' }, // Flutter
        { student_id: 102, skill_id: 116, proficiency_level: 'Beginner' },   // Kotlin
        // Phạm Thị D - BA/Data
        { student_id: 103, skill_id: 118, proficiency_level: 'Advanced' },   // Data Analysis
        { student_id: 103, skill_id: 109, proficiency_level: 'Intermediate' }, // PostgreSQL
        // Hoàng Văn E - DevOps
        { student_id: 104, skill_id: 106, proficiency_level: 'Advanced' },   // Docker
        { student_id: 104, skill_id: 107, proficiency_level: 'Intermediate' }, // Kubernetes
        { student_id: 104, skill_id: 108, proficiency_level: 'Intermediate' }, // AWS
        // Ngô Thị F - Frontend
        { student_id: 105, skill_id: 100, proficiency_level: 'Advanced' },   // React
        { student_id: 105, skill_id: 113, proficiency_level: 'Intermediate' }, // Next.js
        { student_id: 105, skill_id: 119, proficiency_level: 'Advanced' },   // Figma
        // Đinh Văn G - Backend Java
        { student_id: 106, skill_id: 104, proficiency_level: 'Advanced' },   // Java
        { student_id: 106, skill_id: 105, proficiency_level: 'Advanced' },   // Spring Boot
        { student_id: 106, skill_id: 109, proficiency_level: 'Intermediate' }, // PostgreSQL
        // Vũ Thị H - Intern
        { student_id: 107, skill_id: 100, proficiency_level: 'Beginner' },   // React
        { student_id: 107, skill_id: 102, proficiency_level: 'Beginner' },   // TypeScript
        // Bùi Văn I - Data Analyst
        { student_id: 108, skill_id: 103, proficiency_level: 'Intermediate' }, // Python
        { student_id: 108, skill_id: 118, proficiency_level: 'Advanced' },   // Data Analysis
        { student_id: 108, skill_id: 109, proficiency_level: 'Advanced' },   // PostgreSQL
        // Đỗ Thị J - Software Engineer
        { student_id: 109, skill_id: 104, proficiency_level: 'Advanced' },   // Java
        { student_id: 109, skill_id: 105, proficiency_level: 'Advanced' },   // Spring Boot
        { student_id: 109, skill_id: 106, proficiency_level: 'Intermediate' }, // Docker
        { student_id: 109, skill_id: 109, proficiency_level: 'Advanced' },   // PostgreSQL
    ]);

    // 9. Thêm JOB POSTINGS — job_id bắt đầu từ 100, company_id & category_id cập nhật
    console.log('📦 Thêm Job Postings...');
    await db.insert(schema.job_postings).values([
        // --- Tech Solutions Vietnam (company_id: 100) ---
        {
            job_id: 100,
            company_id: 100,
            category_id: 100,
            job_title: 'Frontend Developer (React)',
            job_description: 'Chúng tôi tìm kiếm Frontend Developer có kinh nghiệm với React để xây dựng các ứng dụng web hiện đại, hiệu suất cao cho khách hàng doanh nghiệp trong và ngoài nước.',
            requirements: '- Tối thiểu 1 năm kinh nghiệm với React\n- Thành thạo HTML5, CSS3, JavaScript ES6+\n- Có kinh nghiệm với TypeScript là lợi thế\n- Biết sử dụng Git, RESTful API\n- Có khả năng đọc hiểu tài liệu tiếng Anh',
            benefits: '- Lương cạnh tranh từ 12-20 triệu VNĐ\n- Thưởng dự án, thưởng hiệu suất\n- Bảo hiểm sức khỏe cao cấp\n- Làm việc hybrid (3 ngày office/tuần)\n- Môi trường trẻ, năng động',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 2,
            salary_min: 12000000,
            salary_max: 20000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-08-31',
            status: 'approved',
            is_active: true,
            application_count: 15,
        },
        {
            job_id: 101,
            company_id: 100,
            category_id: 100,
            job_title: 'Backend Developer (Node.js)',
            job_description: 'Tìm kiếm Backend Developer Node.js để xây dựng và duy trì các API microservices, tích hợp hệ thống và đảm bảo hiệu suất cho nền tảng SaaS của chúng tôi.',
            requirements: '- Tối thiểu 1 năm kinh nghiệm với Node.js\n- Hiểu biết về RESTful API, GraphQL\n- Kinh nghiệm với PostgreSQL hoặc MongoDB\n- Biết về Docker là lợi thế\n- Có tư duy về bảo mật ứng dụng',
            benefits: '- Lương 14-22 triệu VNĐ\n- Review lương 6 tháng/lần\n- Laptop được cấp\n- Phụ cấp ăn trưa, xăng xe\n- Team building hàng quý',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 2,
            salary_min: 14000000,
            salary_max: 22000000,
            salary_type: 'monthly',
            is_salary_negotiable: false,
            city: 'TP.HCM',
            application_deadline: '2025-07-31',
            status: 'approved',
            is_active: true,
            application_count: 8,
        },
        {
            job_id: 102,
            company_id: 100,
            category_id: 104,
            job_title: 'UI/UX Designer',
            job_description: 'Chúng tôi cần một UI/UX Designer sáng tạo để thiết kế trải nghiệm người dùng tuyệt vời cho các sản phẩm web và mobile. Bạn sẽ làm việc trực tiếp với team product và engineering.',
            requirements: '- Thành thạo Figma, Adobe XD\n- Có portfolio thể hiện dự án thực tế\n- Hiểu về Design System, Atomic Design\n- Biết HTML/CSS cơ bản là lợi thế\n- Có tư duy User-Centered Design',
            benefits: '- Lương 10-18 triệu VNĐ\n- Ngân sách học tập 5 triệu/năm\n- Làm việc creative, tự do sáng tạo\n- Flexible working hours',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 1,
            salary_min: 10000000,
            salary_max: 18000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-08-15',
            status: 'approved',
            is_active: true,
            application_count: 22,
        },

        // --- FPT Software (company_id: 101) ---
        {
            job_id: 103,
            company_id: 101,
            category_id: 100,
            job_title: 'Java Developer (Fresher/Junior)',
            job_description: 'FPT Software tuyển dụng Java Developer tham gia vào các dự án outsourcing cho khách hàng Nhật Bản và Mỹ. Bạn sẽ được đào tạo bài bản và phát triển trong môi trường chuyên nghiệp.',
            requirements: '- Tốt nghiệp hoặc chuẩn bị tốt nghiệp ngành CNTT\n- Nắm vững Java OOP, Java Core\n- Biết Spring Boot cơ bản\n- Có kiến thức SQL\n- Tiếng Anh đọc hiểu tài liệu',
            benefits: '- Lương Fresher: 8-12 triệu, Junior: 12-20 triệu\n- Đào tạo nội bộ chuyên sâu\n- Cơ hội đi làm dự án nước ngoài\n- Môi trường quốc tế\n- Chính sách phúc lợi hàng đầu',
            experience_level: 'Fresher',
            position_level: 'Nhân viên',
            number_of_positions: 10,
            salary_min: 8000000,
            salary_max: 20000000,
            salary_type: 'monthly',
            is_salary_negotiable: false,
            city: 'Hà Nội',
            application_deadline: '2025-09-30',
            status: 'approved',
            is_active: true,
            application_count: 120,
        },
        {
            job_id: 104,
            company_id: 101,
            category_id: 101,
            job_title: 'Data Engineer',
            job_description: 'Tuyển Data Engineer để xây dựng và vận hành data pipeline, data warehouse phục vụ các dự án phân tích dữ liệu lớn cho khách hàng doanh nghiệp toàn cầu.',
            requirements: '- Tối thiểu 1 năm kinh nghiệm với Python\n- Biết Apache Spark, Kafka hoặc tương đương\n- Kinh nghiệm với SQL và NoSQL\n- Hiểu biết về Cloud (AWS/GCP/Azure)\n- Kinh nghiệm ETL pipeline',
            benefits: '- Lương 18-30 triệu VNĐ\n- Hỗ trợ thi chứng chỉ Cloud\n- Dự án quy mô lớn, công nghệ mới\n- Môi trường đa văn hóa',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 5,
            salary_min: 18000000,
            salary_max: 30000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-08-20',
            status: 'approved',
            is_active: true,
            application_count: 45,
        },
        {
            job_id: 105,
            company_id: 101,
            category_id: 102,
            job_title: 'DevOps Engineer',
            job_description: 'FPT Software cần DevOps Engineer để triển khai và quản lý hạ tầng CI/CD, containerization và cloud infrastructure cho các dự án lớn.',
            requirements: '- Kinh nghiệm với Docker, Kubernetes\n- Biết CI/CD (Jenkins, GitLab CI)\n- Kinh nghiệm AWS hoặc Azure\n- Biết scripting (Bash, Python)\n- Hiểu về monitoring (Prometheus, Grafana)',
            benefits: '- Lương 20-35 triệu VNĐ\n- AWS/Azure certification support\n- Dự án infrastructure quy mô lớn\n- Flexible remote work',
            experience_level: 'Middle',
            position_level: 'Nhân viên',
            number_of_positions: 3,
            salary_min: 20000000,
            salary_max: 35000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'Hà Nội',
            application_deadline: '2025-08-31',
            status: 'approved',
            is_active: true,
            application_count: 30,
        },
        {
            job_id: 106,
            company_id: 101,
            category_id: 103,
            job_title: 'Mobile Developer (Flutter)',
            job_description: 'Tuyển Mobile Developer sử dụng Flutter để phát triển ứng dụng đa nền tảng (iOS & Android) cho các khách hàng quốc tế của FPT.',
            requirements: '- Tối thiểu 1 năm kinh nghiệm Flutter/Dart\n- Hiểu về State Management (Bloc, Provider)\n- Biết tích hợp REST API\n- Kinh nghiệm publish app lên Store\n- Biết native (Swift/Kotlin) là lợi thế',
            benefits: '- Lương 15-25 triệu VNĐ\n- Thiết bị test được cung cấp\n- Làm việc với tech mới nhất\n- Mentoring từ Senior',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 3,
            salary_min: 15000000,
            salary_max: 25000000,
            salary_type: 'monthly',
            is_salary_negotiable: false,
            city: 'TP.HCM',
            application_deadline: '2025-09-15',
            status: 'approved',
            is_active: true,
            application_count: 38,
        },

        // --- VNG Corporation (company_id: 102) ---
        {
            job_id: 107,
            company_id: 102,
            category_id: 100,
            job_title: 'Backend Engineer (Go/Python)',
            job_description: 'VNG tìm kiếm Backend Engineer tham gia phát triển hệ thống Zalo với quy mô hàng chục triệu người dùng. Bạn sẽ làm việc với các bài toán distributed system thú vị.',
            requirements: '- Tối thiểu 2 năm kinh nghiệm Backend\n- Thành thạo Go hoặc Python\n- Hiểu về distributed systems, microservices\n- Kinh nghiệm với message queue (Kafka, RabbitMQ)\n- Kinh nghiệm tối ưu hiệu suất hệ thống',
            benefits: '- Lương 25-45 triệu VNĐ\n- Bonus theo hiệu suất\n- Cổ phần công ty (ESOP)\n- Văn phòng hiện đại\n- Bảo hiểm sức khỏe toàn diện',
            experience_level: 'Middle',
            position_level: 'Nhân viên',
            number_of_positions: 5,
            salary_min: 25000000,
            salary_max: 45000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-08-31',
            status: 'approved',
            is_active: true,
            application_count: 67,
        },
        {
            job_id: 108,
            company_id: 102,
            category_id: 101,
            job_title: 'Machine Learning Engineer',
            job_description: 'Chúng tôi tuyển ML Engineer để nghiên cứu và triển khai các mô hình AI trong sản phẩm Zalo AI, bao gồm xử lý ngôn ngữ tự nhiên, nhận diện hình ảnh và recommendation system.',
            requirements: '- Tốt nghiệp ĐH ngành CNTT, Toán tin hoặc tương đương\n- Kiến thức vững về Machine Learning, Deep Learning\n- Thành thạo Python, TensorFlow hoặc PyTorch\n- Có kinh nghiệm triển khai model production\n- Có paper hoặc project AI thực tế là lợi thế',
            benefits: '- Lương 30-55 triệu VNĐ\n- Ngân sách nghiên cứu\n- Cơ hội publish paper\n- Hội nghị quốc tế\n- Môi trường research chuẩn',
            experience_level: 'Middle',
            position_level: 'Chuyên viên',
            number_of_positions: 3,
            salary_min: 30000000,
            salary_max: 55000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-09-30',
            status: 'approved',
            is_active: true,
            application_count: 41,
        },
        {
            job_id: 109,
            company_id: 102,
            category_id: 103,
            job_title: 'iOS Developer (Swift)',
            job_description: 'VNG tuyển iOS Developer tham gia phát triển ứng dụng Zalo iOS, một trong những ứng dụng có lượng người dùng lớn nhất Việt Nam.',
            requirements: '- Tối thiểu 2 năm kinh nghiệm iOS/Swift\n- Hiểu về UIKit, SwiftUI\n- Kinh nghiệm với Combine, async/await\n- Biết về performance optimization\n- Đã publish app lên App Store',
            benefits: '- Lương 25-40 triệu VNĐ\n- MacBook Pro được cấp\n- iPhone test devices\n- WWDC training budget\n- Chế độ WFH linh hoạt',
            experience_level: 'Middle',
            position_level: 'Nhân viên',
            number_of_positions: 2,
            salary_min: 25000000,
            salary_max: 40000000,
            salary_type: 'monthly',
            is_salary_negotiable: false,
            city: 'TP.HCM',
            application_deadline: '2025-08-15',
            status: 'approved',
            is_active: true,
            application_count: 29,
        },

        // --- Tiki Corporation (company_id: 103) ---
        {
            job_id: 110,
            company_id: 103,
            category_id: 100,
            job_title: 'Software Engineer (Full-stack)',
            job_description: 'Tiki tìm kiếm Software Engineer để xây dựng và phát triển các tính năng mới trên nền tảng e-commerce, phục vụ hàng triệu đơn hàng mỗi ngày.',
            requirements: '- Tối thiểu 1 năm kinh nghiệm Full-stack\n- Thành thạo React/Next.js (Frontend)\n- Thành thạo Node.js hoặc Go (Backend)\n- Kinh nghiệm với PostgreSQL, Redis\n- Hiểu về scalable system design',
            benefits: '- Lương 18-35 triệu VNĐ\n- Stock options\n- Mua hàng Tiki giảm 20%\n- Bữa trưa miễn phí tại văn phòng\n- Đội ngũ kỹ sư giỏi để học hỏi',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 8,
            salary_min: 18000000,
            salary_max: 35000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-10-31',
            status: 'approved',
            is_active: true,
            application_count: 95,
        },
        {
            job_id: 111,
            company_id: 103,
            category_id: 101,
            job_title: 'Data Analyst',
            job_description: 'Tiki cần Data Analyst để phân tích dữ liệu người dùng, hành vi mua sắm và hiệu suất chiến dịch marketing, giúp đưa ra quyết định dựa trên dữ liệu.',
            requirements: '- Tốt nghiệp ĐH ngành liên quan\n- Thành thạo SQL (phức tạp)\n- Biết Python/R cho data analysis\n- Kinh nghiệm với Tableau, Power BI hoặc tương đương\n- Có tư duy phân tích và kỹ năng trình bày tốt',
            benefits: '- Lương 12-22 triệu VNĐ\n- Làm việc với dữ liệu thực tế quy mô lớn\n- Đào tạo và phát triển kỹ năng\n- Môi trường data-driven',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 3,
            salary_min: 12000000,
            salary_max: 22000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-09-30',
            status: 'approved',
            is_active: true,
            application_count: 55,
        },
        {
            job_id: 112,
            company_id: 103,
            category_id: 102,
            job_title: 'Site Reliability Engineer (SRE)',
            job_description: 'Tiki tuyển SRE để đảm bảo hệ thống hoạt động ổn định với uptime cao, quản lý hạ tầng cloud và tối ưu hóa chi phí vận hành.',
            requirements: '- Tối thiểu 2 năm kinh nghiệm SRE/DevOps\n- Thành thạo Kubernetes, Terraform\n- Kinh nghiệm AWS/GCP\n- Biết về observability (logging, metrics, tracing)\n- Kỹ năng on-call và incident response',
            benefits: '- Lương 25-45 triệu VNĐ\n- Chứng chỉ Cloud được hỗ trợ\n- On-call allowance\n- Hệ thống quy mô triệu user',
            experience_level: 'Middle',
            position_level: 'Nhân viên',
            number_of_positions: 2,
            salary_min: 25000000,
            salary_max: 45000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-08-31',
            status: 'approved',
            is_active: true,
            application_count: 18,
        },
        {
            job_id: 113,
            company_id: 103,
            category_id: 104,
            job_title: 'Product Designer (Senior)',
            job_description: 'Tiki tìm Product Designer cấp cao để dẫn dắt thiết kế sản phẩm cho các tính năng chiến lược, xây dựng Design System và mentoring team designer.',
            requirements: '- Tối thiểu 3 năm kinh nghiệm Product Design\n- Portfolio mạnh với case study chi tiết\n- Thành thạo Figma, Principle\n- Kinh nghiệm xây dựng Design System\n- Kỹ năng giao tiếp và thuyết trình tốt',
            benefits: '- Lương 25-40 triệu VNĐ\n- Dẫn dắt sản phẩm triệu người dùng\n- Ngân sách học tập không giới hạn\n- Làm việc với PM và Engineering giỏi',
            experience_level: 'Senior',
            position_level: 'Chuyên viên cao cấp',
            number_of_positions: 1,
            salary_min: 25000000,
            salary_max: 40000000,
            salary_type: 'monthly',
            is_salary_negotiable: false,
            city: 'TP.HCM',
            application_deadline: '2025-09-15',
            status: 'approved',
            is_active: true,
            application_count: 12,
        },

        // --- MoMo (company_id: 104) ---
        {
            job_id: 114,
            company_id: 104,
            category_id: 100,
            job_title: 'Backend Engineer (Golang)',
            job_description: 'MoMo tuyển Backend Engineer Golang để xây dựng các service thanh toán, ví điện tử và hệ thống tài chính yêu cầu độ tin cậy và bảo mật cao.',
            requirements: '- Tối thiểu 1 năm kinh nghiệm Golang\n- Hiểu về payment system, transaction\n- Kinh nghiệm microservices, gRPC\n- Biết về security trong ứng dụng tài chính\n- Kinh nghiệm Redis, PostgreSQL',
            benefits: '- Lương 20-40 triệu VNĐ\n- Thưởng theo doanh thu công ty\n- Cơ hội làm việc tại hệ thống Fintech top 1\n- Health insurance cho cả gia đình\n- Đào tạo chuyên sâu về Fintech',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 5,
            salary_min: 20000000,
            salary_max: 40000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-09-30',
            status: 'approved',
            is_active: true,
            application_count: 73,
        },
        {
            job_id: 115,
            company_id: 104,
            category_id: 101,
            job_title: 'Data Scientist',
            job_description: 'MoMo tìm kiếm Data Scientist để xây dựng các mô hình phát hiện gian lận, chấm điểm tín dụng và cá nhân hóa trải nghiệm người dùng trên siêu ứng dụng.',
            requirements: '- Tốt nghiệp ĐH/Thạc sỹ ngành Toán, CNTT hoặc liên quan\n- Thành thạo Python, R\n- Kinh nghiệm với ML frameworks (Scikit-learn, XGBoost, LightGBM)\n- Biết về fraud detection, credit scoring là lợi thế\n- Kỹ năng trình bày kết quả rõ ràng',
            benefits: '- Lương 22-45 triệu VNĐ\n- Dữ liệu thực tế quy mô triệu giao dịch/ngày\n- Nghiên cứu bài toán Fintech thú vị\n- Môi trường học thuật kết hợp thực tiễn',
            experience_level: 'Junior',
            position_level: 'Chuyên viên',
            number_of_positions: 2,
            salary_min: 22000000,
            salary_max: 45000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-10-15',
            status: 'approved',
            is_active: true,
            application_count: 38,
        },
        {
            job_id: 116,
            company_id: 104,
            category_id: 103,
            job_title: 'Android Developer (Kotlin)',
            job_description: 'Phát triển và duy trì ứng dụng MoMo Android với hơn 31 triệu người dùng, tối ưu hiệu suất, tích hợp tính năng thanh toán và các dịch vụ mới.',
            requirements: '- Tối thiểu 1 năm kinh nghiệm Android/Kotlin\n- Thành thạo Jetpack Compose hoặc XML layout\n- Kinh nghiệm với Coroutines, Flow\n- Biết về mobile security (certificate pinning, obfuscation)\n- Kinh nghiệm tích hợp payment SDK',
            benefits: '- Lương 18-32 triệu VNĐ\n- Android devices cung cấp\n- Làm việc với app triệu người dùng\n- Văn phòng Bình Thạnh, TP.HCM',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 3,
            salary_min: 18000000,
            salary_max: 32000000,
            salary_type: 'monthly',
            is_salary_negotiable: false,
            city: 'TP.HCM',
            application_deadline: '2025-09-20',
            status: 'approved',
            is_active: true,
            application_count: 46,
        },
        {
            job_id: 117,
            company_id: 104,
            category_id: 102,
            job_title: 'Cloud Infrastructure Engineer',
            job_description: 'MoMo tuyển Cloud Infrastructure Engineer để xây dựng và vận hành hạ tầng cloud phục vụ hệ thống thanh toán real-time với SLA 99.99%.',
            requirements: '- Tối thiểu 2 năm kinh nghiệm Cloud (AWS ưu tiên)\n- Thành thạo Terraform, Ansible\n- Kinh nghiệm Kubernetes ở production\n- Biết về HA, DR strategy\n- Có chứng chỉ AWS là lợi thế',
            benefits: '- Lương 25-50 triệu VNĐ\n- AWS certification sponsored\n- Hệ thống mission-critical thực sự thú vị\n- On-call allowance hấp dẫn',
            experience_level: 'Middle',
            position_level: 'Nhân viên',
            number_of_positions: 2,
            salary_min: 25000000,
            salary_max: 50000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-08-31',
            status: 'approved',
            is_active: true,
            application_count: 21,
        },

        // --- Startup XYZ (company_id: 105) ---
        {
            job_id: 118,
            company_id: 105,
            category_id: 100,
            job_title: 'Full-stack Developer (React + Node.js)',
            job_description: 'Startup XYZ tìm kiếm Full-stack Developer đam mê để cùng xây dựng sản phẩm SaaS từ đầu. Bạn sẽ có cơ hội đóng góp vào kiến trúc hệ thống và ảnh hưởng lớn đến sản phẩm.',
            requirements: '- Biết React và Node.js (cơ bản trở lên)\n- Sẵn sàng học hỏi và adapt nhanh\n- Đam mê startup và sản phẩm\n- Có side project hoặc portfolio cá nhân\n- Tiếng Anh giao tiếp được',
            benefits: '- Lương 10-20 triệu VNĐ + equity\n- Remote-first, làm việc flexible\n- Cùng xây dựng sản phẩm từ 0\n- Startup culture năng động\n- Có cơ hội phát triển nhanh',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 2,
            salary_min: 10000000,
            salary_max: 20000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-08-31',
            status: 'pending',
            is_active: true,
            application_count: 0,
        },
        {
            job_id: 119,
            company_id: 105,
            category_id: 101,
            job_title: 'AI/ML Intern',
            job_description: 'Startup XYZ tuyển intern AI/ML để tích hợp các tính năng AI vào sản phẩm SaaS. Đây là cơ hội tuyệt vời để sinh viên có kinh nghiệm thực tế với bài toán AI trong môi trường startup.',
            requirements: '- Sinh viên năm 3-4 ngành CNTT, Toán Tin\n- Biết Python và thư viện ML cơ bản\n- Có kiến thức về NLP hoặc Computer Vision là lợi thế\n- Làm việc được ít nhất 4 buổi/tuần\n- Đam mê AI và công nghệ',
            benefits: '- Lương thực tập: 4-7 triệu VNĐ\n- Mentoring trực tiếp từ founder\n- Kinh nghiệm thực tế sản phẩm AI\n- Có thể convert full-time sau internship\n- Remote work',
            experience_level: 'Intern',
            position_level: 'Thực tập sinh',
            number_of_positions: 2,
            salary_min: 4000000,
            salary_max: 7000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2025-07-31',
            status: 'pending',
            is_active: true,
            application_count: 0,
        },
    ]);

    // 10. Thêm JOB_REQUIRED_SKILLS (job_id & skill_id cập nhật)
    console.log('📦 Thêm Job Required Skills...');
    await db.insert(schema.job_required_skills).values([
        // Job 100: Frontend React
        { job_id: 100, skill_id: 100 }, // React
        { job_id: 100, skill_id: 102 }, // TypeScript
        { job_id: 100, skill_id: 113 }, // Next.js
        // Job 101: Backend Node.js
        { job_id: 101, skill_id: 101 }, // Node.js
        { job_id: 101, skill_id: 102 }, // TypeScript
        { job_id: 101, skill_id: 109 }, // PostgreSQL
        { job_id: 101, skill_id: 112 }, // GraphQL
        // Job 102: UI/UX
        { job_id: 102, skill_id: 119 }, // Figma
        // Job 103: Java Developer
        { job_id: 103, skill_id: 104 }, // Java
        { job_id: 103, skill_id: 105 }, // Spring Boot
        { job_id: 103, skill_id: 109 }, // PostgreSQL
        // Job 104: Data Engineer
        { job_id: 104, skill_id: 103 }, // Python
        { job_id: 104, skill_id: 108 }, // AWS
        { job_id: 104, skill_id: 109 }, // PostgreSQL
        { job_id: 104, skill_id: 110 }, // MongoDB
        // Job 105: DevOps
        { job_id: 105, skill_id: 106 }, // Docker
        { job_id: 105, skill_id: 107 }, // Kubernetes
        { job_id: 105, skill_id: 108 }, // AWS
        // Job 106: Flutter
        { job_id: 106, skill_id: 114 }, // Flutter
        // Job 107: Backend Go/Python
        { job_id: 107, skill_id: 103 }, // Python
        { job_id: 107, skill_id: 111 }, // Redis
        // Job 108: ML Engineer
        { job_id: 108, skill_id: 103 }, // Python
        { job_id: 108, skill_id: 117 }, // Machine Learning
        // Job 109: iOS Developer
        { job_id: 109, skill_id: 115 }, // Swift
        // Job 110: Full-stack Tiki
        { job_id: 110, skill_id: 100 }, // React
        { job_id: 110, skill_id: 101 }, // Node.js
        { job_id: 110, skill_id: 109 }, // PostgreSQL
        { job_id: 110, skill_id: 111 }, // Redis
        // Job 111: Data Analyst
        { job_id: 111, skill_id: 103 }, // Python
        { job_id: 111, skill_id: 109 }, // PostgreSQL
        { job_id: 111, skill_id: 118 }, // Data Analysis
        // Job 112: SRE
        { job_id: 112, skill_id: 106 }, // Docker
        { job_id: 112, skill_id: 107 }, // Kubernetes
        { job_id: 112, skill_id: 108 }, // AWS
        // Job 113: Product Designer
        { job_id: 113, skill_id: 119 }, // Figma
        // Job 114: Backend Golang MoMo
        { job_id: 114, skill_id: 109 }, // PostgreSQL
        { job_id: 114, skill_id: 111 }, // Redis
        // Job 115: Data Scientist
        { job_id: 115, skill_id: 103 }, // Python
        { job_id: 115, skill_id: 117 }, // Machine Learning
        { job_id: 115, skill_id: 118 }, // Data Analysis
        // Job 116: Android
        { job_id: 116, skill_id: 116 }, // Kotlin
        // Job 117: Cloud Infrastructure
        { job_id: 117, skill_id: 106 }, // Docker
        { job_id: 117, skill_id: 107 }, // Kubernetes
        { job_id: 117, skill_id: 108 }, // AWS
        // Job 118: Startup Full-stack
        { job_id: 118, skill_id: 100 }, // React
        { job_id: 118, skill_id: 101 }, // Node.js
        { job_id: 118, skill_id: 102 }, // TypeScript
        // Job 119: AI Intern
        { job_id: 119, skill_id: 103 }, // Python
        { job_id: 119, skill_id: 117 }, // Machine Learning
    ]);

    // 11. Thêm APPLICATIONS (job_id cập nhật)
    console.log('📦 Thêm Applications...');
    await db.insert(schema.applications).values([
        { application_id: 100, job_id: 100, student_id: 100, cv_url: 'https://storage.example.com/cv/nguyenvana_cv.pdf', cover_letter: 'Tôi rất quan tâm đến vị trí Frontend Developer tại Tech Solutions Vietnam...', status: 'submitted' },
        { application_id: 101, job_id: 110, student_id: 100, cv_url: 'https://storage.example.com/cv/nguyenvana_cv.pdf', cover_letter: 'Tôi muốn ứng tuyển vào vị trí Full-stack tại Tiki...', status: 'interviewing' },
        { application_id: 102, job_id: 104, student_id: 101, cv_url: 'https://storage.example.com/cv/tranthib_cv.pdf', cover_letter: 'Với kinh nghiệm về Python và Data Engineering...', status: 'submitted' },
        { application_id: 103, job_id: 108, student_id: 101, cv_url: 'https://storage.example.com/cv/tranthib_cv.pdf', cover_letter: 'Tôi đam mê Machine Learning và muốn đóng góp tại VNG...', status: 'passed' },
        { application_id: 104, job_id: 106, student_id: 102, cv_url: 'https://storage.example.com/cv/levanc_cv.pdf', cover_letter: 'Tôi đang học Flutter và muốn thực tập tại FPT...', status: 'rejected' },
        { application_id: 105, job_id: 111, student_id: 103, cv_url: 'https://storage.example.com/cv/phamthid_cv.pdf', cover_letter: 'Với kỹ năng phân tích dữ liệu và SQL, tôi phù hợp với vị trí Data Analyst...', status: 'interviewing' },
        { application_id: 106, job_id: 105, student_id: 104, cv_url: 'https://storage.example.com/cv/hoangvane_cv.pdf', cover_letter: 'Tôi có kinh nghiệm Docker và Kubernetes, muốn tham gia team DevOps của FPT...', status: 'submitted' },
        { application_id: 107, job_id: 100, student_id: 105, cv_url: 'https://storage.example.com/cv/ngothif_cv.pdf', cover_letter: 'Với kiến thức React và Figma, tôi tin có thể đóng góp cho team...', status: 'submitted' },
        { application_id: 108, job_id: 103, student_id: 106, cv_url: 'https://storage.example.com/cv/dinhvang_cv.pdf', cover_letter: 'Tôi có nền tảng vững về Java và Spring Boot, muốn phát triển tại FPT...', status: 'submitted' },
        { application_id: 109, job_id: 119, student_id: 107, cv_url: 'https://storage.example.com/cv/vuthih_cv.pdf', cover_letter: 'Tôi đang học Python và muốn thực tập AI tại Startup XYZ...', status: 'submitted' },
        { application_id: 110, job_id: 111, student_id: 108, cv_url: 'https://storage.example.com/cv/buivani_cv.pdf', cover_letter: 'Tôi thành thạo SQL và Python cho data analysis...', status: 'passed' },
        { application_id: 111, job_id: 107, student_id: 109, cv_url: 'https://storage.example.com/cv/dothij_cv.pdf', cover_letter: 'Với 6 tháng thực tập tại VNG, tôi hiểu rõ môi trường và muốn trở thành nhân viên chính thức...', status: 'interviewing' },
    ]);

    // 12. Thêm SAVED JOBS (job_id cập nhật)
    console.log('📦 Thêm Saved Jobs...');
    await db.insert(schema.saved_jobs).values([
        { student_id: 100, job_id: 107, notes: 'Vị trí rất tốt, cần ôn lại Go trước khi apply' },
        { student_id: 100, job_id: 114, notes: 'MoMo Fintech - mục tiêu sau khi tốt nghiệp' },
        { student_id: 101, job_id: 115, notes: 'Data Scientist tại MoMo, phù hợp với định hướng' },
        { student_id: 103, job_id: 115, notes: 'Cân nhắc apply sau khi hoàn thiện portfolio' },
        { student_id: 109, job_id: 114, notes: 'Backup option nếu VNG không chọn' },
    ]);

    // 13. Thêm FOLLOWED COMPANIES (company_id cập nhật)
    console.log('📦 Thêm Followed Companies...');
    await db.insert(schema.followed_companies).values([
        { student_id: 100, company_id: 102 }, // VNG
        { student_id: 100, company_id: 104 }, // MoMo
        { student_id: 101, company_id: 101 }, // FPT
        { student_id: 101, company_id: 102 }, // VNG
        { student_id: 104, company_id: 101 }, // FPT
        { student_id: 109, company_id: 102 }, // VNG
        { student_id: 109, company_id: 103 }, // Tiki
    ]);

    // 14. Thêm COMMENTS (company_id cập nhật)
    console.log('📦 Thêm Comments...');
    await db.insert(schema.comments).values([
        { student_id: 109, company_id: 102, rating: 5, content: 'Môi trường làm việc tuyệt vời, team kỹ sư rất giỏi. Thực tập tại đây là trải nghiệm đáng nhớ nhất!' },
        { student_id: 103, company_id: 103, rating: 4, content: 'Tiki có culture tốt, nhiều phúc lợi. Quy trình phỏng vấn chuyên nghiệp và minh bạch.' },
        { student_id: 101, company_id: 101, rating: 4, content: 'FPT Software đào tạo rất bài bản, phù hợp với sinh viên mới ra trường muốn học hỏi.' },
    ]);

    // 15. Thêm NOTIFICATIONS (application_id trong link cập nhật)
    console.log('📦 Thêm Notifications...');
    await db.insert(schema.notifications).values([
        { user_id: 100, type: 'application_update', title: 'Cập nhật đơn ứng tuyển', message: 'Tiki đã xem đơn ứng tuyển của bạn và mời bạn phỏng vấn.', link: '/applications/101', is_read: false },
        { user_id: 101, type: 'application_update', title: 'Chúc mừng! Đơn ứng tuyển của bạn được chấp nhận', message: 'VNG đã chấp nhận đơn ứng tuyển vị trí ML Engineer. Chúc mừng!', link: '/applications/103', is_read: true },
        { user_id: 109, type: 'application_update', title: 'Đơn ứng tuyển đang được xem xét', message: 'VNG đang xem xét đơn ứng tuyển của bạn cho vị trí Backend Engineer.', link: '/applications/111', is_read: false },
        { user_id: 3000, type: 'system', title: 'Chào mừng đến với JobPortal!', message: 'Hãy hoàn thiện hồ sơ để tăng cơ hội được nhà tuyển dụng tìm kiếm.', link: '/profile', is_read: false },
    ]);

    console.log('✅ Hoàn thành Seeding! Database đã sẵn sàng với đầy đủ dữ liệu mẫu.');
    console.log('📊 Tổng kết:');
    console.log('   - 6 Companies (5 approved, 1 pending) — ID: 100–105');
    console.log('   - 10 Students — ID: 100–109');
    console.log('   - 20 Job Postings — ID: 100–119');
    console.log('   - 12 Applications — ID: 100–111');
    console.log('   - Skills (100–119), Majors (100–103), Roles (100–102), Categories (100–104)');
    console.log('   - Follows, Comments, Notifications...');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Lỗi Seeding:', err);
    process.exit(1);
});