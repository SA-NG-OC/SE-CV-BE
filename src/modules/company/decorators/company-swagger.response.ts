// decorators/company-swagger.response.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OfficeImageSwagger {
    @ApiProperty({ example: 1, description: 'ID ảnh văn phòng' })
    image_id: number;

    @ApiProperty({ example: 1, description: 'ID công ty sở hữu ảnh' })
    company_id: number;

    @ApiProperty({
        example: 'https://cloudinary.com/office1.png',
        description: 'URL ảnh văn phòng',
    })
    image_url: string;
}

export class CompanySwagger {
    // ── Định danh ──────────────────────────────────────────────
    @ApiProperty({ example: 1, description: 'ID công ty' })
    company_id: number;

    @ApiProperty({ example: 42, description: 'ID người dùng sở hữu công ty' })
    user_id: number;

    // ── Thông tin cơ bản ───────────────────────────────────────
    @ApiProperty({ example: 'Công ty ABC' })
    company_name: string;

    @ApiPropertyOptional({ example: 'Công nghệ phần mềm', nullable: true })
    industry: string | null;

    @ApiPropertyOptional({ example: 'Vì một tương lai tươi sáng', nullable: true })
    slogan: string | null;

    @ApiPropertyOptional({ example: '50-100', nullable: true, description: 'Quy mô nhân sự' })
    company_size: string | null;

    @ApiPropertyOptional({ example: 'https://abc.com', nullable: true })
    website: string | null;

    @ApiPropertyOptional({ example: 'Mô tả công ty...', nullable: true })
    description: string | null;

    // ── Địa chỉ ────────────────────────────────────────────────
    @ApiPropertyOptional({ example: '123 Nguyễn Huệ', nullable: true })
    address: string | null;

    // ── Liên hệ ────────────────────────────────────────────────
    @ApiPropertyOptional({ example: 'contact@abc.com', nullable: true })
    contact_email: string | null;

    @ApiPropertyOptional({ example: '0123456789', nullable: true })
    contact_phone: string | null;

    // ── Hình ảnh ───────────────────────────────────────────────
    @ApiPropertyOptional({ example: 'https://cloudinary.com/logo.png', nullable: true })
    logo_url: string | null;

    @ApiPropertyOptional({ example: 'https://cloudinary.com/cover.png', nullable: true })
    cover_image_url: string | null;

    // ── Trạng thái & thống kê ──────────────────────────────────
    @ApiPropertyOptional({
        example: false,
        nullable: true,
        description: 'Công ty đã được admin xác minh chưa',
    })
    is_verified: boolean | null;

    @ApiPropertyOptional({
        example: '4.5',
        nullable: true,
        description: 'Điểm đánh giá trung bình — Postgres Decimal trả về dạng string',
    })
    rating: string | null;

    @ApiPropertyOptional({ example: 20, nullable: true, description: 'Tổng số job đã đăng' })
    total_jobs_posted: number | null;

    @ApiPropertyOptional({ example: 120, nullable: true, description: 'Số người đang theo dõi công ty' })
    total_followers: number | null;

    @ApiPropertyOptional({
        example: 'PENDING',
        nullable: true,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'RESTRICTED'],
        description: 'Trạng thái duyệt của công ty',
    })
    status: string | null;

    // ── Timestamps ─────────────────────────────────────────────
    @ApiPropertyOptional({
        type: 'string',
        format: 'date-time',
        example: '2024-01-15T08:00:00.000Z',
        nullable: true,
        description: 'Drizzle trả về Date object — serialize thành ISO string',
    })
    created_at: string | null;

    @ApiPropertyOptional({
        type: 'string',
        format: 'date-time',
        example: '2024-06-01T12:00:00.000Z',
        nullable: true,
    })
    updated_at: string | null;

    // ── Ảnh văn phòng ──────────────────────────────────────────
    @ApiProperty({ type: [OfficeImageSwagger], description: 'Danh sách ảnh văn phòng' })
    office_images: OfficeImageSwagger[];
}

export class CompanyDataResponse {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Lấy thông tin công ty thành công' })
    message: string;

    @ApiProperty({ type: () => CompanySwagger })
    data: CompanySwagger;
}

export class PaginationMetaSwagger {
    @ApiProperty({ example: 1 })
    currentPage: number;

    @ApiProperty({ example: 10 })
    itemsPerPage: number;

    @ApiProperty({ example: 50 })
    totalItems: number;

    @ApiProperty({ example: 5 })
    totalPages: number;
}

export class CompanyCardSwagger {
    @ApiProperty({ example: 1 })
    companyId: number;

    @ApiProperty({ example: 'Công ty ABC' })
    companyName: string;

    @ApiPropertyOptional({ example: 'https://cloudinary.com/logo.png', nullable: true })
    logoUrl: string | null;

    @ApiPropertyOptional({ example: 'Tin học', nullable: true })
    industry: string | null;

    @ApiPropertyOptional({
        example: 'APPROVED',
        nullable: true,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'RESTRICTED'],
    })
    status: string | null;

    @ApiPropertyOptional({ example: '0.0', nullable: true })
    rating: string | null;

    @ApiPropertyOptional({ example: 12, nullable: true })
    follower: number | null;

    @ApiPropertyOptional({ example: 12, nullable: true })
    totalJobs: string | null;

    @ApiPropertyOptional({ example: '50-100', nullable: true })
    companySize: string | null;


}

export class PaginatedCompanyListSwagger {
    @ApiProperty({ type: [CompanyCardSwagger] })
    data: CompanyCardSwagger[];

    @ApiProperty({ type: () => PaginationMetaSwagger })
    meta: PaginationMetaSwagger;
}

export class PaginatedCompanyDataResponse {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Lấy danh sách công ty thành công' })
    message: string;

    @ApiProperty({ type: () => PaginatedCompanyListSwagger })
    data: PaginatedCompanyListSwagger;
}

export class OfficeImageListDataResponse {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Tải ảnh văn phòng thành công' })
    message: string;

    @ApiProperty({ type: [OfficeImageSwagger] })
    data: OfficeImageSwagger[];
}

export class SimpleSuccessResponse {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'Thao tác thành công' })
    message: string;

    @ApiProperty({ example: {} })
    data: object;
}