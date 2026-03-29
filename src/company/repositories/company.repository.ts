import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import * as schema from '../../database/schema';
import { eq, and, sql, desc, count } from 'drizzle-orm';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { companyStatus } from 'src/common/types/comapnyStatus.enum';
import { ICompanyRepository } from './company-repository.interface';

@Injectable()
export class CompanyRepository implements ICompanyRepository {
    constructor(@Inject(DATABASE_CONNECTION) private readonly db: NodePgDatabase<typeof schema>) { }

    private readonly companySelectFields = {
        company_id: schema.companies.company_id,
        user_id: schema.companies.user_id,
        company_name: schema.companies.company_name,
        industry: schema.companies.industry,
        slogan: schema.companies.slogan,
        company_size: schema.companies.company_size,
        website: schema.companies.website,
        description: schema.companies.description,
        address: schema.companies.address,
        city: schema.companies.city,
        district: schema.companies.district,
        contact_email: schema.companies.contact_email,
        contact_phone: schema.companies.contact_phone,
        logo_url: schema.companies.logo_url,
        cover_image_url: schema.companies.cover_image_url,
        is_verified: schema.companies.is_verified,
        rating: schema.companies.rating,
        total_jobs_posted: schema.companies.total_jobs_posted,
        total_followers: schema.companies.total_followers,
        status: schema.companies.status,
        created_at: schema.companies.created_at,
        updated_at: schema.companies.updated_at,
    };

    async createCompanyWithImages(userId: number, data: CreateCompanyDto, logoUrl?: string, coverUrl?: string, officeImageUrls?: string[]) {
        return await this.db.transaction(async (tx) => {
            const [newCompany] = await tx
                .insert(schema.companies)
                .values({
                    user_id: userId,
                    company_name: data.company_name,
                    industry: data.industry,
                    slogan: data.slogan,
                    company_size: data.company_size,
                    website: data.website,
                    description: data.description,
                    address: data.address,
                    contact_email: data.contact_email,
                    contact_phone: data.contact_phone,
                    logo_url: logoUrl,
                    cover_image_url: coverUrl,
                })
                .returning();

            if (officeImageUrls && officeImageUrls.length > 0) {
                const imageValues = officeImageUrls.map((url) => ({
                    company_id: newCompany.company_id,
                    image_url: url,
                }));
                await tx.insert(schema.company_images).values(imageValues);
            }
            return { newCompany };
        });
    }

    async findById(companyId: number, includeAllStatus = false) {
        const conditions = includeAllStatus
            ? eq(schema.companies.company_id, companyId)
            : and(eq(schema.companies.company_id, companyId), eq(schema.companies.status, 'APPROVED'));

        const [company] = await this.db
            .select(this.companySelectFields)
            .from(schema.companies)
            .where(conditions);
        return company;
    }

    async findByUserId(userId: number) {
        const [company] = await this.db
            .select(this.companySelectFields)
            .from(schema.companies)
            .where(eq(schema.companies.user_id, userId));
        return company;
    }

    async getOfficeImages(companyId: number) {
        return await this.db
            .select({
                image_id: schema.company_images.image_id,
                company_id: schema.company_images.company_id,
                image_url: schema.company_images.image_url,
            })
            .from(schema.company_images)
            .where(eq(schema.company_images.company_id, companyId));
    }

    async updateByUserId(userId: number, updateData: any) {
        const [company] = await this.db
            .update(schema.companies)
            .set({ ...updateData, updated_at: new Date() })
            .where(eq(schema.companies.user_id, userId))
            .returning();
        return company;
    }

    async insertOfficeImages(companyId: number, imageUrls: string[]) {
        const insertData = imageUrls.map(url => ({
            company_id: companyId,
            image_url: url,
        }));
        return await this.db.insert(schema.company_images).values(insertData).returning();
    }

    async findImageByIdAndCompany(imageId: number, companyId: number) {
        const [image] = await this.db
            .select()
            .from(schema.company_images)
            .where(
                and(
                    eq(schema.company_images.image_id, imageId),
                    eq(schema.company_images.company_id, companyId)
                )
            );
        return image;
    }

    async deleteImage(imageId: number) {
        await this.db.delete(schema.company_images).where(eq(schema.company_images.image_id, imageId));
    }

    async getCompanyCardAdmin(
        page: number,
        limit: number,
        status?: "PENDING" | "APPROVED" | "REJECTED" | "RESTRICTED"
    ) {
        const offset = (page - 1) * limit;

        const condition = status
            ? eq(schema.companies.status, status)
            : undefined;

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
                .select({
                    totalItems: sql<number>`count(*)`.mapWith(Number),
                })
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
            companies,
            totalItems,
            statusCount,
        };
    }

    async getCompanyCardForUser(page: number, limit: number) {
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
                        AND status = 'active' 
                    )`.mapWith(Number)
                })
                .from(schema.companies)
                .where(eq(schema.companies.status, 'APPROVED'))
                .limit(limit)
                .offset(offset)
                .orderBy(desc(schema.companies.created_at)),

            this.db
                .select({
                    totalItems: count()
                })
                .from(schema.companies)
                .where(eq(schema.companies.status, 'APPROVED'))
        ]);

        return { companies, totalItems };
    }

    async updateCompanyStatus(companyId: number, status: companyStatus, admin_note?: string | null) {
        const [updateCompany] = await this.db
            .update(schema.companies)
            .set({
                status: status,
                admin_note: admin_note
            })
            .where(eq(schema.companies.company_id, companyId))
            .returning();
        const email = await this.db
            .select({ email: schema.users.email })
            .from(schema.users)
            .where(eq(schema.users.user_id, updateCompany.user_id))
            .limit(1)
            .then(rows => rows[0]?.email);
        return { ...updateCompany, email };
    }
}