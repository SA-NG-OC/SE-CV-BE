import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FollowedCompanyService } from './follow.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'src/common/types/role.enum';
import { FollowCompanyParamDto } from './dto/follow-company.dto';
import ResponseSuccess from 'src/common/types/response-success';
import { FollowCompanyDocs } from './decorators/follow-company.docs';
import { UnfollowCompanyDocs } from './decorators/unfollow-company.docs';

// followed-company.controller.ts
@Controller('followed')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FollowedCompanyController {
  constructor(private readonly service: FollowedCompanyService) {}

  @Post(':companyId')
  @FollowCompanyDocs()
  @Roles(Role.STUDENT)
  async follow(@Req() req: any, @Param() params: FollowCompanyParamDto) {
    const studentId = req.user.studentId;

    await this.service.follow(studentId, params.companyId);

    return new ResponseSuccess('Follow công ty thành công', {});
  }

  @Delete(':companyId')
  @UnfollowCompanyDocs()
  @Roles(Role.STUDENT)
  async unfollow(@Req() req: any, @Param() params: FollowCompanyParamDto) {
    const studentId = req.user.studentId;

    await this.service.unfollow(studentId, params.companyId);

    return new ResponseSuccess('Unfollow công ty thành công', {});
  }
}
