import { CompanyEntity } from './company.entity';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyBasicDto } from '../dto/update-company-basic.dto';
import { UpdateCompanyDescriptionDto } from '../dto/update-company-description.dto';
import { UpdateCompanyContactDto } from '../dto/update-company-contact.dto';
import { UpdateCompanyDetailDto } from '../dto/update-company-detail.dto';
import { CompanyProps } from './company.props';

// ── Domain Error — KHÔNG import NestJS ở đây ──────────────────────────────
export class CompanyDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CompanyDomainError';
    }
}

export class CompanyDomain {

    private constructor(private props: CompanyProps) { }

    // ================= GETTERS =================
    get companyId() { return this.props.id; }
    get userId() { return this.props.userId; }
    get companyName() { return this.props.companyName; }
    get industry() { return this.props.industry; }
    get slogan() { return this.props.slogan; }
    get companySize() { return this.props.companySize; }
    get website() { return this.props.website; }
    get logoUrl() { return this.props.logoUrl; }
    get coverImageUrl() { return this.props.coverImageUrl; }
    get description() { return this.props.description; }
    get address() { return this.props.address; }
    get contactEmail() { return this.props.contactEmail; }
    get contactPhone() { return this.props.contactPhone; }
    get status() { return this.props.status; }
    get adminNote() { return this.props.adminNote; }
    get rating() { return this.props.rating; }
    get totalJobsPosted() { return this.props.totalJobsPosted; }
    get totalFollowers() { return this.props.totalFollowers; }
    get createdAt() { return this.props.createdAt; }
    get updatedAt() { return this.props.updatedAt; }

    // ================= FACTORY =================
    static create(userId: number, dto: CreateCompanyDto, logoUrl?: string, coverUrl?: string): CompanyDomain {
        this.guardName(dto.company_name);
        if (dto.contact_email) this.guardEmail(dto.contact_email);

        const now = new Date();

        return new CompanyDomain({
            id: 0,
            userId,
            companyName: dto.company_name,
            industry: dto.industry ?? null,
            slogan: dto.slogan ?? null,
            companySize: dto.company_size ?? null,
            website: dto.website ?? null,
            logoUrl: logoUrl ?? null,
            coverImageUrl: coverUrl ?? null,
            description: dto.description ?? null,
            address: dto.address ?? null,
            contactEmail: dto.contact_email ?? null,
            contactPhone: dto.contact_phone ?? null,
            status: 'PENDING',
            adminNote: null,
            rating: 0,
            totalJobsPosted: 0,
            totalFollowers: 0,
            createdAt: now,
            updatedAt: now,
        });
    }

    static fromPersistence(raw: CompanyEntity): CompanyDomain {
        return new CompanyDomain({
            id: raw.company_id,
            userId: raw.user_id,
            companyName: raw.company_name,
            industry: raw.industry,
            slogan: raw.slogan,
            companySize: raw.company_size,
            website: raw.website,
            logoUrl: raw.logo_url,
            coverImageUrl: raw.cover_image_url,
            description: raw.description,
            address: raw.address,
            contactEmail: raw.contact_email,
            contactPhone: raw.contact_phone,
            status: raw.status,
            adminNote: raw.admin_note,
            rating: raw.rating ? Number(raw.rating) : 0,
            totalJobsPosted: raw.total_jobs_posted ?? 0,
            totalFollowers: raw.total_followers ?? 0,
            createdAt: raw.created_at!,
            updatedAt: raw.updated_at!,
        });
    }

    // ================= BEHAVIOR =================
    approve(): void {
        if (this.props.status === 'APPROVED') return;
        this.props.status = 'APPROVED';
        this.props.adminNote = 'Hồ sơ doanh nghiệp đã được phê duyệt bởi hệ thống.';
        this.props.updatedAt = new Date();
    }

    reject(reason: string): void {
        this.props.status = 'REJECTED';
        this.props.adminNote = reason.trim();
        this.props.updatedAt = new Date();
    }

