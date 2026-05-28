import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

const UIT_LOGO = 'https://www.uit.edu.vn/media/Logo_UIT_In_bab5fa33d5.jpg';

async function main() {
    console.log('🚀 Đang bắt đầu quá trình Seeding...');

    // 1. Xóa dữ liệu cũ (Theo thứ tự ngược lại để tránh lỗi khóa ngoại)
    console.log('🧹 Đang làm sạch database cũ...');
    await db.delete(schema.messages);
    await db.delete(schema.conversation_participants);
    await db.delete(schema.conversations);
    await db.delete(schema.comments);
    await db.delete(schema.job_invitations);
    await db.delete(schema.application_status_history);
    await db.delete(schema.applications);
    await db.delete(schema.saved_jobs);
    await db.delete(schema.job_embeddings);
    await db.delete(schema.job_views);
    await db.delete(schema.job_required_skills);
    await db.delete(schema.job_postings);
    await db.delete(schema.followed_companies);
    await db.delete(schema.company_images);
    await db.delete(schema.companies);
    await db.delete(schema.student_skills);
    await db.delete(schema.student_resumes);
    await db.delete(schema.students);
    await db.delete(schema.notifications);
    await db.delete(schema.users);
    await db.delete(schema.skills);
    await db.delete(schema.majors);
    await db.delete(schema.roles);
    await db.delete(schema.job_categories);

    // 2. ROLES
    console.log('📦 Thêm Roles...');
    await db.insert(schema.roles).values([
        { role_id: 1, role_name: 'admin', description: 'Quản trị viên hệ thống' },
        { role_id: 2, role_name: 'company', description: 'Nhà tuyển dụng' },
        { role_id: 3, role_name: 'student', description: 'Sinh viên/Ứng viên' },
    ]);

    // 3. MAJORS
    console.log('📦 Thêm Majors...');
    await db.insert(schema.majors).values([
        { major_id: 100, major_name: 'Công nghệ thông tin' },
        { major_id: 101, major_name: 'Kỹ thuật phần mềm' },
        { major_id: 102, major_name: 'Hệ thống thông tin' },
        { major_id: 103, major_name: 'Khoa học máy tính' },
    ]);

    // 4. SKILLS
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

    // 4.1 JOB CATEGORIES
    console.log('📦 Thêm Job Categories...');
    await db.insert(schema.job_categories).values([
        { category_id: 100, category_name: 'Software Development' },
        { category_id: 101, category_name: 'Data & AI' },
        { category_id: 102, category_name: 'DevOps & Cloud' },
        { category_id: 103, category_name: 'Mobile Development' },
        { category_id: 104, category_name: 'UI/UX Design' },
    ]);

    // 5. USERS
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

    // 6. COMPANIES
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
            logo_url: UIT_LOGO,
            cover_image_url: UIT_LOGO,
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
            logo_url: UIT_LOGO,
            cover_image_url: UIT_LOGO,
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
            logo_url: UIT_LOGO,
            cover_image_url: UIT_LOGO,
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
            logo_url: UIT_LOGO,
            cover_image_url: UIT_LOGO,
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
            logo_url: UIT_LOGO,
            cover_image_url: UIT_LOGO,
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
            logo_url: UIT_LOGO,
            cover_image_url: UIT_LOGO,
            description: 'Startup công nghệ trẻ tập trung vào giải pháp SaaS cho doanh nghiệp vừa và nhỏ tại Đông Nam Á.',
            address: '456 Lê Văn Việt, Quận 9, TP.HCM',
            contact_email: 'jobs@momo.vn',
            contact_phone: '0901234567',
            status: 'PENDING',
            admin_note: null,
            rating: '0.0',
            total_jobs_posted: 2,
        },
    ]);

    // 6.1 COMPANY IMAGES
    console.log('📦 Thêm Company Images...');
    await db.insert(schema.company_images).values([
        { company_id: 100, image_url: UIT_LOGO },
        { company_id: 100, image_url: UIT_LOGO },
        { company_id: 101, image_url: UIT_LOGO },
        { company_id: 101, image_url: UIT_LOGO },
        { company_id: 102, image_url: UIT_LOGO },
        { company_id: 103, image_url: UIT_LOGO },
        { company_id: 104, image_url: UIT_LOGO },
    ]);

    // 7. STUDENTS
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
            avatar_url: UIT_LOGO,
            email_student: 'nguyenvana@student.edu.vn',
            major_id: 100,
            enrollment_year: 2021,
            expected_graduation_year: 2025,
            current_year: 5,
            gpa: '3.45',
            bio: 'Sinh viên năm 5 đam mê lập trình web và backend.',
            career_goals: 'Trở thành Full-stack Developer tại công ty công nghệ hàng đầu.',
            linkedin_url: 'https://linkedin.com/in/nguyenvana',
            github_url: 'https://github.com/nguyenvana',
            desired_position: 'Full-stack Developer',
            desired_salary_min: 15000000,
            desired_salary_max: 22000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: true,
            student_status: 'GRADUATED',
        },
        {
            student_id: 101,
            user_id: 101,
            student_code: '2021601235',
            full_name: 'Trần Thị B',
            date_of_birth: '2003-08-20',
            gender: 'Nữ',
            phone: '0923456789',
            avatar_url: UIT_LOGO,
            email_student: 'tranthib@student.edu.vn',
            major_id: 101,
            enrollment_year: 2021,
            expected_graduation_year: 2025,
            current_year: 5,
            gpa: '3.70',
            bio: 'Sinh viên Kỹ thuật phần mềm với kinh nghiệm thực tập tại FPT.',
            career_goals: 'Phát triển sự nghiệp trong lĩnh vực AI/ML.',
            desired_position: 'AI Engineer / Data Scientist',
            desired_salary_min: 18000000,
            desired_salary_max: 25000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: true,
            student_status: 'GRADUATED',
        },
        {
            student_id: 102,
            user_id: 102,
            student_code: '2022601001',
            full_name: 'Lê Văn C',
            date_of_birth: '2004-01-10',
            gender: 'Nam',
            phone: '0934567890',
            avatar_url: UIT_LOGO,
            email_student: 'levanc@student.edu.vn',
            major_id: 100,
            enrollment_year: 2022,
            expected_graduation_year: 2026,
            current_year: 4,
            gpa: '3.10',
            bio: 'Sinh viên năm 4 quan tâm đến lập trình mobile.',
            career_goals: 'Trở thành Mobile Developer.',
            desired_position: 'Mobile Developer',
            desired_salary_min: 12000000,
            desired_salary_max: 18000000,
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
            avatar_url: UIT_LOGO,
            email_student: 'phamthid@student.edu.vn',
            major_id: 102,
            enrollment_year: 2020,
            expected_graduation_year: 2024,
            current_year: 4,
            gpa: '3.55',
            bio: 'Đã tốt nghiệp 2024, có 1.5 năm kinh nghiệm BA và phân tích dữ liệu.',
            career_goals: 'Business Analyst hoặc Data Analyst.',
            desired_position: 'Business Analyst',
            desired_salary_min: 18000000,
            desired_salary_max: 25000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: false,
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
            avatar_url: UIT_LOGO,
            email_student: 'hoangvane@student.edu.vn',
            major_id: 103,
            enrollment_year: 2021,
            expected_graduation_year: 2025,
            current_year: 5,
            gpa: '3.20',
            bio: 'Sinh viên Khoa học máy tính, đam mê DevOps và Cloud.',
            career_goals: 'Cloud/DevOps Engineer tại công ty product.',
            desired_position: 'DevOps Engineer',
            desired_salary_min: 15000000,
            desired_salary_max: 22000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: true,
            student_status: 'GRADUATED',
        },
        {
            student_id: 105,
            user_id: 105,
            student_code: '2022601200',
            full_name: 'Ngô Thị F',
            date_of_birth: '2004-06-18',
            gender: 'Nữ',
            phone: '0967890123',
            avatar_url: UIT_LOGO,
            email_student: 'ngothif@student.edu.vn',
            major_id: 101,
            enrollment_year: 2022,
            expected_graduation_year: 2026,
            current_year: 4,
            gpa: '3.80',
            bio: 'Sinh viên xuất sắc năm 4, có kinh nghiệm về React và UI/UX.',
            career_goals: 'Frontend Developer với tư duy thiết kế tốt.',
            desired_position: 'Frontend Developer',
            desired_salary_min: 12000000,
            desired_salary_max: 18000000,
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
            avatar_url: UIT_LOGO,
            email_student: 'dinhvang@student.edu.vn',
            major_id: 100,
            enrollment_year: 2021,
            expected_graduation_year: 2025,
            current_year: 5,
            gpa: '2.95',
            bio: 'Sinh viên CNTT với kinh nghiệm backend Java/Spring Boot. Đang tìm việc sau tốt nghiệp.',
            career_goals: 'Backend Engineer tại công ty fintech.',
            desired_position: 'Backend Developer',
            desired_salary_min: 14000000,
            desired_salary_max: 20000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: true,
            student_status: 'GRADUATED',
        },
        {
            student_id: 107,
            user_id: 107,
            student_code: '2023601001',
            full_name: 'Vũ Thị H',
            date_of_birth: '2005-02-14',
            gender: 'Nữ',
            phone: '0989012345',
            avatar_url: UIT_LOGO,
            email_student: 'vuthih@student.edu.vn',
            major_id: 101,
            enrollment_year: 2023,
            expected_graduation_year: 2027,
            current_year: 3,
            gpa: '3.60',
            bio: 'Sinh viên năm 3 ham học hỏi, đang tìm kiếm thực tập hè 2026.',
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
            avatar_url: UIT_LOGO,
            email_student: 'buivani@student.edu.vn',
            major_id: 102,
            enrollment_year: 2021,
            expected_graduation_year: 2025,
            current_year: 5,
            gpa: '3.30',
            bio: 'Sinh viên Hệ thống thông tin, thành thạo SQL và Power BI.',
            career_goals: 'Data Analyst hoặc BI Developer.',
            desired_position: 'Data Analyst',
            desired_salary_min: 14000000,
            desired_salary_max: 20000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: true,
            student_status: 'GRADUATED',
        },
        {
            student_id: 109,
            user_id: 109,
            student_code: '2020601200',
            full_name: 'Đỗ Thị J',
            date_of_birth: '2002-07-22',
            gender: 'Nữ',
            phone: '0901234567',
            avatar_url: UIT_LOGO,
            email_student: 'dothij@student.edu.vn',
            major_id: 103,
            enrollment_year: 2020,
            expected_graduation_year: 2024,
            current_year: 4,
            gpa: '3.90',
            bio: 'Tốt nghiệp loại giỏi 2024, đã có 2 năm kinh nghiệm thực tập và làm việc tại VNG.',
            career_goals: 'Software Engineer tại công ty product lớn.',
            desired_position: 'Software Engineer',
            desired_salary_min: 22000000,
            desired_salary_max: 35000000,
            desired_location: 'TP.HCM',
            work_type: 'full-time',
            is_open_to_work: true,
            student_status: 'GRADUATED',
        },
    ]);

    // 7.1 STUDENT RESUMES
    console.log('📦 Thêm Student Resumes...');
    await db.insert(schema.student_resumes).values([
        { student_id: 100, resume_name: 'CV Nguyễn Văn A - Full-stack 2026', cv_url: UIT_LOGO, is_default: true },
        { student_id: 101, resume_name: 'CV Trần Thị B - AI Engineer 2026', cv_url: UIT_LOGO, is_default: true },
        { student_id: 102, resume_name: 'CV Lê Văn C - Mobile Dev', cv_url: UIT_LOGO, is_default: true },
        { student_id: 103, resume_name: 'CV Phạm Thị D - BA/Data Analyst', cv_url: UIT_LOGO, is_default: true },
        { student_id: 104, resume_name: 'CV Hoàng Văn E - DevOps', cv_url: UIT_LOGO, is_default: true },
        { student_id: 105, resume_name: 'CV Ngô Thị F - Frontend', cv_url: UIT_LOGO, is_default: true },
        { student_id: 106, resume_name: 'CV Đinh Văn G - Backend Java', cv_url: UIT_LOGO, is_default: true },
        { student_id: 107, resume_name: 'CV Vũ Thị H - Intern', cv_url: UIT_LOGO, is_default: true },
        { student_id: 108, resume_name: 'CV Bùi Văn I - Data Analyst', cv_url: UIT_LOGO, is_default: true },
        { student_id: 109, resume_name: 'CV Đỗ Thị J - Software Engineer', cv_url: UIT_LOGO, is_default: true },
        // CV phụ
        { student_id: 100, resume_name: 'CV Nguyễn Văn A - Backend Focus', cv_url: UIT_LOGO, is_default: false },
        { student_id: 100, resume_name: 'CV Nguyễn Văn A - Frontend Specialist', cv_url: UIT_LOGO, is_default: false },
    ]);

    // 8. STUDENT SKILLS
    console.log('📦 Thêm Student Skills...');
    await db.insert(schema.student_skills).values([
        { student_id: 100, skill_id: 100, proficiency_level: 'Advanced' },
        { student_id: 100, skill_id: 101, proficiency_level: 'Advanced' },
        { student_id: 100, skill_id: 102, proficiency_level: 'Intermediate' },
        { student_id: 100, skill_id: 109, proficiency_level: 'Intermediate' },
        { student_id: 100, skill_id: 113, proficiency_level: 'Intermediate' },
        { student_id: 101, skill_id: 103, proficiency_level: 'Advanced' },
        { student_id: 101, skill_id: 117, proficiency_level: 'Intermediate' },
        { student_id: 101, skill_id: 118, proficiency_level: 'Advanced' },
        { student_id: 102, skill_id: 114, proficiency_level: 'Intermediate' },
        { student_id: 102, skill_id: 116, proficiency_level: 'Beginner' },
        { student_id: 103, skill_id: 118, proficiency_level: 'Advanced' },
        { student_id: 103, skill_id: 109, proficiency_level: 'Intermediate' },
        { student_id: 104, skill_id: 106, proficiency_level: 'Advanced' },
        { student_id: 104, skill_id: 107, proficiency_level: 'Intermediate' },
        { student_id: 104, skill_id: 108, proficiency_level: 'Intermediate' },
        { student_id: 105, skill_id: 100, proficiency_level: 'Advanced' },
        { student_id: 105, skill_id: 113, proficiency_level: 'Intermediate' },
        { student_id: 105, skill_id: 119, proficiency_level: 'Advanced' },
        { student_id: 106, skill_id: 104, proficiency_level: 'Advanced' },
        { student_id: 106, skill_id: 105, proficiency_level: 'Advanced' },
        { student_id: 106, skill_id: 109, proficiency_level: 'Intermediate' },
        { student_id: 107, skill_id: 100, proficiency_level: 'Beginner' },
        { student_id: 107, skill_id: 102, proficiency_level: 'Beginner' },
        { student_id: 108, skill_id: 103, proficiency_level: 'Intermediate' },
        { student_id: 108, skill_id: 118, proficiency_level: 'Advanced' },
        { student_id: 108, skill_id: 109, proficiency_level: 'Advanced' },
        { student_id: 109, skill_id: 104, proficiency_level: 'Advanced' },
        { student_id: 109, skill_id: 105, proficiency_level: 'Advanced' },
        { student_id: 109, skill_id: 106, proficiency_level: 'Intermediate' },
        { student_id: 109, skill_id: 109, proficiency_level: 'Advanced' },
    ]);

    // 9. JOB POSTINGS
    console.log('📦 Thêm Job Postings...');
    await db.insert(schema.job_postings).values([
        // --- Tech Solutions Vietnam (company_id: 100) — tài khoản company@test.com ---
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
            application_deadline: '2027-08-31',
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
            city: 'Hà Nội',
            application_deadline: '2027-07-31',
            status: 'approved',
            is_active: true,
            application_count: 8,
        },
        {
            job_id: 102,
            company_id: 100,
            category_id: 104,
            job_title: 'UI/UX Designer',
            job_description: 'Chúng tôi cần một UI/UX Designer sáng tạo để thiết kế trải nghiệm người dùng tuyệt vời cho các sản phẩm web và mobile.',
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
            application_deadline: '2027-08-15',
            status: 'rejected',
            is_active: false,
            application_count: 0,
            admin_notes: 'Mô tả công việc chưa đủ chi tiết, yêu cầu công ty bổ sung portfolio requirements.',
        },
        {
            job_id: 103,
            company_id: 100,
            category_id: 100,
            job_title: 'Full-stack Developer (React + Node.js)',
            job_description: 'Tech Solutions Vietnam tuyển Full-stack Developer để tham gia phát triển các sản phẩm SaaS cho khách hàng doanh nghiệp.',
            requirements: '- Tối thiểu 1 năm kinh nghiệm Full-stack\n- Thành thạo React (Frontend)\n- Thành thạo Node.js (Backend)\n- Kinh nghiệm với PostgreSQL\n- Biết Docker là lợi thế',
            benefits: '- Lương 15-25 triệu VNĐ\n- Remote-friendly\n- Thưởng dự án hấp dẫn\n- Laptop được cấp\n- Văn phòng Quận 1, TP.HCM',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 3,
            salary_min: 15000000,
            salary_max: 25000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'Hà Nội',
            application_deadline: '2027-09-30',
            status: 'pending',
            is_active: false,
            application_count: 0,
        },
        {
            job_id: 104,
            company_id: 100,
            category_id: 102,
            job_title: 'DevOps Engineer',
            job_description: 'Tech Solutions Vietnam cần DevOps Engineer để xây dựng và vận hành hạ tầng CI/CD, quản lý cloud infrastructure cho các sản phẩm của công ty.',
            requirements: '- Kinh nghiệm với Docker, Kubernetes\n- Biết CI/CD (Jenkins, GitLab CI)\n- Kinh nghiệm AWS hoặc GCP\n- Biết scripting (Bash, Python)\n- Hiểu về monitoring (Prometheus, Grafana)',
            benefits: '- Lương 18-30 triệu VNĐ\n- Hỗ trợ thi chứng chỉ Cloud\n- Môi trường startup năng động\n- Flexible working hours',
            experience_level: 'Middle',
            position_level: 'Nhân viên',
            number_of_positions: 2,
            salary_min: 18000000,
            salary_max: 30000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'TP.HCM',
            application_deadline: '2027-08-31',
            status: 'approved',
            is_active: true,
            application_count: 5,
        },

        // --- FPT Software (company_id: 101) ---
        {
            job_id: 105,
            company_id: 101,
            category_id: 100,
            job_title: 'Java Developer (Fresher/Junior)',
            job_description: 'FPT Software tuyển dụng Java Developer tham gia vào các dự án outsourcing cho khách hàng Nhật Bản và Mỹ.',
            requirements: '- Tốt nghiệp hoặc chuẩn bị tốt nghiệp ngành CNTT\n- Nắm vững Java OOP, Java Core\n- Biết Spring Boot cơ bản\n- Có kiến thức SQL\n- Tiếng Anh đọc hiểu tài liệu',
            benefits: '- Lương Fresher: 8-12 triệu, Junior: 12-20 triệu\n- Đào tạo nội bộ chuyên sâu\n- Cơ hội đi làm dự án nước ngoài\n- Môi trường quốc tế',
            experience_level: 'Fresher',
            position_level: 'Nhân viên',
            number_of_positions: 10,
            salary_min: 8000000,
            salary_max: 20000000,
            salary_type: 'monthly',
            is_salary_negotiable: false,
            city: 'Hà Nội',
            application_deadline: '2027-09-30',
            status: 'approved',
            is_active: true,
            application_count: 120,
        },
        {
            job_id: 106,
            company_id: 101,
            category_id: 101,
            job_title: 'Data Engineer',
            job_description: 'Tuyển Data Engineer để xây dựng và vận hành data pipeline, data warehouse phục vụ các dự án phân tích dữ liệu lớn.',
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
            application_deadline: '2027-08-20',
            status: 'approved',
            is_active: true,
            application_count: 45,
        },
        {
            job_id: 107,
            company_id: 101,
            category_id: 103,
            job_title: 'Mobile Developer (Flutter)',
            job_description: 'Tuyển Mobile Developer sử dụng Flutter để phát triển ứng dụng đa nền tảng cho các khách hàng quốc tế của FPT.',
            requirements: '- Tối thiểu 1 năm kinh nghiệm Flutter/Dart\n- Hiểu về State Management (Bloc, Provider)\n- Biết tích hợp REST API\n- Kinh nghiệm publish app lên Store\n- Biết native (Swift/Kotlin) là lợi thế',
            benefits: '- Lương 15-25 triệu VNĐ\n- Thiết bị test được cung cấp\n- Làm việc với tech mới nhất\n- Mentoring từ Senior',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 3,
            salary_min: 15000000,
            salary_max: 25000000,
            salary_type: 'monthly',
            is_salary_negotiable: false,
            city: 'Hà Nội',
            application_deadline: '2027-09-15',
            status: 'approved',
            is_active: true,
            application_count: 38,
        },

        // --- VNG Corporation (company_id: 102) ---
        {
            job_id: 108,
            company_id: 102,
            category_id: 100,
            job_title: 'Backend Engineer (Go/Python)',
            job_description: 'VNG tìm kiếm Backend Engineer tham gia phát triển hệ thống Zalo với quy mô hàng chục triệu người dùng.',
            requirements: '- Tối thiểu 2 năm kinh nghiệm Backend\n- Thành thạo Go hoặc Python\n- Hiểu về distributed systems, microservices\n- Kinh nghiệm với message queue (Kafka, RabbitMQ)\n- Kinh nghiệm tối ưu hiệu suất hệ thống',
            benefits: '- Lương 25-45 triệu VNĐ\n- Bonus theo hiệu suất\n- Cổ phần công ty (ESOP)\n- Văn phòng hiện đại\n- Bảo hiểm sức khỏe toàn diện',
            experience_level: 'Middle',
            position_level: 'Nhân viên',
            number_of_positions: 5,
            salary_min: 25000000,
            salary_max: 45000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'Hà Nội',
            application_deadline: '2027-08-31',
            status: 'approved',
            is_active: true,
            application_count: 67,
        },
        {
            job_id: 109,
            company_id: 102,
            category_id: 101,
            job_title: 'Machine Learning Engineer',
            job_description: 'Chúng tôi tuyển ML Engineer để nghiên cứu và triển khai các mô hình AI trong sản phẩm Zalo AI.',
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
            application_deadline: '2027-09-30',
            status: 'approved',
            is_active: true,
            application_count: 41,
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
            city: 'Hà Nội',
            application_deadline: '2027-10-31',
            status: 'approved',
            is_active: true,
            application_count: 95,
        },
        {
            job_id: 111,
            company_id: 103,
            category_id: 101,
            job_title: 'Data Analyst',
            job_description: 'Tiki cần Data Analyst để phân tích dữ liệu người dùng, hành vi mua sắm và hiệu suất chiến dịch marketing.',
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
            application_deadline: '2027-09-30',
            status: 'approved',
            is_active: true,
            application_count: 55,
        },
        {
            job_id: 112,
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
            city: 'Hà Nội',
            application_deadline: '2027-09-15',
            status: 'approved',
            is_active: true,
            application_count: 12,
        },

        // --- MoMo (company_id: 104) ---
        {
            job_id: 113,
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
            application_deadline: '2027-09-30',
            status: 'approved',
            is_active: true,
            application_count: 73,
        },
        {
            job_id: 114,
            company_id: 104,
            category_id: 101,
            job_title: 'Data Scientist',
            job_description: 'MoMo tìm kiếm Data Scientist để xây dựng các mô hình phát hiện gian lận, chấm điểm tín dụng và cá nhân hóa trải nghiệm người dùng.',
            requirements: '- Tốt nghiệp ĐH/Thạc sỹ ngành Toán, CNTT hoặc liên quan\n- Thành thạo Python, R\n- Kinh nghiệm với ML frameworks (Scikit-learn, XGBoost, LightGBM)\n- Biết về fraud detection, credit scoring là lợi thế\n- Kỹ năng trình bày kết quả rõ ràng',
            benefits: '- Lương 22-45 triệu VNĐ\n- Dữ liệu thực tế quy mô triệu giao dịch/ngày\n- Nghiên cứu bài toán Fintech thú vị\n- Môi trường học thuật kết hợp thực tiễn',
            experience_level: 'Junior',
            position_level: 'Chuyên viên',
            number_of_positions: 2,
            salary_min: 22000000,
            salary_max: 45000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'Hà Nội',
            application_deadline: '2027-10-15',
            status: 'approved',
            is_active: true,
            application_count: 38,
        },
        {
            job_id: 115,
            company_id: 104,
            category_id: 103,
            job_title: 'Android Developer (Kotlin)',
            job_description: 'Phát triển và duy trì ứng dụng MoMo Android với hơn 31 triệu người dùng.',
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
            application_deadline: '2027-09-20',
            status: 'approved',
            is_active: true,
            application_count: 46,
        },

        // --- Startup XYZ (company_id: 105) ---
        {
            job_id: 116,
            company_id: 105,
            category_id: 100,
            job_title: 'Full-stack Developer (React + Node.js)',
            job_description: 'Startup XYZ tìm kiếm Full-stack Developer đam mê để cùng xây dựng sản phẩm SaaS từ đầu.',
            requirements: '- Biết React và Node.js (cơ bản trở lên)\n- Sẵn sàng học hỏi và adapt nhanh\n- Đam mê startup và sản phẩm\n- Có side project hoặc portfolio cá nhân\n- Tiếng Anh giao tiếp được',
            benefits: '- Lương 10-20 triệu VNĐ + equity\n- Remote-first, làm việc flexible\n- Cùng xây dựng sản phẩm từ 0\n- Startup culture năng động',
            experience_level: 'Junior',
            position_level: 'Nhân viên',
            number_of_positions: 2,
            salary_min: 10000000,
            salary_max: 20000000,
            salary_type: 'monthly',
            is_salary_negotiable: true,
            city: 'Hà Nội',
            application_deadline: '2027-08-31',
            status: 'pending',
            is_active: false,
            application_count: 0,
        },
        {
            job_id: 117,
            company_id: 105,
            category_id: 101,
            job_title: 'AI/ML Intern',
            job_description: 'Startup XYZ tuyển intern AI/ML để tích hợp các tính năng AI vào sản phẩm SaaS.',
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
            application_deadline: '2027-07-31',
            status: 'pending',
            is_active: false,
            application_count: 0,
        },
    ]);

    // 10. JOB REQUIRED SKILLS
    console.log('📦 Thêm Job Required Skills...');
    await db.insert(schema.job_required_skills).values([
        // Tech Solutions Vietnam jobs (100–104)
        { job_id: 100, skill_id: 100 }, { job_id: 100, skill_id: 102 }, { job_id: 100, skill_id: 113 },
        { job_id: 101, skill_id: 101 }, { job_id: 101, skill_id: 102 }, { job_id: 101, skill_id: 109 }, { job_id: 101, skill_id: 112 },
        { job_id: 102, skill_id: 119 },
        { job_id: 103, skill_id: 100 }, { job_id: 103, skill_id: 101 }, { job_id: 103, skill_id: 102 },
        { job_id: 104, skill_id: 106 }, { job_id: 104, skill_id: 107 }, { job_id: 104, skill_id: 108 },
        // FPT jobs (105–107)
        { job_id: 105, skill_id: 104 }, { job_id: 105, skill_id: 105 }, { job_id: 105, skill_id: 109 },
        { job_id: 106, skill_id: 103 }, { job_id: 106, skill_id: 108 }, { job_id: 106, skill_id: 109 }, { job_id: 106, skill_id: 110 },
        { job_id: 107, skill_id: 114 },
        // VNG jobs (108–109)
        { job_id: 108, skill_id: 103 }, { job_id: 108, skill_id: 111 },
        { job_id: 109, skill_id: 103 }, { job_id: 109, skill_id: 117 },
        // Tiki jobs (110–112)
        { job_id: 110, skill_id: 100 }, { job_id: 110, skill_id: 101 }, { job_id: 110, skill_id: 109 }, { job_id: 110, skill_id: 111 },
        { job_id: 111, skill_id: 103 }, { job_id: 111, skill_id: 109 }, { job_id: 111, skill_id: 118 },
        { job_id: 112, skill_id: 119 },
        // MoMo jobs (113–115)
        { job_id: 113, skill_id: 109 }, { job_id: 113, skill_id: 111 },
        { job_id: 114, skill_id: 103 }, { job_id: 114, skill_id: 117 }, { job_id: 114, skill_id: 118 },
        { job_id: 115, skill_id: 116 },
        // Startup XYZ jobs (116–117)
        { job_id: 116, skill_id: 100 }, { job_id: 116, skill_id: 101 }, { job_id: 116, skill_id: 102 },
        { job_id: 117, skill_id: 103 }, { job_id: 117, skill_id: 117 },
    ]);

    // 11. APPLICATIONS
    // Tất cả đơn ứng tuyển từ phía student đều là student_id: 100 (nguyenvana@student.edu.vn)
    // Tất cả thay đổi trạng thái từ phía company đều là user_id: 2000 (company@test.com)
    // → Đơn ứng tuyển vào job của company 100 (Tech Solutions) được xử lý bởi company@test.com
    // → Đơn ứng tuyển vào job của các công ty khác vẫn do company đó xử lý (đây là dữ liệu nền)
    console.log('📦 Thêm Applications...');
    await db.insert(schema.applications).values([
        // ===== TÀI KHOẢN CHÍNH: student_id 100 (nguyenvana@student.edu.vn) =====
        // Ứng tuyển Frontend Developer tại Tech Solutions Vietnam — submitted
        {
            application_id: 100,
            job_id: 100, student_id: 100,
            cv_url: UIT_LOGO,
            cover_letter: 'Kính chào Tech Solutions Vietnam, tôi là Nguyễn Văn A, sinh viên tốt nghiệp ngành CNTT. Với kinh nghiệm 2 năm với React và Node.js, tôi rất tự tin có thể đóng góp ngay từ đầu vào team Frontend của quý công ty.',
            status: 'submitted',
            created_at: new Date('2026-05-20'),
        },
        // Ứng tuyển Backend Developer tại Tech Solutions Vietnam — interviewing
        {
            application_id: 101,
            job_id: 101, student_id: 100,
            cv_url: UIT_LOGO,
            cover_letter: 'Tôi muốn ứng tuyển vị trí Backend Developer (Node.js) tại Tech Solutions Vietnam. Tôi có kinh nghiệm xây dựng REST API và GraphQL, đồng thời thành thạo PostgreSQL và MongoDB.',
            status: 'interviewing',
            created_at: new Date('2026-05-21'),
        },
        // Ứng tuyển Full-stack tại Tiki — passed
        {
            application_id: 102,
            job_id: 110, student_id: 100,
            cv_url: UIT_LOGO,
            cover_letter: 'Tôi rất hứng thú với vị trí Software Engineer (Full-stack) tại Tiki. Với kỹ năng React và Node.js, tôi tin mình có thể đóng góp vào các sản phẩm e-commerce phục vụ hàng triệu người dùng.',
            status: 'passed',
            created_at: new Date('2026-05-22'),
        },
        // Ứng tuyển Backend Engineer tại VNG — interviewing
        {
            application_id: 103,
            job_id: 108, student_id: 100,
            cv_url: UIT_LOGO,
            cover_letter: 'Tôi muốn ứng tuyển vị trí Backend Engineer tại VNG. Dù background chính là Full-stack, tôi rất đam mê backend và distributed systems. Sản phẩm Zalo là nguồn cảm hứng lớn để tôi phát triển.',
            status: 'interviewing',
            created_at: new Date('2026-05-23'),
        },
        // Ứng tuyển Backend Golang tại MoMo — submitted
        {
            application_id: 104,
            job_id: 113, student_id: 100,
            cv_url: UIT_LOGO,
            cover_letter: 'Tôi rất quan tâm đến vị trí Backend Engineer tại MoMo. Tôi đang học Golang và có nền tảng vững về backend. Tôi tin rằng môi trường Fintech sẽ giúp tôi phát triển nhanh hơn.',
            status: 'submitted',
            created_at: new Date('2026-05-24'),
        },
        // Ứng tuyển DevOps tại Tech Solutions Vietnam — rejected
        {
            application_id: 105,
            job_id: 104, student_id: 100,
            cv_url: UIT_LOGO,
            cover_letter: 'Tôi muốn thử sức với vị trí DevOps tại Tech Solutions Vietnam. Tôi đã có kinh nghiệm cơ bản với Docker và đang học Kubernetes.',
            status: 'rejected',
            created_at: new Date('2026-05-25'),
        },
        // Ứng tuyển Data Analyst tại Tiki — submitted
        {
            application_id: 106,
            job_id: 111, student_id: 100,
            cv_url: UIT_LOGO,
            cover_letter: 'Tôi ứng tuyển vị trí Data Analyst tại Tiki. Dù thế mạnh chính là lập trình, tôi cũng có kiến thức SQL và Python phân tích dữ liệu từ các dự án cá nhân.',
            status: 'submitted',
            created_at: new Date('2026-05-27'),
        },

        // ===== DỮ LIỆU NỀN: các student khác (để bảng không trống) =====
        // Trần Thị B → FPT Data Engineer
        {
            application_id: 107,
            job_id: 106, student_id: 101,
            cv_url: UIT_LOGO,
            cover_letter: 'Với kinh nghiệm Python và Data Engineering, tôi tin mình phù hợp với vị trí này tại FPT.',
            status: 'submitted',
            created_at: new Date('2026-05-28'),
        },
        // Lê Văn C → FPT Flutter
        {
            application_id: 108,
            job_id: 107, student_id: 102,
            cv_url: UIT_LOGO,
            cover_letter: 'Tôi đang học Flutter và muốn thực tập tại FPT Software.',
            status: 'rejected',
            created_at: new Date('2026-04-23'),
        },
        // Hoàng Văn E → VNG Backend
        {
            application_id: 109,
            job_id: 108, student_id: 104,
            cv_url: UIT_LOGO,
            cover_letter: 'Tôi có kinh nghiệm backend và muốn tham gia team VNG.',
            status: 'submitted',
            created_at: new Date('2026-02-10'),
        },
        // Đỗ Thị J → MoMo Backend Golang
        {
            application_id: 110,
            job_id: 113, student_id: 109,
            cv_url: UIT_LOGO,
            cover_letter: 'Tôi quan tâm đến Fintech và muốn đóng góp cho hệ thống thanh toán của MoMo.',
            status: 'passed',
            created_at: new Date('2026-02-20'),
        },
        // Bùi Văn I → Tiki Data Analyst
        {
            application_id: 111,
            job_id: 111, student_id: 108,
            cv_url: UIT_LOGO,
            cover_letter: 'Tôi thành thạo SQL và Python cho data analysis, đã có kinh nghiệm thực tế với Power BI.',
            status: 'passed',
            created_at: new Date('2026-03-01'),
        },
        // Phạm Thị D → Tiki Data Analyst
        {
            application_id: 112,
            job_id: 111, student_id: 103,
            cv_url: UIT_LOGO,
            cover_letter: 'Với kỹ năng phân tích dữ liệu và SQL nâng cao, tôi phù hợp với vị trí Data Analyst tại Tiki.',
            status: 'interviewing',
            created_at: new Date('2026-04-25'),
        },
    ]);

    // 11.1 APPLICATION STATUS HISTORY
    // changed_by phía company: nếu là job của Tech Solutions (company_id 100) → user_id 2000
    console.log('📦 Thêm Application Status History...');
    await db.insert(schema.application_status_history).values([
        // App 101 (Nguyễn Văn A → Tech Solutions Backend): submitted → interviewing (bởi company@test.com)
        { application_id: 101, old_status: 'submitted', new_status: 'interviewing', changed_by: 2000, created_at: new Date('2026-03-28') },

        // App 102 (Nguyễn Văn A → Tiki Full-stack): submitted → interviewing → passed
        { application_id: 102, old_status: 'submitted', new_status: 'interviewing', changed_by: 2002, created_at: new Date('2026-03-05') },
        { application_id: 102, old_status: 'interviewing', new_status: 'passed', changed_by: 2002, created_at: new Date('2026-03-20') },

        // App 103 (Nguyễn Văn A → VNG Backend): submitted → interviewing
        { application_id: 103, old_status: 'submitted', new_status: 'interviewing', changed_by: 2001, created_at: new Date('2026-03-18') },

        // App 105 (Nguyễn Văn A → Tech Solutions DevOps): submitted → rejected (bởi company@test.com)
        { application_id: 105, old_status: 'submitted', new_status: 'rejected', changed_by: 2000, created_at: new Date('2026-01-25') },

        // App 108 (Lê Văn C → FPT Flutter): submitted → rejected
        { application_id: 108, old_status: 'submitted', new_status: 'rejected', changed_by: 1100, created_at: new Date('2026-02-01') },

        // App 110 (Đỗ Thị J → MoMo): submitted → interviewing → passed
        { application_id: 110, old_status: 'submitted', new_status: 'interviewing', changed_by: 2003, created_at: new Date('2026-03-05') },
        { application_id: 110, old_status: 'interviewing', new_status: 'passed', changed_by: 2003, created_at: new Date('2026-03-25') },

        // App 111 (Bùi Văn I → Tiki Data): submitted → interviewing → passed
        { application_id: 111, old_status: 'submitted', new_status: 'interviewing', changed_by: 2002, created_at: new Date('2026-03-15') },
        { application_id: 111, old_status: 'interviewing', new_status: 'passed', changed_by: 2002, created_at: new Date('2026-04-02') },

        // App 112 (Phạm Thị D → Tiki Data): submitted → interviewing
        { application_id: 112, old_status: 'submitted', new_status: 'interviewing', changed_by: 2002, created_at: new Date('2026-05-08') },
    ]);

    // 12. SAVED JOBS — tập trung vào student_id: 100
    console.log('📦 Thêm Saved Jobs...');
    await db.insert(schema.saved_jobs).values([
        // student_id 100 (nguyenvana) lưu nhiều job
        { student_id: 100, job_id: 108 },  // VNG Backend
        { student_id: 100, job_id: 113 },  // MoMo Backend Golang
        { student_id: 100, job_id: 110 },  // Tiki Full-stack
        { student_id: 100, job_id: 109 },  // VNG ML
        { student_id: 100, job_id: 114 },  // MoMo Data Scientist
        // Các student khác (dữ liệu nền)
        { student_id: 101, job_id: 109 },
        { student_id: 103, job_id: 114 },
        { student_id: 104, job_id: 104 },
        { student_id: 108, job_id: 111 },
    ]);

    // 13. FOLLOWED COMPANIES — tập trung vào student_id: 100
    console.log('📦 Thêm Followed Companies...');
    await db.insert(schema.followed_companies).values([
        // student_id 100 (nguyenvana) follow nhiều công ty
        { student_id: 100, company_id: 102 }, // VNG
        { student_id: 100, company_id: 103 }, // Tiki
        { student_id: 100, company_id: 104 }, // MoMo
        { student_id: 100, company_id: 101 }, // FPT
        // Các student khác (dữ liệu nền)
        { student_id: 101, company_id: 101 },
        { student_id: 101, company_id: 102 },
        { student_id: 104, company_id: 101 },
        { student_id: 105, company_id: 103 },
        { student_id: 108, company_id: 103 },
        { student_id: 109, company_id: 102 },
    ]);

    // 14. JOB VIEWS — tập trung vào student_id: 100
    console.log('📦 Thêm Job Views...');
    await db.insert(schema.job_views).values([
        // student_id 100 xem nhiều job
        { job_id: 100, student_id: 100, ip_address: '192.168.1.1', viewed_at: new Date('2026-04-08') },
        { job_id: 101, student_id: 100, ip_address: '192.168.1.1', viewed_at: new Date('2026-03-12') },
        { job_id: 108, student_id: 100, ip_address: '192.168.1.1', viewed_at: new Date('2026-05-20') },
        { job_id: 113, student_id: 100, ip_address: '192.168.1.1', viewed_at: new Date('2026-05-21') },
        { job_id: 110, student_id: 100, ip_address: '192.168.1.1', viewed_at: new Date('2026-05-23') },
        { job_id: 109, student_id: 100, ip_address: '192.168.1.1', viewed_at: new Date('2026-05-24') },
        { job_id: 104, student_id: 100, ip_address: '192.168.1.1', viewed_at: new Date('2026-01-08') },
        { job_id: 111, student_id: 100, ip_address: '192.168.1.1', viewed_at: new Date('2026-05-15') },
        // Các student khác (dữ liệu nền)
        { job_id: 109, student_id: 101, ip_address: '192.168.1.2', viewed_at: new Date('2026-05-19') },
        { job_id: 108, student_id: 104, ip_address: '192.168.1.4', viewed_at: new Date('2026-05-24') },
        { job_id: 111, student_id: 108, ip_address: '192.168.1.8', viewed_at: new Date('2026-05-25') },
        // Anonymous views
        { job_id: 100, student_id: null, ip_address: '14.225.10.1', viewed_at: new Date('2026-05-26') },
        { job_id: 105, student_id: null, ip_address: '14.225.10.2', viewed_at: new Date('2026-05-27') },
        { job_id: 108, student_id: null, ip_address: '14.225.10.3', viewed_at: new Date('2026-05-27') },
    ]);

    // 15. COMMENTS
    // Tất cả review của student đều từ student_id: 100 (nguyenvana@student.edu.vn)
    console.log('📦 Thêm Comments...');
    await db.insert(schema.comments).values([
        // Nguyễn Văn A review các công ty
        {
            student_id: 100, company_id: 100, rating: 5,
            content: 'Tech Solutions Vietnam có môi trường làm việc rất thoải mái và chuyên nghiệp. Team thân thiện, mentor nhiệt tình. Rất phù hợp cho fresh grad muốn phát triển kỹ năng Full-stack!',
        },
        {
            student_id: 100, company_id: 103, rating: 4,
            content: 'Tiki có quy trình tuyển dụng rõ ràng và chuyên nghiệp. Phỏng vấn kỹ thuật khá thử thách nhưng công bằng. Phúc lợi tốt, đặc biệt là bữa trưa miễn phí và giảm giá mua hàng.',
        },
        {
            student_id: 100, company_id: 102, rating: 5,
            content: 'VNG là nơi tuyệt vời để học hỏi về hệ thống quy mô lớn. Kỹ sư rất giỏi và sẵn lòng chia sẻ kiến thức. Codebase và kiến trúc rất ấn tượng, phỏng vấn khó nhưng xứng đáng!',
        },
        {
            student_id: 100, company_id: 104, rating: 4,
            content: 'MoMo có tech stack hiện đại và bài toán Fintech rất thú vị. Đội ngũ chuyên nghiệp, văn phòng Bình Thạnh đẹp. Lương cạnh tranh, chế độ tốt. Recommend cho ai thích Fintech!',
        },
        // Các student khác review (dữ liệu nền)
        {
            student_id: 101, company_id: 101, rating: 4,
            content: 'FPT Software đào tạo rất bài bản, phù hợp với sinh viên mới ra trường muốn học hỏi.',
        },
        {
            student_id: 109, company_id: 102, rating: 5,
            content: 'Môi trường làm việc tuyệt vời tại VNG, team kỹ sư rất giỏi. Thực tập 2024 là trải nghiệm đáng nhớ nhất!',
        },
        {
            student_id: 108, company_id: 103, rating: 3,
            content: 'Tiki ổn nhưng áp lực khá cao, deadline gấp. Phúc lợi tốt nhưng cần cân bằng work-life hơn.',
        },
    ]);

    // 16. JOB INVITATIONS
    // Tất cả lời mời gửi đến student đều dành cho student_id: 100 (nguyenvana@student.edu.vn)
    // Lời mời từ Tech Solutions (company_id 100) được gửi bởi user_id 2000 (company@test.com)
    console.log('📦 Thêm Job Invitations...');
    await db.insert(schema.job_invitations).values([
        // Tech Solutions Vietnam (company@test.com) mời Nguyễn Văn A vào job DevOps — accepted
        {
            invitation_id: 100,
            job_id: 104, student_id: 100,
            message: 'Chào Nguyễn Văn A, chúng tôi đã xem hồ sơ của bạn và rất ấn tượng với kinh nghiệm Full-stack. Tech Solutions Vietnam muốn mời bạn cân nhắc vị trí DevOps Engineer của chúng tôi. Đây là cơ hội tốt để bạn mở rộng kỹ năng sang infrastructure!',
            status: 'accepted',
        },
        // VNG mời Nguyễn Văn A vào Backend Engineer — accepted (đã nộp đơn)
        {
            invitation_id: 101,
            job_id: 108, student_id: 100,
            message: 'Chào Nguyễn Văn A, VNG Corporation đã xem xét hồ sơ của bạn và thấy rất phù hợp với vị trí Backend Engineer. Chúng tôi muốn mời bạn ứng tuyển chính thức. Hệ thống Zalo sẽ là môi trường tuyệt vời để bạn phát triển!',
            status: 'accepted',
        },
        // Tiki mời Nguyễn Văn A vào Full-stack — accepted (đã nộp đơn)
        {
            invitation_id: 102,
            job_id: 110, student_id: 100,
            message: 'Hi Văn A, Tiki muốn mời bạn ứng tuyển vị trí Software Engineer (Full-stack). Profile React + Node.js của bạn rất phù hợp với stack của chúng tôi. Join Tiki để cùng xây dựng nền tảng e-commerce số 1 Việt Nam nhé!',
            status: 'accepted',
        },
        // MoMo mời Nguyễn Văn A vào Backend Golang — pending
        {
            invitation_id: 103,
            job_id: 113, student_id: 100,
            message: 'Xin chào Nguyễn Văn A, MoMo đang tìm kiếm Backend Engineer tài năng. Chúng tôi thấy bạn có nền tảng backend vững chắc và tinh thần học hỏi tốt. Dù bạn chưa có kinh nghiệm Golang, chúng tôi sẵn sàng đào tạo nếu bạn có đam mê!',
            status: 'pending',
        },
        // Tech Solutions Vietnam (company@test.com) mời Nguyễn Văn A vào Full-stack job mới — pending
        {
            invitation_id: 104,
            job_id: 103, student_id: 100,
            message: 'Chào Văn A, ngoài vị trí Frontend bạn đã ứng tuyển, chúng tôi cũng mở vị trí Full-stack Developer mới. Với kinh nghiệm của bạn, chúng tôi nghĩ bạn sẽ fit tốt hơn với role này. Bạn có muốn cân nhắc không?',
            status: 'pending',
        },
        // FPT mời Nguyễn Văn A vào Java Developer — rejected (từ chối vì không phù hợp)
        {
            invitation_id: 105,
            job_id: 105, student_id: 100,
            message: 'Chào Nguyễn Văn A, FPT Software mời bạn ứng tuyển vị trí Java Developer. Chúng tôi có chương trình đào tạo tốt cho Fresher!',
            status: 'rejected',
        },
    ]);

    // 17. CONVERSATIONS & MESSAGES
    // Conversation chính: Tech Solutions Vietnam (company@test.com / user_id 2000) ↔ Nguyễn Văn A (user_id 100)
    console.log('📦 Thêm Conversations & Messages...');
    await db.insert(schema.conversations).values([
        // CHÍNH: Tech Solutions Vietnam ↔ Nguyễn Văn A
        {
            conversation_id: 100,
            company_id: 100, student_id: 100,
            last_message_at: new Date('2026-05-26T15:30:00'),
        },
        // VNG ↔ Nguyễn Văn A
        {
            conversation_id: 101,
            company_id: 102, student_id: 100,
            last_message_at: new Date('2026-05-25T10:00:00'),
        },
        // Tiki ↔ Nguyễn Văn A
        {
            conversation_id: 102,
            company_id: 103, student_id: 100,
            last_message_at: new Date('2026-05-24T14:00:00'),
        },
        // MoMo ↔ Nguyễn Văn A
        {
            conversation_id: 103,
            company_id: 104, student_id: 100,
            last_message_at: new Date('2026-05-20T09:00:00'),
        },
    ]);

    await db.insert(schema.conversation_participants).values([
        // Conv 100: Tech Solutions (user_id 2000) ↔ Nguyễn Văn A (user_id 100)
        { conversation_id: 100, user_id: 2000, is_hidden: false, is_blocked: false },
        { conversation_id: 100, user_id: 100, is_hidden: false, is_blocked: false, last_read_message_id: 105 },
        // Conv 101: VNG (user_id 2001) ↔ Nguyễn Văn A (user_id 100)
        { conversation_id: 101, user_id: 2001, is_hidden: false, is_blocked: false },
        { conversation_id: 101, user_id: 100, is_hidden: false, is_blocked: false, last_read_message_id: 108 },
        // Conv 102: Tiki (user_id 2002) ↔ Nguyễn Văn A (user_id 100)
        { conversation_id: 102, user_id: 2002, is_hidden: false, is_blocked: false },
        { conversation_id: 102, user_id: 100, is_hidden: false, is_blocked: false },
        // Conv 103: MoMo (user_id 2003) ↔ Nguyễn Văn A (user_id 100)
        { conversation_id: 103, user_id: 2003, is_hidden: false, is_blocked: false },
        { conversation_id: 103, user_id: 100, is_hidden: false, is_blocked: false },
    ]);

    await db.insert(schema.messages).values([
        // ===== Conv 100: Tech Solutions (2000) ↔ Nguyễn Văn A (100) — LUỒNG CHÍNH =====
        {
            message_id: 100,
            conversation_id: 100, sender_id: 2000,
            content: 'Chào Nguyễn Văn A, cảm ơn bạn đã ứng tuyển vị trí Frontend Developer tại Tech Solutions Vietnam! Chúng tôi đã xem CV của bạn và rất ấn tượng. Bạn có thể cho chúng tôi biết thêm về dự án React lớn nhất bạn từng thực hiện không?',
            created_at: new Date('2026-04-12T09:00:00'),
        },
        {
            message_id: 101,
            conversation_id: 100, sender_id: 100,
            content: 'Chào anh/chị, cảm ơn đã liên hệ! Dự án lớn nhất của em là hệ thống quản lý kho hàng real-time cho một doanh nghiệp vừa, sử dụng React + Redux Toolkit ở frontend, Node.js + Socket.io ở backend. Hệ thống xử lý được ~500 giao dịch/phút. Em có thể gửi demo link nếu anh/chị muốn xem.',
            created_at: new Date('2026-04-12T10:30:00'),
        },
        {
            message_id: 102,
            conversation_id: 100, sender_id: 2000,
            content: 'Nghe rất ấn tượng! Vui lòng gửi link demo và GitHub repo nhé. Chúng tôi muốn review code trước khi schedule phỏng vấn kỹ thuật. Dự kiến phỏng vấn vào tuần tới, bạn có thể tham gia không?',
            created_at: new Date('2026-04-13T08:00:00'),
        },
        {
            message_id: 103,
            conversation_id: 100, sender_id: 100,
            content: 'Dạ, em xin gửi link: Demo: https://warehouse-demo.vercel.app | GitHub: https://github.com/nguyenvana/warehouse-app. Em hoàn toàn available tuần tới, anh/chị có thể arrange lịch bất kỳ ngày nào từ thứ 2 đến thứ 6 nhé!',
            created_at: new Date('2026-04-13T09:15:00'),
        },
        {
            message_id: 104,
            conversation_id: 100, sender_id: 2000,
            content: 'Cảm ơn bạn! Chúng tôi đã review code và rất đánh giá cao cách bạn tổ chức component và quản lý state. Chúng tôi muốn mời bạn phỏng vấn kỹ thuật vào thứ Tư 22/04 lúc 10h00 tại văn phòng (123 Nguyễn Huệ, Q1). Bạn xác nhận được không?',
            created_at: new Date('2026-04-15T14:00:00'),
        },
        {
            message_id: 105,
            conversation_id: 100, sender_id: 100,
            content: 'Dạ em xác nhận tham gia phỏng vấn vào thứ Tư 22/04 lúc 10h00 ạ. Anh/chị có thể cho em biết vòng phỏng vấn sẽ bao gồm những gì để em chuẩn bị tốt hơn không?',
            created_at: new Date('2026-04-15T15:00:00'),
        },
        {
            message_id: 106,
            conversation_id: 100, sender_id: 2000,
            content: 'Phỏng vấn gồm 2 phần: (1) Technical ~60 phút — coding, system design cơ bản, hỏi về React/Node.js; (2) Culture fit với Team Lead ~30 phút. Bạn nhớ mang laptop nhé. Chúc bạn phỏng vấn tốt!',
            created_at: new Date('2026-04-16T09:00:00'),
        },
        {
            message_id: 107,
            conversation_id: 100, sender_id: 2000,
            content: 'Chào Văn A, sau khi phỏng vấn, team chúng tôi đánh giá rất tích cực về bạn! Chúng tôi muốn offer bạn vị trí Backend Developer (Node.js) với mức lương 18 triệu VNĐ/tháng, review sau 3 tháng. Bạn có thể cho chúng tôi biết suy nghĩ trong vòng 3 ngày không?',
            created_at: new Date('2026-05-26T15:30:00'),
        },

        // ===== Conv 101: VNG (2001) ↔ Nguyễn Văn A (100) =====
        {
            message_id: 108,
            conversation_id: 101, sender_id: 2001,
            content: 'Chào Nguyễn Văn A, VNG đã nhận được đơn ứng tuyển Backend Engineer của bạn. Chúng tôi muốn mời bạn tham gia vòng test online trước. Link test sẽ được gửi vào email trong 24h tới.',
            created_at: new Date('2026-03-05T10:00:00'),
        },
        {
            message_id: 109,
            conversation_id: 101, sender_id: 100,
            content: 'Cảm ơn VNG đã liên hệ! Em rất hào hứng với cơ hội này. Em sẽ chú ý email và hoàn thành bài test đúng hạn ạ.',
            created_at: new Date('2026-03-05T11:00:00'),
        },
        {
            message_id: 110,
            conversation_id: 101, sender_id: 2001,
            content: 'Bạn đã hoàn thành bài test rất tốt! Chúng tôi muốn mời bạn lên phỏng vấn onsite tại văn phòng VNG (182 Lê Đại Hành, Q11) vào thứ Năm 19/03 lúc 14h. Phỏng vấn gồm technical round với 2 senior engineer và system design round.',
            created_at: new Date('2026-03-15T09:00:00'),
        },
        {
            message_id: 111,
            conversation_id: 101, sender_id: 100,
            content: 'Dạ em xác nhận ạ! Em sẽ có mặt lúc 14h thứ Năm 19/03. Cảm ơn VNG rất nhiều vì cơ hội tuyệt vời này!',
            created_at: new Date('2026-03-15T10:00:00'),
        },

        // ===== Conv 102: Tiki (2002) ↔ Nguyễn Văn A (100) =====
        {
            message_id: 112,
            conversation_id: 102, sender_id: 2002,
            content: 'Hi Văn A! Tiki đã xem xét hồ sơ và muốn thông báo bạn đã pass vòng CV screening. Chúc mừng! Bước tiếp theo là vòng technical interview. Bạn available vào tuần tới không?',
            created_at: new Date('2026-02-25T08:00:00'),
        },
        {
            message_id: 113,
            conversation_id: 102, sender_id: 100,
            content: 'Cảm ơn Tiki! Em rất vui khi biết mình pass vòng CV. Em hoàn toàn available tuần tới, anh/chị cứ arrange lịch nhé ạ.',
            created_at: new Date('2026-02-25T09:00:00'),
        },
        {
            message_id: 114,
            conversation_id: 102, sender_id: 2002,
            content: 'Tuyệt! Chúng tôi đã cân nhắc kỹ và muốn offer bạn vị trí Software Engineer với mức 22 triệu/tháng, kèm stock options sau 1 năm. Thời gian bắt đầu linh hoạt. Bạn có muốn thảo luận thêm không?',
            created_at: new Date('2026-05-24T14:00:00'),
        },

        // ===== Conv 103: MoMo (2003) ↔ Nguyễn Văn A (100) =====
        {
            message_id: 115,
            conversation_id: 103, sender_id: 2003,
            content: 'Chào Nguyễn Văn A, MoMo đã nhận đơn ứng tuyển Backend Engineer Golang của bạn. Dù bạn chưa có nhiều kinh nghiệm Golang, chúng tôi thấy nền tảng backend của bạn rất tốt. Bạn có thể chia sẻ về kinh nghiệm làm việc với RESTful API và database của mình không?',
            created_at: new Date('2026-05-05T09:00:00'),
        },
        {
            message_id: 116,
            conversation_id: 103, sender_id: 100,
            content: 'Cảm ơn MoMo đã xem xét đơn của em! Em đã xây dựng nhiều REST API với Node.js, có kinh nghiệm với PostgreSQL và MongoDB. Em cũng tự học Golang được 2 tháng và đã build một số CLI tools. Em rất hứng thú với bài toán payment system của MoMo!',
            created_at: new Date('2026-05-05T10:30:00'),
        },
        {
            message_id: 117,
            conversation_id: 103, sender_id: 2003,
            content: 'Cảm ơn bạn đã chia sẻ! Tinh thần tự học Golang rất đáng khích lệ. Chúng tôi sẽ review và liên hệ lại trong 1 tuần tới nhé.',
            created_at: new Date('2026-05-20T09:00:00'),
        },
    ]);

    // 18. NOTIFICATIONS — tập trung vào user_id: 100 (student), 2000 (company), 1000 (admin)
    console.log('📦 Thêm Notifications...');
    await db.insert(schema.notifications).values([
        // ===== Thông báo cho Nguyễn Văn A (user_id: 100) =====
        {
            user_id: 100, type: 'application_status',
            title: 'Tech Solutions Vietnam mời bạn phỏng vấn!',
            message: 'Đơn ứng tuyển Backend Developer (Node.js) của bạn đã được chuyển sang trạng thái Phỏng vấn. Kiểm tra tin nhắn để biết thêm chi tiết!',
            link: '/applications/101', is_read: true,
        },
        {
            user_id: 100, type: 'application_status',
            title: 'Chúc mừng! Bạn đã pass phỏng vấn tại Tiki!',
            message: 'Tiki Corporation xác nhận bạn đã vượt qua tất cả các vòng phỏng vấn cho vị trí Software Engineer. Tiki sẽ sớm gửi offer letter cho bạn!',
            link: '/applications/102', is_read: true,
        },
        {
            user_id: 100, type: 'application_status',
            title: 'Cập nhật đơn ứng tuyển DevOps',
            message: 'Đơn ứng tuyển vị trí DevOps Engineer tại Tech Solutions Vietnam chưa phù hợp lần này. Đừng nản lòng, hãy thử các vị trí phù hợp hơn!',
            link: '/applications/105', is_read: true,
        },
        {
            user_id: 100, type: 'job_invitation',
            title: 'VNG gửi lời mời ứng tuyển',
            message: 'VNG Corporation mời bạn ứng tuyển vị trí Backend Engineer (Go/Python). Đây là cơ hội tuyệt vời để làm việc với hệ thống triệu người dùng!',
            link: '/invitations/101', is_read: true,
        },
        {
            user_id: 100, type: 'job_invitation',
            title: 'MoMo gửi lời mời ứng tuyển',
            message: 'MoMo (M_Service) mời bạn ứng tuyển vị trí Backend Engineer Golang. Xem chi tiết và phản hồi ngay!',
            link: '/invitations/103', is_read: false,
        },
        {
            user_id: 100, type: 'new_message',
            title: 'Tech Solutions Vietnam gửi offer!',
            message: 'Bạn có tin nhắn quan trọng từ Tech Solutions Vietnam về offer thư. Đừng bỏ lỡ!',
            link: '/conversations/100', is_read: false,
        },
        {
            user_id: 100, type: 'new_message',
            title: 'Tiki gửi tin nhắn mới',
            message: 'Tiki Corporation vừa gửi thông tin về offer lương. Kiểm tra ngay!',
            link: '/conversations/102', is_read: false,
        },
        {
            user_id: 100, type: 'job_recommendation',
            title: 'Có 5 việc làm mới phù hợp với bạn',
            message: 'Dựa trên kỹ năng React và Node.js của bạn, hệ thống tìm thấy 5 vị trí Full-stack/Backend mới từ các công ty hàng đầu. Xem ngay!',
            link: '/jobs?skills=react,nodejs', is_read: false,
        },

        // ===== Thông báo cho company@test.com (user_id: 2000) =====
        {
            user_id: 2000, type: 'job_approved',
            title: 'Tin "Frontend Developer (React)" đã được duyệt',
            message: 'Admin đã duyệt tin tuyển dụng Frontend Developer (React). Tin đang được hiển thị và đã nhận được 15 đơn ứng tuyển!',
            link: '/company/jobs/100', is_read: true,
        },
        {
            user_id: 2000, type: 'job_approved',
            title: 'Tin "Backend Developer (Node.js)" đã được duyệt',
            message: 'Tin tuyển dụng Backend Developer (Node.js) đã được admin duyệt và đang hiển thị trên hệ thống.',
            link: '/company/jobs/101', is_read: true,
        },
        {
            user_id: 2000, type: 'system',
            title: 'Tin "UI/UX Designer" bị từ chối duyệt',
            message: 'Admin đã từ chối tin tuyển dụng UI/UX Designer. Lý do: Mô tả công việc chưa đủ chi tiết. Vui lòng chỉnh sửa và gửi lại.',
            link: '/company/jobs/102', is_read: false,
        },
        {
            user_id: 2000, type: 'new_message',
            title: 'Nguyễn Văn A phản hồi offer thư',
            message: 'Ứng viên Nguyễn Văn A vừa gửi phản hồi về offer. Kiểm tra ngay để không bỏ lỡ!',
            link: '/conversations/100', is_read: false,
        },
        {
            user_id: 2000, type: 'application_status',
            title: 'Có 7 đơn ứng tuyển mới hôm nay',
            message: 'Tin tuyển dụng Frontend Developer nhận được 7 đơn ứng tuyển mới trong 24h qua. Xem và xử lý ngay!',
            link: '/company/applications', is_read: false,
        },

        // ===== Thông báo cho admin@test.com (user_id: 1000) =====
        {
            user_id: 1000, type: 'system',
            title: 'Startup XYZ chờ duyệt hồ sơ công ty',
            message: 'Công ty Startup XYZ đã đăng ký và đang chờ admin duyệt. Vui lòng xem xét hồ sơ.',
            link: '/admin/companies/105', is_read: false,
        },
        {
            user_id: 1000, type: 'system',
            title: 'Có 2 tin tuyển dụng mới chờ duyệt',
            message: 'FPT Software và Tiki Corporation vừa đăng tin tuyển dụng mới, đang chờ admin phê duyệt.',
            link: '/admin/jobs?status=pending', is_read: false,
        },
        {
            user_id: 1000, type: 'system',
            title: 'Báo cáo hệ thống tuần 22/2026',
            message: 'Tổng kết tuần: 18 đơn ứng tuyển mới, 3 công ty mới đăng ký, 5 tin tuyển dụng cần duyệt. Xem báo cáo chi tiết.',
            link: '/admin/statistics', is_read: true,
        },
    ]);

    // 19. SEARCH HISTORY — tập trung vào student_id: 100
    console.log('📦 Thêm Search History...');
    await db.insert(schema.search_history).values([
        { student_id: 100, search_query: 'frontend developer react hcm', filters: { city: 'TP.HCM', experience_level: 'Junior' }, results_count: 5 },
        { student_id: 100, search_query: 'full-stack nodejs junior', filters: { salary_min: 15000000 }, results_count: 8 },
        { student_id: 100, search_query: 'backend engineer golang fintech', filters: { city: 'TP.HCM' }, results_count: 3 },
        { student_id: 100, search_query: 'software engineer product company', filters: { salary_min: 18000000 }, results_count: 6 },
        { student_id: 100, search_query: 'devops engineer docker kubernetes', filters: { experience_level: 'Junior' }, results_count: 4 },
        // Dữ liệu nền
        { student_id: 101, search_query: 'machine learning engineer', filters: { city: 'TP.HCM' }, results_count: 3 },
        { student_id: 109, search_query: 'backend engineer golang senior', filters: { salary_min: 20000000 }, results_count: 4 },
    ]);

    // 20. SAVED SEARCHES — tập trung vào student_id: 100
    console.log('📦 Thêm Saved Searches...');
    await db.insert(schema.saved_searches).values([
        { student_id: 100, search_name: 'React/Node Jobs HCM', search_query: 'react nodejs developer', filters: { city: 'TP.HCM' }, is_alert_enabled: true },
        { student_id: 100, search_name: 'Backend Engineer Junior', search_query: 'backend engineer junior', filters: { salary_min: 15000000, experience_level: 'Junior' }, is_alert_enabled: true },
        { student_id: 100, search_name: 'Full-stack Product Company', search_query: 'full-stack software engineer', filters: { city: 'TP.HCM', salary_min: 18000000 }, is_alert_enabled: false },
        // Dữ liệu nền
        { student_id: 101, search_name: 'AI/ML Opportunities', search_query: 'machine learning ai engineer', filters: { salary_min: 20000000 }, is_alert_enabled: true },
    ]);

    console.log('\n✅ Hoàn thành Seeding! Database đã sẵn sàng.');
    console.log('📊 Tổng kết:');
    console.log('   👤 3 tài khoản trọng tâm:');
    console.log('      - admin@test.com (user_id: 1000) — nhận thông báo quản trị');
    console.log('      - company@test.com (user_id: 2000, company_id: 100) — Tech Solutions Vietnam');
    console.log('        → Có 5 job postings (2 approved, 1 rejected, 1 pending, 1 approved)');
    console.log('        → Xử lý đơn của student_id 100, gửi lời mời, nhắn tin, nhận thông báo');
    console.log('      - nguyenvana@student.edu.vn (user_id: 100, student_id: 100)');
    console.log('        → 7 đơn ứng tuyển (submitted/interviewing/passed/rejected)');
    console.log('        → 6 lời mời ứng tuyển từ các công ty');
    console.log('        → 4 cuộc hội thoại với 18 tin nhắn');
    console.log('        → 4 comment đánh giá công ty');
    console.log('        → 5 saved jobs, 4 followed companies, 8 job views');
    console.log('   🏢 6 Companies: 5 APPROVED, 1 PENDING');
    console.log('   📋 18 Job Postings: 13 approved, 3 pending, 1 rejected, 1 approved (TSV DevOps)');
    console.log('   📝 12 Applications tổng (7 của student_id 100)');
    console.log('   💬 4 Conversations, 18 Messages');
    console.log('   🔔 16 Notifications (8 cho student 100, 5 cho company 2000, 3 cho admin 1000)');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Lỗi Seeding:', err);
    process.exit(1);
});