import { companyStatus } from 'src/common/types/comapnyStatus.enum';
import { CreateCompanyDto } from '../dto/create-company.dto';

export interface CompanyCardAdmin {
    companies: any[];
    totalItems: number;
    statusCount: any[];
}

export interface CompanyCardUser {
    companies: any[];
    totalItems: number;
}

export interface ICompanyRepository {
    createCompanyWithImages(
        userId: number,
        data: CreateCompanyDto,
        logoUrl?: string,
        coverUrl?: string,
        officeImageUrls?: string[]
    ): Promise<any>;

    findById(companyId: number, includeAllStatus?: boolean): Promise<any>;

    findByUserId(userId: number): Promise<any>;

    getOfficeImages(companyId: number): Promise<any[]>;

    updateByUserId(userId: number, updateData: any): Promise<any>;

    insertOfficeImages(companyId: number, imageUrls: string[]): Promise<any>;

    findImageByIdAndCompany(imageId: number, companyId: number): Promise<any>;

    deleteImage(imageId: number): Promise<void>;

    getCompanyCardAdmin(
        page: number,
        limit: number,
        status?: "PENDING" | "APPROVED" | "REJECTED" | "RESTRICTED"
    ): Promise<CompanyCardAdmin>;

    getCompanyCardForUser(page: number, limit: number): Promise<CompanyCardUser>;

    updateCompanyStatus(
        companyId: number,
        status: companyStatus,
        admin_note?: string | null
    ): Promise<any>;
}