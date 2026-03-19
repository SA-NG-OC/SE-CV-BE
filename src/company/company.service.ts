import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CompanyRepository } from './company.repository'; // Import Repo mới
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { UpdateCompanyBasicDto } from './dto/update-company-basic.dto';
import { UpdateCompanyDescriptionDto } from './dto/update-company-description.dto';
import { UpdateCompanyContactDto } from './dto/update-company-contact.dto';
import { UpdateCompanyDetailDto } from './dto/update-company-detail.dto';
import { ChangeCompanyStatusDto } from './dto/change-company-status.dto';

@Injectable()
export class CompanyService {
    constructor(private readonly companyRepo: CompanyRepository,
    ) { }

    async createCompany(
        userId: number,
        data: CreateCompanyDto,
        logoUrl?: string,
        coverUrl?: string,
        officeImageUrls?: string[],
    ) {
        try {
            return await this.companyRepo.createCompanyWithImages(userId, data, logoUrl, coverUrl, officeImageUrls);
        } catch (error) {
            if (error.code === '23505') {
                throw new BadRequestException('Tài khoản này đã đăng ký công ty rồi.');
            }
            throw error;
        }
    }

    async getCompanyById(companyId: number, includeAllStatus = false): Promise<CompanyResponseDto> {
        const company = await this.companyRepo.findById(companyId, includeAllStatus);
        if (!company) throw new NotFoundException('Không tìm thấy công ty.');

        const officeImages = await this.companyRepo.getOfficeImages(companyId);
        return { ...company, office_images: officeImages };
    }

    async getMyCompany(userId: number): Promise<CompanyResponseDto> {
        const company = await this.companyRepo.findByUserId(userId);
        if (!company) throw new NotFoundException('Bạn chưa đăng ký công ty nào.');

        const officeImages = await this.companyRepo.getOfficeImages(company.company_id);
        return { ...company, office_images: officeImages };
    }

    private async checkCompanyExist(userId: number) {
        const company = await this.companyRepo.findByUserId(userId);
        console.log("userID NÈ: ", userId);
        if (!company) throw new NotFoundException('Không tìm thấy công ty.');
        return company;
    }

    async updateCompanyBasic(userId: number, dto: UpdateCompanyBasicDto) {
        await this.checkCompanyExist(userId);
        return await this.companyRepo.updateByUserId(userId, dto);
    }

    async updateCompanyDescription(userId: number, dto: UpdateCompanyDescriptionDto) {
        await this.checkCompanyExist(userId);
        return await this.companyRepo.updateByUserId(userId, { description: dto.description });
    }

    async updateCompanyContact(userId: number, dto: UpdateCompanyContactDto) {
        await this.checkCompanyExist(userId);
        return await this.companyRepo.updateByUserId(userId, dto);
    }

    async updateCompanyDetail(userId: number, dto: UpdateCompanyDetailDto) {
        await this.checkCompanyExist(userId);
        return await this.companyRepo.updateByUserId(userId, dto);
    }

    async updateCompanyLogo(userId: number, logoUrl: string) {
        await this.checkCompanyExist(userId);
        return await this.companyRepo.updateByUserId(userId, { logo_url: logoUrl });
    }

    async updateCompanyCover(userId: number, coverUrl: string) {
        await this.checkCompanyExist(userId);
        return await this.companyRepo.updateByUserId(userId, { cover_image_url: coverUrl });
    }

    // --- XỬ LÝ ẢNH VĂN PHÒNG ---

    async addOfficeImages(userId: number, imageUrls: string[]) {
        const company = await this.checkCompanyExist(userId);
        return await this.companyRepo.insertOfficeImages(company.company_id, imageUrls);
    }

    async deleteOfficeImage(userId: number, imageId: number) {
        const company = await this.checkCompanyExist(userId);

        const image = await this.companyRepo.findImageByIdAndCompany(imageId, company.company_id);
        if (!image) throw new NotFoundException("Không tìm thấy ảnh hoặc ảnh không thuộc về công ty này.");

        await this.companyRepo.deleteImage(imageId);
    }

    async getCompanyCardAdmin(page: number,
        limit: number,
        status?: "PENDING" | "APPROVED" | "REJECTED" | "RESTRICTED") {
        const data = await this.companyRepo.getCompanyCardAdmin(page, limit, status);
        return data;
    }

    async getCompanyCardForUser(page: number, limit: number) {
        const { companies, totalItems } = await this.companyRepo.getCompanyCardForUser(page, limit);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data: companies,
            meta: {
                currentPage: page,
                itemsPerPage: limit,
                totalItems,
                totalPages,
            }
        };
    }

    async changeCompanyStatus(companyId: number, dto: ChangeCompanyStatusDto) {
        let noteToSave = dto.admin_note;
        if (dto.status === 'APPROVED' || dto.status === 'PENDING') {
            noteToSave = null;
        }
        const updatedCompany = await this.companyRepo.updateCompanyStatus(companyId, dto.status, noteToSave);

        if (!updatedCompany) {
            throw new NotFoundException(`Không tìm thấy công ty với ID ${companyId}`);
        }
        return updatedCompany;
    }
}