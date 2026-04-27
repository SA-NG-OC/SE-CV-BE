import {
    pgTable,
    serial,
    varchar,
    text,
    boolean,
    timestamp,
    integer,
    date,
    decimal,
    jsonb,
    uniqueIndex,
    index,
    pgEnum,
    primaryKey,
    customType
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const vector = customType<{ data: number[]; driverData: string }>({
    dataType() {
        return "vector(1536)";
    },
    toDriver(value: number[]): string {
        return `[${value.join(",")}]`;
    },
    fromDriver(value: string): number[] {
        return value.slice(1, -1).split(",").map(Number);
    },
});

export const job_embeddings = pgTable("job_embeddings", {
    embedding_id: serial("embedding_id").primaryKey(),
    job_id: integer("job_id")
        .unique()
        .references(() => job_postings.job_id, { onDelete: "cascade" }),
    embedding: vector("embedding").notNull(),
    content_hash: text("content_hash").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});

export const student_embeddings = pgTable("student_embeddings", {
    embedding_id: serial("embedding_id").primaryKey(),
    student_id: integer("student_id")
        .unique()
        .references(() => students.student_id, { onDelete: "cascade" }),
    embedding: vector("embedding").notNull(),
    content_hash: text("content_hash").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});

// =============================================
// 1. BẢNG NGƯỜI DÙNG VÀ PHÂN QUYỀN
// =============================================

export const roles = pgTable("roles", {
    role_id: serial("role_id").primaryKey(),
    role_name: varchar("role_name", { length: 50 }).unique().notNull(),
    description: text("description"),
    created_at: timestamp("created_at").defaultNow(),
});

export const users = pgTable(
    "users",
    {
        user_id: serial("user_id").primaryKey(),
        email: varchar("email", { length: 255 }).unique().notNull(),
        password_hash: varchar("password_hash", { length: 255 }),
        role_id: integer("role_id").references(() => roles.role_id),
        is_active: boolean("is_active").default(true),
        is_verified: boolean("is_verified").default(false),
        verification_token: varchar("verification_token", { length: 255 }),
        reset_token: varchar("reset_token", { length: 255 }),
        reset_token_expires: timestamp("reset_token_expires"),
        last_login: timestamp("last_login"),
        created_at: timestamp("created_at").defaultNow(),
        updated_at: timestamp("updated_at").defaultNow(),
        oauth_provider: varchar('oauth_provider', { length: 50 }),   // 'google', 'github',...
        oauth_provider_id: varchar('oauth_provider_id', { length: 255 }),
        //avatar_url: varchar('avatar_url', { length: 500 }),
        //full_name: varchar('full_name', { length: 255 }),
    },
    (t) => [
        index("idx_users_email").on(t.email),
        index("idx_users_role").on(t.role_id),
    ]
);

// =============================================
// 2. BẢNG DOANH NGHIỆP
// =============================================

export const companyStatusEnum = pgEnum("company_status", [
    "PENDING",    // Chờ duyệt
    "APPROVED",   // Đã duyệt
    "REJECTED",   // Bị từ chối
    "RESTRICTED"  // Bị hạn chế
]);

export const companies = pgTable(
    "companies",
    {
        company_id: serial("company_id").primaryKey(),
        user_id: integer("user_id")
            .unique()
            .notNull()
            .references(() => users.user_id, { onDelete: "cascade" }),
        company_name: varchar("company_name", { length: 255 }).notNull(),
        industry: varchar("industry", { length: 100 }),
        slogan: varchar("slogan", { length: 100 }),
        company_size: varchar("company_size", { length: 50 }),
        website: varchar("website", { length: 255 }),
        logo_url: varchar("logo_url", { length: 500 }),
        cover_image_url: varchar("cover_image_url", { length: 500 }),
        description: text("description"),
        address: text("address"),
        contact_email: varchar("contact_email", { length: 255 }),
        contact_phone: varchar("contact_phone", { length: 20 }),
        status: companyStatusEnum("status").default("PENDING").notNull(),
        admin_note: text("admin_note"),
        rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
        total_jobs_posted: integer("total_jobs_posted").default(0),
        total_followers: integer("total_followers").default(0),
        created_at: timestamp("created_at").defaultNow(),
        updated_at: timestamp("updated_at").defaultNow(),
    },
    (t) => [
        index("idx_companies_user_id").on(t.user_id),
        index("idx_companies_status").on(t.status),
        index("idx_companies_fulltext").using(
            "gin",
            sql`to_tsvector('english', ${t.company_name} || ' ' || coalesce(${t.description}, ''))`
        ),
    ]
);

export const company_images = pgTable("company_images", {
    image_id: serial("image_id").primaryKey(),
    company_id: integer("company_id")
        .notNull()
        .references(() => companies.company_id, { onDelete: "cascade" }),
    image_url: varchar("image_url", { length: 500 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
});

export const followed_companies = pgTable(
    "followed_companies",
    {
        follow_id: serial("follow_id").primaryKey(),
        student_id: integer("student_id")
            .notNull()
            .references(() => students.student_id, { onDelete: "cascade" }),
        company_id: integer("company_id")
            .notNull()
            .references(() => companies.company_id, { onDelete: "cascade" }),
        created_at: timestamp("created_at").defaultNow(),
    },
    (t) => [
        // Đảm bảo một sinh viên không thể theo dõi một công ty nhiều lần
        uniqueIndex("uq_student_company_follow").on(t.student_id, t.company_id),
        // Index để tối ưu hóa truy vấn tìm kiếm
        index("idx_followed_companies_student").on(t.student_id),
        index("idx_followed_companies_company").on(t.company_id),
    ]
);

// =============================================
// 3. BẢNG SINH VIÊN
// =============================================
export const studentStatusEnum = pgEnum("student_status", [
    "STUDYING",     // đang học
    "GRADUATED",    // đã tốt nghiệp
    "DROPPED_OUT",  // dừng học
]);

export const majors = pgTable("majors", {
    major_id: serial("major_id").primaryKey(),
    major_code: varchar("major_code", { length: 20 }).unique().notNull(),
    major_name: varchar("major_name", { length: 255 }).notNull(),
    description: text("description"),
    created_at: timestamp("created_at").defaultNow(),
});

export const students = pgTable(
    "students",
    {
        student_id: serial("student_id").primaryKey().notNull(),
        user_id: integer("user_id")
            .unique()
            .references(() => users.user_id, { onDelete: "cascade" }),
        student_code: varchar("student_code", { length: 20 }).unique().notNull(),
        full_name: varchar("full_name", { length: 255 }).notNull(),
        date_of_birth: date("date_of_birth"),
        gender: varchar("gender", { length: 10 }),
        phone: varchar("phone", { length: 20 }),
        avatar_url: varchar("avatar_url", { length: 500 }),
        address: text("address"),
        email_student: text("email_student"),
        major_id: integer("major_id").references(() => majors.major_id),
        enrollment_year: integer("enrollment_year"),
        expected_graduation_year: integer("expected_graduation_year"),
        current_year: integer("current_year"),
        student_status: studentStatusEnum("student_status")
            .default("STUDYING")
            .notNull(),
        gpa: decimal("gpa", { precision: 3, scale: 2 }),
        bio: text("bio"),
        career_goals: text("career_goals"),
        linkedin_url: varchar("linkedin_url", { length: 255 }),
        github_url: varchar("github_url", { length: 255 }),
        portfolio_url: varchar("portfolio_url", { length: 255 }),
        desired_position: varchar("desired_position", { length: 255 }),
        desired_salary_min: integer("desired_salary_min"),
        desired_salary_max: integer("desired_salary_max"),
        desired_location: varchar("desired_location", { length: 255 }),
        work_type: varchar("work_type", { length: 50 }),
        is_open_to_work: boolean("is_open_to_work").default(false),
        created_at: timestamp("created_at").defaultNow(),
        updated_at: timestamp("updated_at").defaultNow(),
    },
    (t) => [
        index("idx_students_user_id").on(t.user_id),
        index("idx_students_code").on(t.student_code),
        index("idx_students_major").on(t.major_id),
        index("idx_students_graduation_year").on(t.expected_graduation_year),
    ]
);

export const student_resumes = pgTable("student_resumes", {
    resume_id: serial("resume_id").primaryKey(),
    student_id: integer("student_id").references(() => students.student_id, { onDelete: "cascade" }),
    resume_name: varchar("resume_name", { length: 255 }).notNull(),
    cv_url: varchar("cv_url", { length: 500 }).notNull(),
    is_default: boolean("is_default").default(false),
    created_at: timestamp("created_at").defaultNow(),
});

export const student_skills = pgTable(
    "student_skills",
    {
        student_id: integer("student_id").references(() => students.student_id, { onDelete: "cascade" }),
        skill_id: integer("skill_id").references(() => skills.skill_id, { onDelete: "cascade" }),
        proficiency_level: varchar("proficiency_level", { length: 50 }),
        created_at: timestamp("created_at").defaultNow(),
    },
    (t) => [
        primaryKey({ columns: [t.student_id, t.skill_id] }),
        index("idx_student_skills_student").on(t.student_id),
        index("idx_student_skills_skill").on(t.skill_id),
    ]
);

export const skills = pgTable("skills", {
    skill_id: serial("skill_id").primaryKey(),
    skill_name: varchar("skill_name", { length: 100 }).unique().notNull(),
    created_at: timestamp("created_at").defaultNow(),
});

// =============================================
// 4. BẢNG TIN TUYỂN DỤNG
// =============================================

export const jobStatusEnum = pgEnum("job_status", [
    "pending",
    "approved",
    "rejected",
    "restricted"
]);

export const job_categories = pgTable("job_categories", {
    category_id: serial("category_id").primaryKey(),
    category_name: varchar("category_name", { length: 100 }).unique().notNull(),
    is_active: boolean("is_active").default(true).notNull(),
    created_at: timestamp("created_at").defaultNow(),
});

export const job_postings = pgTable(
    "job_postings",
    {
        job_id: serial("job_id").primaryKey(),
        company_id: integer("company_id").references(() => companies.company_id, {
            onDelete: "cascade",
        }),
        category_id: integer("category_id").references(
            () => job_categories.category_id
        ),
        job_title: varchar("job_title", { length: 255 }).notNull(),
        job_description: text("job_description").notNull(),
        requirements: text("requirements").notNull(),
        benefits: text("benefits"),
        experience_level: varchar("experience_level", { length: 50 }),
        position_level: varchar("position_level", { length: 50 }),
        number_of_positions: integer("number_of_positions").default(1),
        salary_min: integer("salary_min"),
        salary_max: integer("salary_max"),
        salary_type: varchar("salary_type", { length: 20 }),
        is_salary_negotiable: boolean("is_salary_negotiable").default(true),
        city: varchar("city", { length: 100 }),
        application_deadline: date("application_deadline"),
        status: jobStatusEnum("status").default("pending"),
        is_active: boolean("is_active").default(true).notNull(),
        application_count: integer("application_count").default(0),
        admin_notes: text("admin_notes"),
        approved_by: integer("approved_by").references(() => users.user_id),
        approved_at: timestamp("approved_at"),
        created_at: timestamp("created_at").defaultNow(),
        updated_at: timestamp("updated_at").defaultNow(),
    },
    (t) => [
        index("idx_jobs_is_active").on(t.is_active),
        index("idx_jobs_company").on(t.company_id),
        index("idx_jobs_category").on(t.category_id),
        index("idx_jobs_status").on(t.status),
        index("idx_jobs_deadline").on(t.application_deadline),
        index("idx_jobs_city").on(t.city),
        index("idx_jobs_created_at").on(t.created_at),
        index("idx_jobs_fulltext").using(
            "gin",
            sql`to_tsvector('simple', coalesce(${t.job_title}, '') || ' ' || coalesce(${t.job_description}, '') || ' ' || coalesce(${t.requirements}, ''))`
        ),
    ]
);

export const job_required_skills = pgTable(
    "job_required_skills",
    {
        job_skill_id: serial("job_skill_id").primaryKey(),
        job_id: integer("job_id").references(() => job_postings.job_id, {
            onDelete: "cascade",
        }),
        skill_id: integer("skill_id").references(() => skills.skill_id, {
            onDelete: "cascade",
        }),
        created_at: timestamp("created_at").defaultNow(),
    },
    (t) => [
        uniqueIndex("uq_job_skill").on(t.job_id, t.skill_id),
        index("idx_job_skills_job").on(t.job_id),
        index("idx_job_skills_skill").on(t.skill_id),
    ]
);

// =============================================
// 5. BẢNG ỨNG TUYỂN
// =============================================

export const applicationStatusEnum = pgEnum("application_status", [
    "submitted",     // chờ duyệt (default)
    "interviewing",  // hẹn phỏng vấn
    "passed",        // đã đậu
    "rejected",      // Rớt phỏng vấn
]);

export const applications = pgTable(
    "applications",
    {
        application_id: serial("application_id").primaryKey(),
        job_id: integer("job_id").references(() => job_postings.job_id, {
            onDelete: "cascade",
        }),
        student_id: integer("student_id").references(() => students.student_id, {
            onDelete: "cascade",
        }),
        cv_url: varchar("cv_url", { length: 500 }).notNull(),
        cover_letter: text("cover_letter"),
        status: applicationStatusEnum("status").default("submitted").notNull(),
        created_at: timestamp("created_at").defaultNow().notNull(),
        updated_at: timestamp("updated_at").defaultNow(),
    },
    (t) => [
        uniqueIndex("uq_application_job_student").on(t.job_id, t.student_id),
        index("idx_applications_job").on(t.job_id),
        index("idx_applications_student").on(t.student_id),
        index("idx_applications_status").on(t.status),
        index("idx_applications_created_at").on(t.created_at),
    ]
);

export const application_status_history = pgTable(
    "application_status_history",
    {
        history_id: serial("history_id").primaryKey(),
        application_id: integer("application_id").references(
            () => applications.application_id,
            { onDelete: "cascade" }
        ),
        old_status: varchar("old_status", { length: 50 }),
        new_status: varchar("new_status", { length: 50 }),
        changed_by: integer("changed_by").references(() => users.user_id),
        created_at: timestamp("created_at").defaultNow(),
    }
);

// =============================================
// 5.1. BẢNG LỜI MỜI ỨNG TUYỂN
// =============================================

export const invitationStatusEnum = pgEnum("invitation_status", [
    "pending",   // Đang chờ ứng viên phản hồi
    "accepted",  // Ứng viên đã chấp nhận và nộp đơn
    "rejected",  // Ứng viên từ chối lời mời
    "expired"    // Lời mời hết hạn (nếu tin tuyển dụng đóng)
]);

export const job_invitations = pgTable(
    "job_invitations",
    {
        invitation_id: serial("invitation_id").primaryKey(),
        job_id: integer("job_id")
            .notNull()
            .references(() => job_postings.job_id, { onDelete: "cascade" }),
        student_id: integer("student_id")
            .notNull()
            .references(() => students.student_id, { onDelete: "cascade" }),
        message: text("message"),
        status: invitationStatusEnum("status").default("pending").notNull(),
        created_at: timestamp("created_at").defaultNow().notNull(),
        updated_at: timestamp("updated_at").defaultNow().notNull(),
    },
    (t) => [
        index("idx_invitations_student").on(t.student_id),
        uniqueIndex("uq_job_student_invitation").on(t.job_id, t.student_id),
    ]
);

// =============================================
// 6. BẢNG TÌM KIẾM VÀ GỢI Ý
// =============================================

export const search_history = pgTable("search_history", {
    search_id: serial("search_id").primaryKey(),
    student_id: integer("student_id").references(() => students.student_id, {
        onDelete: "cascade",
    }),
    search_query: text("search_query"),
    filters: jsonb("filters"),
    results_count: integer("results_count"),
    created_at: timestamp("created_at").defaultNow(),
});

export const saved_searches = pgTable("saved_searches", {
    saved_search_id: serial("saved_search_id").primaryKey(),
    student_id: integer("student_id").references(() => students.student_id, {
        onDelete: "cascade",
    }),
    search_name: varchar("search_name", { length: 255 }),
    search_query: text("search_query"),
    filters: jsonb("filters"),
    is_alert_enabled: boolean("is_alert_enabled").default(false),
    created_at: timestamp("created_at").defaultNow(),
});

export const saved_jobs = pgTable(
    "saved_jobs",
    {
        saved_job_id: serial("saved_job_id").primaryKey(),
        student_id: integer("student_id").references(() => students.student_id, {
            onDelete: "cascade",
        }),
        job_id: integer("job_id").references(() => job_postings.job_id, {
            onDelete: "cascade",
        }),
        notes: text("notes"),
        created_at: timestamp("created_at").defaultNow(),
    },
    (t) => [uniqueIndex("uq_saved_job_student").on(t.student_id, t.job_id)]
);

export const job_views = pgTable("job_views", {
    view_id: serial("view_id").primaryKey(),
    job_id: integer("job_id").references(() => job_postings.job_id, {
        onDelete: "cascade",
    }),
    student_id: integer("student_id").references(() => students.student_id, {
        onDelete: "set null",
    }),
    ip_address: varchar("ip_address", { length: 45 }),
    user_agent: text("user_agent"),
    viewed_at: timestamp("viewed_at").defaultNow(),
});

// =============================================
// 7. BẢNG THÔNG BÁO
// =============================================

export const notifications = pgTable(
    "notifications",
    {
        notification_id: serial("notification_id").primaryKey(),
        user_id: integer("user_id").references(() => users.user_id, {
            onDelete: "cascade",
        }),
        type: varchar("type", { length: 50 }),
        title: varchar("title", { length: 255 }).notNull(),
        message: text("message").notNull(),
        link: varchar("link", { length: 500 }),
        is_read: boolean("is_read").default(false),
        created_at: timestamp("created_at").defaultNow(),
    },
    (t) => [
        index("idx_notifications_user").on(t.user_id),
        index("idx_notifications_read").on(t.is_read),
    ]
);

// =============================================
// 8. BẢNG HỆ THỐNG VÀ CẤU HÌNH
// =============================================

export const system_settings = pgTable("system_settings", {
    setting_id: serial("setting_id").primaryKey(),
    setting_key: varchar("setting_key", { length: 100 }).unique().notNull(),
    setting_value: text("setting_value"),
    description: text("description"),
});

export const reports = pgTable("reports", {
    report_id: serial("report_id").primaryKey(),
    reporter_id: integer("reporter_id").references(() => users.user_id),
    reported_type: varchar("reported_type", { length: 50 }),
    reported_id: integer("reported_id"),
    reason: varchar("reason", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).default("pending"),
    resolved_by: integer("resolved_by").references(() => users.user_id),
    resolution_notes: text("resolution_notes"),
    created_at: timestamp("created_at").defaultNow(),
    resolved_at: timestamp("resolved_at"),
});

export const blacklist = pgTable("blacklist", {
    blacklist_id: serial("blacklist_id").primaryKey(),
    entity_type: varchar("entity_type", { length: 50 }),
    entity_id: integer("entity_id"),
    reason: text("reason").notNull(),
    added_by: integer("added_by").references(() => users.user_id),
    expires_at: timestamp("expires_at"),
    created_at: timestamp("created_at").defaultNow(),
});

// =============================================
// 9. BẢNG THỐNG KÊ VÀ BÁO CÁO
// =============================================

export const daily_statistics = pgTable("daily_statistics", {
    stat_id: serial("stat_id").primaryKey(),
    stat_date: date("stat_date").unique().notNull(),
    new_jobs: integer("new_jobs").default(0),
    new_applications: integer("new_applications").default(0),
    new_companies: integer("new_companies").default(0),
    new_students: integer("new_students").default(0),
    total_job_views: integer("total_job_views").default(0),
    created_at: timestamp("created_at").defaultNow(),
});

// =============================================
// 10. COMMENT ĐÁNH GIÁ CÔNG TY
// =============================================

export const comments = pgTable('comments', {
    id: serial('id').primaryKey(),
    student_id: integer('student_id').references(() => students.student_id, { onDelete: 'cascade' }).notNull(),
    company_id: integer('company_id').references(() => companies.company_id, { onDelete: 'cascade' }).notNull(),
    rating: integer('rating').notNull(), // 1 - 5 sao
    content: text('content').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
});
// =============================================
// RELATIONS
// =============================================

export const rolesRelations = relations(roles, ({ many }) => ({
    users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    role: one(roles, { fields: [users.role_id], references: [roles.role_id] }),
    company: one(companies),
    student: one(students),
    notifications: many(notifications),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
    user: one(users, {
        fields: [companies.user_id],
        references: [users.user_id],
    }),
    images: many(company_images),
    job_postings: many(job_postings),
    followers: many(followed_companies),
    comments: many(comments),
}));

export const followedCompaniesRelations = relations(followed_companies, ({ one }) => ({
    student: one(students, {
        fields: [followed_companies.student_id],
        references: [students.student_id],
    }),
    company: one(companies, {
        fields: [followed_companies.company_id],
        references: [companies.company_id],
    }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
    user: one(users, {
        fields: [students.user_id],
        references: [users.user_id],
    }),
    major: one(majors, {
        fields: [students.major_id],
        references: [majors.major_id],
    }),
    applications: many(applications),
    saved_jobs: many(saved_jobs),
    search_history: many(search_history),
    saved_searches: many(saved_searches),
    followed_companies: many(followed_companies),
    invitations: many(job_invitations),
    comments: many(comments),
}));

export const majorsRelations = relations(majors, ({ many }) => ({
    students: many(students),
}));

export const jobInvitationsRelations = relations(job_invitations, ({ one }) => ({
    job: one(job_postings, {
        fields: [job_invitations.job_id],
        references: [job_postings.job_id],
    }),
    student: one(students, {
        fields: [job_invitations.student_id],
        references: [students.student_id],
    }),
}));

export const job_postingsRelations = relations(
    job_postings,
    ({ one, many }) => ({
        company: one(companies, {
            fields: [job_postings.company_id],
            references: [companies.company_id],
        }),
        category: one(job_categories, {
            fields: [job_postings.category_id],
            references: [job_categories.category_id],
        }),
        required_skills: many(job_required_skills),
        applications: many(applications),
        saved_by: many(saved_jobs),
        views: many(job_views),
        invitations: many(job_invitations),
    })
);

export const applicationsRelations = relations(applications, ({ one, many }) => ({
    job: one(job_postings, {
        fields: [applications.job_id],
        references: [job_postings.job_id],
    }),
    student: one(students, {
        fields: [applications.student_id],
        references: [students.student_id],
    }),
    status_history: many(application_status_history),
}));

export const jobCategoriesRelations = relations(job_categories, ({ many }) => ({
    job_postings: many(job_postings),
}));

export const companyImagesRelations = relations(company_images, ({ one }) => ({
    company: one(companies, {
        fields: [company_images.company_id],
        references: [companies.company_id],
    }),
}));

export const applicationStatusHistoryRelations = relations(application_status_history, ({ one }) => ({
    application: one(applications, {
        fields: [application_status_history.application_id],
        references: [applications.application_id],
    }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
    student: one(students, {
        fields: [comments.student_id],
        references: [students.student_id],
    }),
    company: one(companies, {
        fields: [comments.company_id],
        references: [companies.company_id],
    }),
}));