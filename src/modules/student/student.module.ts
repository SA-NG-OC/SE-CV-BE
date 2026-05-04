import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { StudentRepository } from './repositories/student.repository';
import { CloudinaryModule } from 'src/shared/cloudinary/cloudinary.module';
import { I_STUDENT_REPOSITORY } from './student.token';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [StudentController],
  providers: [CloudinaryService, StudentService, {
    provide: I_STUDENT_REPOSITORY,
    useClass: StudentRepository
  }],
  exports: [I_STUDENT_REPOSITORY],
})
export class StudentModule { }
