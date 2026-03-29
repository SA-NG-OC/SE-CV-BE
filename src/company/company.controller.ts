import { Controller, Post, Get, Patch, Delete, Body, UseGuards, UseInterceptors, Req, UploadedFiles, UsePipes, Param, Query, DefaultValuePipe, ValidationPipe } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCompanyDto, createCompanySchema } from './dto/create-company.dto';
import { Role } from 'src/common/types/role.enum';
import ResponseSuccess from 'src/common/types/responseSuccess';
import { ZodValidationPipe } from 'nestjs-zod';
import { GetCompanyParamDto } from './dto/get-company.dto';
import { CompanyResponseDto } from './dto/company-response.dto';
import { UpdateCompanyBasicDto, updateCompanyBasicSchema } from './dto/update-company-basic.dto';
import { UpdateCompanyDescriptionDto, updateCompanyDescriptionSchema } from './dto/update-company-description.dto';
import { UpdateCompanyContactDto, updateCompanyContactSchema } from './dto/update-company-contact.dto';
import { UpdateCompanyDetailDto, updateCompanyDetailSchema } from './dto/update-company-detail.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';
import { UploadedFile } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';
import { AdminCompanyFilterDto } from './dto/admin-company-filter.dto';
import { ChangeCompanyStatusDto } from './dto/change-company-status.dto';
import { ChangeCompanyStatusDocs, CreateCompanyDocs, DeleteOfficeImageDocs, GetCompanyByIdDocs, GetCompanyCardAdminDocs, GetCompanyCardsForUserDocs, GetMyCompanyDocs, UpdateCompanyBasicDocs, UpdateCompanyContactDocs, UpdateCompanyCoverDocs, UpdateCompanyDescriptionDocs, UpdateCompanyDetailDocs, UpdateCompanyLogoDocs, UploadOfficeImagesDocs } from './decorators';

