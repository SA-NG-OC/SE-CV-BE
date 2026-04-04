import {
    Injectable,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
    Inject,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { ICompanyRepository } from './repositories/company-repository.interface';
import { I_COMPANY_REPOSITORY } from './company.tokens';
import { CompanyDomainError } from './domain/company.domain';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyBasicDto } from './dto/update-company-basic.dto';
import { UpdateCompanyDescriptionDto } from './dto/update-company-description.dto';
import { UpdateCompanyContactDto } from './dto/update-company-contact.dto';
import { UpdateCompanyDetailDto } from './dto/update-company-detail.dto';
import { ChangeCompanyStatusDto } from './dto/change-company-status.dto';
import { PaginationResponse } from 'src/common/types/pagination-response';

@Injectable()
export class CompanyService {
    constructor(
        @Inject(I_COMPANY_REPOSITORY) private readonly companyRepo: ICompanyRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    private rethrow(error: unknown): never {
        if (error instanceof CompanyDomainError) {
            throw new BadRequestException(error.message);
        }
        throw error;
    }

    async createCompany(
        userId: number,
        data: CreateCompanyDto,
        logoUrl?: string,
        coverUrl?: string,
        officeImageUrls?: string[],
    ) {
        try {
            const company = await this.companyRepo.createCompanyWithImages(
                userId, data, logoUrl, coverUrl, officeImageUrls,
            );
            if (!company) {
                throw new InternalServerErrorException('Có lỗi khi tạo lập công ty, vui lòng thử lại sau!');
            }

            this.eventEmitter.emit('company.created', {
                userId,
                companyName: data.company_name,
            });

            return company;
        } catch (error: any) {
            if (error.code === '23505') {
                throw new BadRequestException('Tài khoản này đã đăng ký công ty rồi.');
            }
            this.rethrow(error);
        }
    }

    async getCompanyById(companyId: number, includeAllStatus = false) {
        const company = await this.companyRepo.findById(companyId, includeAllStatus);
        if (!company) throw new NotFoundException('Không tìm thấy công ty.');
        return company;
    }

    async getMyCompany(userId: number) {
        const company = await this.companyRepo.findByUserId(userId);
        if (!company) return null;
        return company;
    }

    async updateCompanyBasic(userId: number, dto: UpdateCompanyBasicDto) {
        try {
            const result = await this.companyRepo.updateBasic(userId, dto);
            if (!result) throw new NotFoundException('Không tìm thấy công ty.');
            return result;
        } catch (error) {
            this.rethrow(error);
        }
    }

    async updateCompanyDescription(userId: number, dto: UpdateCompanyDescriptionDto) {
        try {
            const result = await this.companyRepo.updateDescription(userId, dto);
            if (!result) throw new NotFoundException('Không tìm thấy công ty.');
            return result;
        } catch (error) {
            this.rethrow(error);
        }
    }

    async updateCompanyContact(userId: number, dto: UpdateCompanyContactDto) {
        try {
            const result = await this.companyRepo.updateContact(userId, dto);
            if (!result) throw new NotFoundException('Không tìm thấy công ty.');
            return result;
        } catch (error) {
            this.rethrow(error);
        }
    }

    async updateCompanyDetail(userId: number, dto: UpdateCompanyDetailDto) {
        try {
            const result = await this.companyRepo.updateDetail(userId, dto);
            if (!result) throw new NotFoundException('Không tìm thấy công ty.');
            return result;
        } catch (error) {
            this.rethrow(error);
        }
    }

    async updateCompanyLogo(userId: number, logoUrl: string) {
        try {
            const result = await this.companyRepo.updateLogo(userId, logoUrl);
            if (!result) throw new NotFoundException('Không tìm thấy công ty.');
            return result;
        } catch (error) {
            this.rethrow(error);
        }
    }

    async updateCompanyCover(userId: number, coverUrl: string) {
        try {
            const result = await this.companyRepo.updateCover(userId, coverUrl);
            if (!result) throw new NotFoundException('Không tìm thấy công ty.');
            return result;
        } catch (error) {
            this.rethrow(error);
        }
    }

    async addOfficeImages(userId: number, imageUrls: string[]) {
        const company = await this.companyRepo.findByUserId(userId);
        if (!company) throw new NotFoundException('Không tìm thấy công ty.');
        return this.companyRepo.insertOfficeImages(company.companyId, imageUrls);
    }

    async deleteOfficeImage(userId: number, imageId: number) {
        const company = await this.companyRepo.findByUserId(userId);
        if (!company) throw new NotFoundException('Không tìm thấy công ty.');

        const image = await this.companyRepo.findImageByIdAndCompany(imageId, company.companyId);
        if (!image) throw new NotFoundException('Không tìm thấy ảnh hoặc ảnh không thuộc về công ty này.');

        await this.companyRepo.deleteImage(imageId);
    }

    async getCompanyCardAdmin(
        page: number,
        limit: number,
        status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESTRICTED',
    ) {
        const { companies, totalItems, statusCount } =
            await this.companyRepo.getCompanyListForAdmin(page, limit, status);

        return {
            ...new PaginationResponse(companies, page, limit, totalItems),
            status: statusCount,
        };
    }

    async getCompanyCardForUser(page: number, limit: number) {
        const { companies, totalItems } =
            await this.companyRepo.getCompanyListForUser(page, limit);

        return new PaginationResponse(companies, page, limit, totalItems);
    }

    async changeCompanyStatus(companyId: number, dto: ChangeCompanyStatusDto) {
        try {
            let result;
            if (dto.status === 'APPROVED') {
                result = await this.companyRepo.approveCompany(companyId);
            } else if (dto.status === 'REJECTED') {
                result = await this.companyRepo.rejectCompany(companyId, dto.admin_note ?? '');
            } else if (dto.status === 'RESTRICTED') {
                result = await this.companyRepo.restrictCompany(companyId, dto.admin_note ?? '');
            } else {
                throw new BadRequestException(`Không hỗ trợ chuyển sang trạng thái "${dto.status}"`);
            }

            if (!result) throw new NotFoundException(`Không tìm thấy công ty với ID ${companyId}`);

            this.eventEmitter.emit('company.statusChanged', {
                email: result.email,
                companyName: result.adminNote,
                userId: companyId,
                newStatus: dto.status,
                note: dto.admin_note,
            });

            return result;
        } catch (error) {
            this.rethrow(error);
        }
    }
}