    restrict(reason: string): void {
        this.props.status = 'RESTRICTED';
        this.props.adminNote = reason.trim();
        this.props.updatedAt = new Date();
    }

    updateBasic(dto: UpdateCompanyBasicDto): void {
        CompanyDomain.guardName(dto.company_name);
        this.props.companyName = dto.company_name;
        this.props.slogan = dto.slogan ?? this.props.slogan;
        this.props.updatedAt = new Date();
    }

    updateDescription(dto: UpdateCompanyDescriptionDto): void {
        this.props.description = dto.description;
        this.props.updatedAt = new Date();
    }

    updateContact(dto: UpdateCompanyContactDto): void {
        if (dto.contact_email) CompanyDomain.guardEmail(dto.contact_email);

        this.props.website = dto.website ?? this.props.website;
        this.props.contactEmail = dto.contact_email ?? this.props.contactEmail;
        this.props.contactPhone = dto.contact_phone ?? this.props.contactPhone;
        this.props.updatedAt = new Date();
    }

    updateDetail(dto: UpdateCompanyDetailDto): void {
        this.props.industry = dto.industry ?? this.props.industry;
        this.props.companySize = dto.company_size ?? this.props.companySize;
        this.props.address = dto.address ?? this.props.address;
        this.props.updatedAt = new Date();
    }

    updateLogo(logoUrl: string): void {
        if (!logoUrl) throw new CompanyDomainError('Logo URL không hợp lệ');
        this.props.logoUrl = logoUrl;
        this.props.updatedAt = new Date();
    }

    updateCover(coverUrl: string): void {
        if (!coverUrl) throw new CompanyDomainError('Cover image URL không hợp lệ');
        this.props.coverImageUrl = coverUrl;
        this.props.updatedAt = new Date();
    }

    // ================= QUERY =================
    canPostJob(): boolean { return this.props.status === 'APPROVED'; }
    isRestricted(): boolean { return this.props.status === 'RESTRICTED'; }
    isActive(): boolean {
        return this.props.status === 'APPROVED' || this.props.status === 'PENDING';
    }

    // ================= PERSISTENCE =================
    toPersistence(): Omit<CompanyEntity, 'company_id'> {
        return {
            user_id: this.props.userId,
            company_name: this.props.companyName,
            industry: this.props.industry,
            slogan: this.props.slogan,
            company_size: this.props.companySize,
            website: this.props.website,
            logo_url: this.props.logoUrl,
            cover_image_url: this.props.coverImageUrl,
            description: this.props.description,
            address: this.props.address,
            contact_email: this.props.contactEmail,
            contact_phone: this.props.contactPhone,
            status: this.props.status,
            admin_note: this.props.adminNote,
            rating: String(this.props.rating),
            total_jobs_posted: this.props.totalJobsPosted,
            total_followers: this.props.totalFollowers,
            created_at: this.props.createdAt,
            updated_at: this.props.updatedAt,
        };
    }

    toUpdatePersistence(): Partial<CompanyEntity> {
        return {
            company_name: this.props.companyName,
            industry: this.props.industry,
            slogan: this.props.slogan,
            company_size: this.props.companySize,
            website: this.props.website,
            logo_url: this.props.logoUrl,
            cover_image_url: this.props.coverImageUrl,
            description: this.props.description,
            address: this.props.address,
            contact_email: this.props.contactEmail,
            contact_phone: this.props.contactPhone,
            status: this.props.status,
            admin_note: this.props.adminNote,
            total_jobs_posted: this.props.totalJobsPosted,
            total_followers: this.props.totalFollowers,
            updated_at: this.props.updatedAt,
        };
    }

    // ================= GUARD =================
    private static guardName(name: string): void {
        if (!name?.trim()) throw new CompanyDomainError('Tên công ty không được để trống');
    }

    private static guardEmail(email: string): void {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) throw new CompanyDomainError('Email không hợp lệ');
    }
}