@Controller('company')
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService,
        private readonly cloudinaryService: CloudinaryService,
    ) {

    }

    @Post()
    @CreateCompanyDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.COMPANY)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'logo', maxCount: 1 },
            { name: 'coverImage', maxCount: 1 },
            { name: 'officeImages', maxCount: 6 },
        ]),
    )
    async createCompany(
        @Req() req,
        @Body(new ZodValidationPipe(createCompanySchema)) createCompanyDto: CreateCompanyDto,
        @UploadedFiles() files: {
            logo?: Express.Multer.File[];
            coverImage?: Express.Multer.File[];
            officeImages?: Express.Multer.File[]
        },
    ) {
        const userId = req.user.userId;
        let logoUrl: string | undefined = undefined;
        let coverUrl: string | undefined = undefined;
        let officeImageUrls: string[] = [];
        if (files.logo?.[0]) {
            const uploadRes = await this.cloudinaryService.uploadImage(files.logo[0]);
            logoUrl = uploadRes.secure_url;
        }
        if (files.coverImage?.[0]) {
            const uploadRes = await this.cloudinaryService.uploadImage(files.coverImage[0]);
            coverUrl = uploadRes.secure_url;
        }
        if (files.officeImages && files.officeImages.length > 0) {
            // Upload song song nhiều ảnh bằng Promise.all
            const uploadPromises = files.officeImages.map((file) =>
                this.cloudinaryService.uploadImage(file)
            );
            const results = await Promise.all(uploadPromises);
            officeImageUrls = results.map(res => res.secure_url);
        }
        const newCompany = await this.companyService.createCompany(
            userId,
            createCompanyDto,
            logoUrl,
            coverUrl,
            officeImageUrls,
        );
        return new ResponseSuccess('Tạo mới công ty thành công', newCompany);
    }

    @Get('me')
    @GetMyCompanyDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.COMPANY)
    async getMyCompany(@Req() req) {
        const userId = req.user.userId;
        const company: CompanyResponseDto | null = await this.companyService.getMyCompany(userId);
        return new ResponseSuccess('Lấy thông tin công ty thành công', company);
    }

    @Get(':companyId')
    @GetCompanyByIdDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.STUDENT)
    async getCompanyById(@Req() req, @Param() param: GetCompanyParamDto) {
        const role = req.roleId;
        const includeAllStatus: boolean = (role === Role.ADMIN);
        const company = await this.companyService.getCompanyById(param.companyId, includeAllStatus);
        return new ResponseSuccess('Lấy thông tin công ty thành công', company);
    }

    @Patch("basic-info")
    @UpdateCompanyBasicDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    //@UsePipes(new ZodValidationPipe(updateCompanyBasicSchema))
    @Roles(Role.COMPANY)
    async updateCompanyBasic(
        @Req() req,
        @Body() dto: UpdateCompanyBasicDto
    ) {
        const userId = req.user.userId;
        const company = await this.companyService.updateCompanyBasic(
            userId,
            dto
        );

        return new ResponseSuccess(
            "Cập nhật thông tin cơ bản công ty thành công",
            company
        );
    }

    @Patch("description")
    @UpdateCompanyDescriptionDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    //@UsePipes(new ZodValidationPipe(updateCompanyDescriptionSchema))
    @Roles(Role.COMPANY)
    async updateDescription(
        @Req() req,
        @Body() dto: UpdateCompanyDescriptionDto,
    ) {
        const userId = req.user.userId;
        const data = await this.companyService.updateCompanyDescription(
            userId,
            dto,
        );

        return new ResponseSuccess("Cập nhật mô tả công ty thành công", data);
    }

    @Patch("contact")
    @UpdateCompanyContactDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    //@UsePipes(new ZodValidationPipe(updateCompanyContactSchema))
    @Roles(Role.COMPANY)
    async updateContact(
        @Req() req,
        @Body() dto: UpdateCompanyContactDto,
    ) {
        const userId = req.user.userId;
        const data = await this.companyService.updateCompanyContact(
            userId,
            dto,
        );

        return new ResponseSuccess("Cập nhật thông tin liên hệ thành công", data);
    }

    @Patch("detail")
    @UpdateCompanyDetailDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    //@UsePipes(new ZodValidationPipe(updateCompanyDetailSchema))
    @Roles(Role.COMPANY)
    async updateDetail(
        @Req() req,
        @Body() dto: UpdateCompanyDetailDto,
    ) {
        const userId = req.user.userId;
        const data = await this.companyService.updateCompanyDetail(
            userId,
            dto,
        );

        return new ResponseSuccess("Cập nhật thông tin chi tiết công ty thành công", data);
    }

    @Patch("logo")
    @UpdateCompanyLogoDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.COMPANY)
    @UseInterceptors(FileInterceptor("logo"))
    async updateCompanyLogo(
        @Req() req,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const userId = req.user.userId;

        if (!file) {
            throw new BadRequestException("Vui lòng chọn logo.");
        }

        const uploadRes = await this.cloudinaryService.uploadImage(file);

        const company = await this.companyService.updateCompanyLogo(
            userId,
            uploadRes.secure_url,
        );

        return new ResponseSuccess("Cập nhật logo công ty thành công", company);
    }

    @Patch("cover-image")
    @UpdateCompanyCoverDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.COMPANY)
    @UseInterceptors(FileInterceptor("coverImage"))
    async updateCompanyCover(
        @Req() req,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const userId = req.user.userId;

        if (!file) {
            throw new BadRequestException("Vui lòng chọn ảnh bìa.");
        }

        const uploadRes = await this.cloudinaryService.uploadImage(file);

        const company = await this.companyService.updateCompanyCover(
            userId,
            uploadRes.secure_url,
        );

        return new ResponseSuccess("Cập nhật ảnh bìa công ty thành công", company);
    }

    @Patch("office-images")
    @UploadOfficeImagesDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.COMPANY)
    @UseInterceptors(FileFieldsInterceptor([{ name: "images", maxCount: 6 }]))
    async uploadOfficeImages(
        @Req() req,
        @UploadedFiles() files: { images?: Express.Multer.File[] },
    ) {
        const userId = req.user.userId;
        const imageFiles = files.images;

        if (!imageFiles || imageFiles.length === 0) {
            throw new BadRequestException("Vui lòng chọn ảnh.");
        }

        const uploadPromises = imageFiles.map(file =>
            this.cloudinaryService.uploadImage(file)
        );

        const results = await Promise.all(uploadPromises);
        const imageUrls = results.map(res => res.secure_url);

        const images = await this.companyService.addOfficeImages(
            userId,
            imageUrls,
        );

        return new ResponseSuccess("Tải ảnh văn phòng thành công", images);
    }

    @Delete("office-images/:imageId")
    @DeleteOfficeImageDocs()
    @UseGuards(JwtAuthGuard)
    async deleteOfficeImage(
        @Req() req,
        @Param("imageId", ParseIntPipe) imageId: number,
    ) {
        const userId = req.user.userId;

        await this.companyService.deleteOfficeImage(userId, imageId);

        return new ResponseSuccess("Xóa ảnh thành công", {});
    }

    @Get("all/admin")
    @GetCompanyCardAdminDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async getCompanyCardAdmin(@Query() query: AdminCompanyFilterDto) {
        const { page, limit, status } = query;
        const data = await this.companyService.getCompanyCardAdmin(page, limit, status);
        return new ResponseSuccess("Lấy thông tin thành công", data);
    }

    @Get("all/user")
    @GetCompanyCardsForUserDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.STUDENT)
    async getCompanyCardsForUser(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        const data = await this.companyService.getCompanyCardForUser(page, limit);
        return new ResponseSuccess("Lấy danh sách công ty thành công", data);
    }

    @Patch(":id/status/admin")
    @ChangeCompanyStatusDocs()
    @UseGuards(JwtAuthGuard, RolesGuard)
    //@UsePipes(new ZodValidationPipe(ChangeCompanyStatusSchema))
    @Roles(Role.ADMIN)
    async updateStatus(
        @Req() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: ChangeCompanyStatusDto
    ) {
        console.log('RAW BODY:', req.body);
        console.log('TYPE:', typeof req.body);
        const data = await this.companyService.changeCompanyStatus(id, body);
        return new ResponseSuccess("Cập nhật thành công", data);
    }
}
