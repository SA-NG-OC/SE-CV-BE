import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from 'src/common/types/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { SavedJobService } from './saved-jobs.service';
import ResponseSuccess from 'src/common/types/response-success';
import { SaveJobDocs, UnsaveJobDocs } from './decorators/save-job.docs';

@Controller('saved-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class SavedJobController {
  constructor(private readonly service: SavedJobService) {}

  @Post(':jobId')
  @SaveJobDocs()
  async saveJob(@Param('jobId') jobId: string, @Req() req: any) {
    const studentId = req.user.studentId;

    const data = await this.service.saveJob(studentId, Number(jobId));

    return new ResponseSuccess('Lưu job thành công', data);
  }

  @Delete(':jobId')
  @UnsaveJobDocs()
  async unsaveJob(@Param('jobId') jobId: string, @Req() req: any) {
    const studentId = req.user.studentId;

    const data = await this.service.unsaveJob(studentId, Number(jobId));

    return new ResponseSuccess('Bỏ lưu job thành công', data);
  }
}
