import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyBasicDto } from '../dto/update-company-basic.dto';
import { UpdateCompanyDescriptionDto } from '../dto/update-company-description.dto';
import { UpdateCompanyContactDto } from '../dto/update-company-contact.dto';
import { UpdateCompanyDetailDto } from '../dto/update-company-detail.dto';
import {
    CompanyResponse,
    CompanyImageItem,
    CompanyAdminListResult,
    CompanyUserListResult,
    CompanyStatusUpdateResult,
} from '../interfaces/company.interface'
import { CompanyStatus } from '../domain/company.props';

export interface ICompanyRepository {

    findRawById(actorId: number): Promise<number | null>

    // ── Create ──────────────────────────────────────────────────────────────
    createCompanyWithImages(
        userId: number,
        dto: CreateCompanyDto,
        logoUrl?: string,
        coverUrl?: string,
        officeImageUrls?: string[],
    ): Promise<CompanyResponse>;

    // ── Find ────────────────────────────────────────────────────────────────
    findById(companyId: number, includeAllStatus?: boolean): Promise<CompanyResponse | null>;
    findByUserId(userId: number): Promise<CompanyResponse | null>;

    // ── Update — mỗi @Patch một method rõ ràng, không dùng updateData: any ─
    updateBasic(userId: number, dto: UpdateCompanyBasicDto): Promise<CompanyResponse>;
    updateDescription(userId: number, dto: UpdateCompanyDescriptionDto): Promise<CompanyResponse>;
    updateContact(userId: number, dto: UpdateCompanyContactDto): Promise<CompanyResponse>;
    updateDetail(userId: number, dto: UpdateCompanyDetailDto): Promise<CompanyResponse>;
    updateLogo(userId: number, logoUrl: string): Promise<CompanyResponse>;
    updateCover(userId: number, coverUrl: string): Promise<CompanyResponse>;

    // ── Admin actions ────────────────────────────────────────────────────────
    approveCompany(companyId: number): Promise<CompanyStatusUpdateResult>;
    rejectCompany(companyId: number, reason: string): Promise<CompanyStatusUpdateResult>;
    restrictCompany(companyId: number, reason: string): Promise<CompanyStatusUpdateResult>;

    // ── Office images ────────────────────────────────────────────────────────
    getOfficeImages(companyId: number): Promise<CompanyImageItem[]>;
    insertOfficeImages(companyId: number, imageUrls: string[]): Promise<CompanyImageItem[]>;
    findImageByIdAndCompany(imageId: number, companyId: number): Promise<CompanyImageItem | null>;
    deleteImage(imageId: number): Promise<void>;

    // ── Lists ────────────────────────────────────────────────────────────────
    getCompanyListForAdmin(
        page: number,
        limit: number,
        status?: CompanyStatus,
    ): Promise<CompanyAdminListResult>;

    getCompanyListForUser(
        page: number,
        limit: number,
        filters?: {
            search?: string;
            location?: string;
            scale?: string;
        }
    ): Promise<CompanyUserListResult>
}