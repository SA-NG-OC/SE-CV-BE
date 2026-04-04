import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from '../../../database/schema';
import { eq, and, sql, desc, count } from 'drizzle-orm';

import { ICompanyRepository } from './company-repository.interface';
import { CompanyDomain } from '../domain/company.domain';
import { CompanyMapper } from '../domain/company.mapper';
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
} from '../interfaces/company.interface';
import { CompanyStatus } from '../domain/company.props';

@Injectable()
export class CompanyRepository implements ICompanyRepository {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) { }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================
    private async loadByUserId(userId: number) {
        const [row] = await this.db
            .select()
            .from(schema.companies)
            .where(eq(schema.companies.user_id, userId))
            .limit(1);
        return row ?? null;
    }

    private async loadByCompanyId(companyId: number) {
        const [row] = await this.db
            .select()
            .from(schema.companies)
            .where(eq(schema.companies.company_id, companyId))
            .limit(1);
        return row ?? null;
    }

    private async saveAndReturn(
        domain: CompanyDomain,
        whereField: 'user_id' | 'company_id',
    ): Promise<CompanyResponse> {
        const condition = whereField === 'user_id'
            ? eq(schema.companies.user_id, domain.userId)
            : eq(schema.companies.company_id, domain.companyId);

        const [updated] = await this.db
            .update(schema.companies)
            .set(domain.toUpdatePersistence())
            .where(condition)
            .returning();

        const updatedDomain = CompanyDomain.fromPersistence(updated);
        const images = await this.getOfficeImages(updatedDomain.companyId);
        return CompanyMapper.toResponse(updatedDomain, images);
    }

    private async getEmailByUserId(userId: number): Promise<string | undefined> {
        const rows = await this.db
            .select({ email: schema.users.email })
            .from(schema.users)
            .where(eq(schema.users.user_id, userId))
            .limit(1);
        return rows[0]?.email;
    }

    async createCompanyWithImages(
        userId: number,
        dto: CreateCompanyDto,
        logoUrl?: string,
        coverUrl?: string,
        officeImageUrls?: string[],
    ): Promise<CompanyResponse> {
        const domain = CompanyDomain.create(userId, dto, logoUrl, coverUrl);

        return this.db.transaction(async (tx) => {
            const [newCompany] = await tx
                .insert(schema.companies)
                .values(domain.toPersistence())
                .returning();

            let officeImages: CompanyImageItem[] = [];

            if (officeImageUrls?.length) {
                const inserted = await tx
                    .insert(schema.company_images)
                    .values(
                        officeImageUrls.map((url) => ({
                            company_id: newCompany.company_id,
                            image_url: url,
                        })),
                    )
                    .returning();

                officeImages = inserted.map(CompanyMapper.toImageItem);
            }

            const newDomain = CompanyDomain.fromPersistence(newCompany);
            return CompanyMapper.toResponse(newDomain, officeImages);
        });
    }

    async findById(
        companyId: number,
        includeAllStatus = false,
    ): Promise<CompanyResponse | null> {
        const condition = includeAllStatus
            ? eq(schema.companies.company_id, companyId)
            : and(
                eq(schema.companies.company_id, companyId),
                eq(schema.companies.status, 'APPROVED'),
            );

        const [row] = await this.db
            .select()
            .from(schema.companies)
            .where(condition)
            .limit(1);

        if (!row) return null;

        const domain = CompanyDomain.fromPersistence(row);
        const images = await this.getOfficeImages(companyId);
        return CompanyMapper.toResponse(domain, images);
    }

    async findByUserId(userId: number): Promise<CompanyResponse | null> {
        const row = await this.loadByUserId(userId);
        if (!row) return null;

        const domain = CompanyDomain.fromPersistence(row);
        const images = await this.getOfficeImages(domain.companyId);
        return CompanyMapper.toResponse(domain, images);
    }

    async updateBasic(userId: number, dto: UpdateCompanyBasicDto): Promise<CompanyResponse> {
        const row = await this.loadByUserId(userId);
        if (!row) return null!;

        const domain = CompanyDomain.fromPersistence(row);
        domain.updateBasic(dto);
        return this.saveAndReturn(domain, 'user_id');
    }

    async updateDescription(userId: number, dto: UpdateCompanyDescriptionDto): Promise<CompanyResponse> {
        const row = await this.loadByUserId(userId);
        if (!row) return null!;

        const domain = CompanyDomain.fromPersistence(row);
        domain.updateDescription(dto);
        return this.saveAndReturn(domain, 'user_id');
    }

    async updateContact(userId: number, dto: UpdateCompanyContactDto): Promise<CompanyResponse> {
        const row = await this.loadByUserId(userId);
        if (!row) return null!;

        const domain = CompanyDomain.fromPersistence(row);
        domain.updateContact(dto);
        return this.saveAndReturn(domain, 'user_id');
    }

    async updateDetail(userId: number, dto: UpdateCompanyDetailDto): Promise<CompanyResponse> {
        const row = await this.loadByUserId(userId);
        if (!row) return null!;

        const domain = CompanyDomain.fromPersistence(row);
        domain.updateDetail(dto);
        return this.saveAndReturn(domain, 'user_id');
    }

    async updateLogo(userId: number, logoUrl: string): Promise<CompanyResponse> {
        const row = await this.loadByUserId(userId);
        if (!row) return null!;

        const domain = CompanyDomain.fromPersistence(row);
        domain.updateLogo(logoUrl);
        return this.saveAndReturn(domain, 'user_id');
    }

    async updateCover(userId: number, coverUrl: string): Promise<CompanyResponse> {
        const row = await this.loadByUserId(userId);
        if (!row) return null!;

        const domain = CompanyDomain.fromPersistence(row);
        domain.updateCover(coverUrl);
        return this.saveAndReturn(domain, 'user_id');
    }

    async approveCompany(companyId: number): Promise<CompanyStatusUpdateResult> {
        const row = await this.loadByCompanyId(companyId);
        if (!row) return null!;

        const domain = CompanyDomain.fromPersistence(row);
        domain.approve();

        await this.db
            .update(schema.companies)
            .set(domain.toUpdatePersistence())
            .where(eq(schema.companies.company_id, companyId));

        const email = await this.getEmailByUserId(domain.userId);
        return CompanyMapper.toStatusUpdateResult(domain, email);
    }

    async rejectCompany(companyId: number, reason: string): Promise<CompanyStatusUpdateResult> {
        const row = await this.loadByCompanyId(companyId);
        if (!row) return null!;

        const domain = CompanyDomain.fromPersistence(row);
        domain.reject(reason);

        await this.db
            .update(schema.companies)
            .set(domain.toUpdatePersistence())
            .where(eq(schema.companies.company_id, companyId));

        const email = await this.getEmailByUserId(domain.userId);
        return CompanyMapper.toStatusUpdateResult(domain, email);
    }

    async restrictCompany(companyId: number, reason: string): Promise<CompanyStatusUpdateResult> {
        const row = await this.loadByCompanyId(companyId);
        if (!row) return null!;

        const domain = CompanyDomain.fromPersistence(row);
        domain.restrict(reason);

        await this.db
            .update(schema.companies)
            .set(domain.toUpdatePersistence())
            .where(eq(schema.companies.company_id, companyId));

        const email = await this.getEmailByUserId(domain.userId);
        return CompanyMapper.toStatusUpdateResult(domain, email);
    }

    // =========================================================================
    // OFFICE IMAGES
    // =========================================================================

    async getOfficeImages(companyId: number): Promise<CompanyImageItem[]> {
        const rows = await this.db
            .select()
            .from(schema.company_images)
            .where(eq(schema.company_images.company_id, companyId));

        return rows.map(CompanyMapper.toImageItem);
    }

    async insertOfficeImages(companyId: number, imageUrls: string[]): Promise<CompanyImageItem[]> {
        const inserted = await this.db
            .insert(schema.company_images)
            .values(imageUrls.map((url) => ({ company_id: companyId, image_url: url })))
            .returning();

        return inserted.map(CompanyMapper.toImageItem);
    }

    async findImageByIdAndCompany(
        imageId: number,
        companyId: number,
    ): Promise<CompanyImageItem | null> {
        const [row] = await this.db
            .select()
            .from(schema.company_images)
            .where(
                and(
                    eq(schema.company_images.image_id, imageId),
                    eq(schema.company_images.company_id, companyId),
                ),
            )
            .limit(1);

        return row ? CompanyMapper.toImageItem(row) : null;
    }

    async deleteImage(imageId: number): Promise<void> {
        await this.db
            .delete(schema.company_images)
            .where(eq(schema.company_images.image_id, imageId));
    }

    async getCompanyListForAdmin(
        page: number,
        limit: number,
        status?: CompanyStatus,
    ): Promise<CompanyAdminListResult> {
        const offset = (page - 1) * limit;
        const condition = status ? eq(schema.companies.status, status) : undefined;

        const [companies, [{ totalItems }], statusCount] = await Promise.all([
            this.db
                .select({
                    companyId: schema.companies.company_id,
                    companyName: schema.companies.company_name,
                    logoUrl: schema.companies.logo_url,
                    industry: schema.companies.industry,
                    status: schema.companies.status,
                    rating: schema.companies.rating,
                    followers: schema.companies.total_followers,
                    totalJobs: schema.companies.total_jobs_posted,
                    companySize: schema.companies.company_size,
                    createdAt: schema.companies.created_at,
                })
                .from(schema.companies)
                .where(condition)
                .limit(limit)
                .offset(offset),

            this.db
                .select({ totalItems: sql<number>`count(*)`.mapWith(Number) })
                .from(schema.companies)
                .where(condition),

            this.db
                .select({
                    status: schema.companies.status,
                    count: sql<number>`count(*)`.mapWith(Number),
                })
                .from(schema.companies)
                .groupBy(schema.companies.status),
        ]);

        return {
            companies: companies.map(CompanyMapper.toAdminCard),
            totalItems,
            statusCount: CompanyMapper.toStatusCount(statusCount),
        };
    }

    async getCompanyListForUser(
        page: number,
        limit: number,
    ): Promise<CompanyUserListResult> {
        const offset = (page - 1) * limit;

        const [companies, [{ totalItems }]] = await Promise.all([
            this.db
                .select({
                    company_id: schema.companies.company_id,
                    company_name: schema.companies.company_name,
                    logo_url: schema.companies.logo_url,
                    industry: schema.companies.industry,
                    active_jobs: sql<number>`(
                        SELECT COUNT(job_id)
                        FROM ${schema.job_postings}
                        WHERE company_id = ${schema.companies.company_id}
                        AND status = 'approved'
                    )`.mapWith(Number),
                })
                .from(schema.companies)
                .where(eq(schema.companies.status, 'APPROVED'))
                .orderBy(desc(schema.companies.created_at))
                .limit(limit)
                .offset(offset),

            this.db
                .select({ totalItems: count() })
                .from(schema.companies)
                .where(eq(schema.companies.status, 'APPROVED')),
        ]);

        return {
            companies: companies.map(CompanyMapper.toUserCard),
            totalItems: Number(totalItems),
        };
    }
}