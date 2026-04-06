export interface JobRequiredSkill {
    jobSkillId: number;
    jobId: number;
    skillId: number;
    createdAt: Date;
}

export interface UpdateJobResponse {
    jobId: number,
    jobTitle: string | undefined,
}

export interface ProfileJobCard {
    jobId: number,
    jobTitle: string | undefined,
    city: string | null,
    salaryMin: number | null,
    salaryMax: number | null,
    salaryType: string | null,
    isSalaryNegotiable: boolean,
    approvedAt: Date | null
}

// Item trả về cho FE (đã join thêm skillName)
export interface JobSkillItem {
    skillId: number | null;
    skillName: string;
}

// Response chính của job posting
export interface JobPostingResponse {
    jobId: number;
    companyId: number;
    categoryId: number | null;
    logoUrl: string | null;
    jobTitle: string;
    jobDescription: string;
    requirements: string;
    benefits: string | null;
    experienceLevel: string | null;
    positionLevel: string | null;

    numberOfPositions: number;

    salaryMin: number | null;
    salaryMax: number | null;
    salaryType: 'FIXED' | 'RANGE' | 'NEGOTIABLE' | null;
    isSalaryNegotiable: boolean;

    city: string | null;
    applicationDeadline: string | null;

    status: string;
    applicantCount: number;
    createdAt: Date;
    updatedAt: Date;

    requiredSkills: JobSkillItem[];
}

// Category
export interface CategoryItem {
    categoryId: number;
    categoryName: string;
}

export interface AdminJobCard {
    jobId: number;
    companyId: number;
    companyName: string;
    logoUrl: string | null;

    jobTitle: string;
    city: string | null;

    salaryMin: number | null;
    salaryMax: number | null;
    salaryType: 'FIXED' | 'RANGE' | 'NEGOTIABLE' | null;
    isSalaryNegotiable: boolean;

    applicationDeadline: string | null;

    status: 'pending' | 'approved' | 'rejected' | 'restricted';
}


// ─────────────────────────────────────────────────────────────────────────────
// Card dùng cho STUDENT
// Hiển thị: skill tags, số ứng viên, thời gian đăng tương đối
// KHÔNG có status (student chỉ thấy approved)
// ─────────────────────────────────────────────────────────────────────────────
export interface StudentJobCard {
    jobId: number;
    companyId: number;
    companyName: string;
    logoUrl: string | null;

    jobTitle: string;
    city: string | null;

    salaryMin: number | null;
    salaryMax: number | null;
    salaryType: 'FIXED' | 'RANGE' | 'NEGOTIABLE' | null;
    isSalaryNegotiable: boolean;

    // "5 ngày trước", "1 tuần trước"...
    postedAt: string;

    applicantCount: number;

    skills: JobSkillItem[];

}

// ─────────────────────────────────────────────────────────────────────────────
// Card dùng cho COMPANY
// Giống student nhưng có thêm status (tin của chính mình)
// ─────────────────────────────────────────────────────────────────────────────
export interface CompanyJobCard {
    jobId: number;

    jobTitle: string;
    city: string | null;
    companyName: string;
    logoUrl: string | null;

    salaryMin: number | null;
    salaryMax: number | null;
    salaryType: 'FIXED' | 'RANGE' | 'NEGOTIABLE' | null;
    isSalaryNegotiable: boolean;

    applicationDeadline: string | null;

    // Company thấy status tin của mình
    status: 'pending' | 'approved' | 'rejected' | 'restricted';

    applicantCount: number;

    skills: JobSkillItem[];

    createdAt: Date;
}
