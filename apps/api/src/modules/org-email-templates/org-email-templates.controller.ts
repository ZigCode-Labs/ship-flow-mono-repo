import { BadRequestException, Body, Controller, Get, Param, Put } from '@nestjs/common';
import { OrgEmailTemplatesService } from './org-email-templates.service';
import { upsertEmailTemplateSchema } from './org-email-templates.schema';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('organizations/:orgId/email-templates')
export class OrgEmailTemplatesController {
  constructor(private service: OrgEmailTemplatesService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @CurrentUser() user: JwtUser) {
    return this.service.findAll(orgId, user.userId);
  }

  @Get(':docType')
  findOne(
    @Param('orgId') orgId: string,
    @Param('docType') docType: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.service.findOne(orgId, docType, user.userId);
  }

  @Put(':docType')
  upsert(
    @Param('orgId') orgId: string,
    @Param('docType') docType: string,
    @Body() body: unknown,
    @CurrentUser() user: JwtUser,
  ) {
    const result = upsertEmailTemplateSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({ message: 'Validation failed', errors: result.error.issues });
    }
    return this.service.upsert(orgId, docType, user.userId, result.data);
  }
}
