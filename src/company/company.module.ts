import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CompanyRepository } from './repositories/company.repository';
import { I_COMPANY_REPOSITORY } from './company.tokens';

@Module({
  imports: [AuthModule, CloudinaryModule],
  controllers: [CompanyController],
  providers: [CompanyService, {
    provide: I_COMPANY_REPOSITORY,
    useClass: CompanyRepository,
  }],
  exports: [I_COMPANY_REPOSITORY],
})
export class CompanyModule { }
