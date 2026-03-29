import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { StudentRepository } from './repositories/student.repository';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { I_STUDENT_REPOSITORY } from './student.token';

@Module({
  imports: [CloudinaryModule],
  controllers: [StudentController],
  providers: [StudentService, {
    provide: I_STUDENT_REPOSITORY,
    useClass: StudentRepository
  }],
})
export class StudentModule { }
