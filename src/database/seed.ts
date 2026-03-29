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
    await db.delete(schema.student_skills);
    await db.delete(schema.students);
    await db.delete(schema.users);
    await db.delete(schema.skills);
    await db.delete(schema.majors);
    await db.delete(schema.roles);

    // 2. Thêm ROLES (Độc lập)
    console.log('📦 Thêm Roles...');
    await db.insert(schema.roles).values([
        { role_id: 1, role_name: 'admin', description: 'Quản trị viên hệ thống' },
        { role_id: 2, role_name: 'company', description: 'Nhà tuyển dụng' },
        { role_id: 3, role_name: 'student', description: 'Sinh viên/Ứng viên' },
    ]);

    // 3. Thêm MAJORS (Độc lập)
    console.log('📦 Thêm Majors...');
    await db.insert(schema.majors).values([
        { major_id: 1, major_code: 'IT01', major_name: 'Công nghệ thông tin', description: 'Ngành học vua của mọi nghề' },
    ]);

    // 4. Thêm SKILLS (Độc lập)
    console.log('📦 Thêm Skills...');
    await db.insert(schema.skills).values([
        { skill_id: 1, skill_name: 'React' },
        { skill_id: 2, skill_name: 'Node.js' },
        { skill_id: 3, skill_name: 'TypeScript' },
    ]);

    // 5. Thêm USERS (Phụ thuộc vào Roles)
    console.log('📦 Thêm Users...');
    await db.insert(schema.users).values([
        { user_id: 1000, email: 'admin@test.com', password_hash: '$2a$10$IQHd4uBdkCS7hoV4uVDI1OCfW7aq.3kCd6ca4ZeqfCJkTniPRp5lO', role_id: 1 },
        { user_id: 2000, email: 'company@test.com', password_hash: '$2a$10$BukqDjmK.Nc.AMG8yZxN6O8mqPR/s5fmq8ZMFNiEXYIL5lJMsb8Jm', role_id: 2 },
        { user_id: 3000, email: 'student@test.com', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3 },
        { user_id: 4000, email: 'test@example.com', password_hash: '$2a$10$IQHd4uBdkCS7hoV4uVDI1OCfW7aq.3kCd6ca4ZeqfCJkTniPRp5lO.', role_id: 1 },
        { user_id: 1100, email: 'sang22102005@gmail.com', password_hash: '$2b$10$z4alfCAmpcYnmDZMi/9g6ewB0NdDBvHODzqsJ27pOK9uHQGnXr.ja', role_id: 2, oauth_provider: 'google', oauth_provider_id: '100844144305870518667' },
        { user_id: 1200, email: '23521348@gm.uit.edu.vn', password_hash: null, role_id: null, oauth_provider: 'google', oauth_provider_id: '102693512867141333079' },
        { user_id: 100, email: 'nguyenvana@student.edu.vn', password_hash: '$2a$10$xe9KZlyOBaigKLeFpJomZ.gLhDTIVt9jsSaL9/iRttPSqwjpfoSiW', role_id: 3 },
    ]);

    // 6. Thêm STUDENTS (Phụ thuộc vào Users và Majors)
    console.log('📦 Thêm Students...');
    await db.insert(schema.students).values([
        {
            student_id: 100,
            user_id: 100,
            student_code: '2021601234',
            full_name: 'Nguyễn Văn A',
            phone: '0912345678',
            email_student: 'nguyenvana@student.edu.vn',
            major_id: 1,
            enrollment_year: 2021,
            current_year: 4,
            gpa: '3.45',
            is_open_to_work: true,
            student_status: 'STUDYING',
        },
    ]);

    // 7. Thêm STUDENT_SKILLS (Phụ thuộc vào Students và Skills)
    console.log('📦 Thêm Student_Skills...');
    await db.insert(schema.student_skills).values([
        { student_id: 100, skill_id: 1 },
        { student_id: 100, skill_id: 2 },
        { student_id: 100, skill_id: 3 },
    ]);

    console.log('✅ Hoàn thành Seeding! Dữ liệu đã sẵn sàng trong Docker.');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Lỗi Seeding:', err);
    process.exit(1);
});