export type StudentStatus = 'STUDYING' | 'GRADUATED' | 'DROPPED_OUT';

export interface StudentProps {
    id: number;
    userId: number | null;
    fullName: string;
    studentCode: string;
    emailStudent: string | null;
    phone: string | null;
    majorId: number | null;
    currentYear: number | null;
    enrollmentYear: number | null;
    gpa: number | null;
    studentStatus: StudentStatus;
    isOpenToWork: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
}