import { BadRequestException, Body, Controller, Get, Patch, Param } from '@nestjs/common';
import { OrgExportSettingsService } from './org-export-settings.service';
import { updateExportSettingsSchema, updateActiveDocumentsSchema } from './org-export-settings.schema';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('organizations/:orgId/export-settings')
export class OrgExportSettingsController {
  constructor(private service: OrgExportSettingsService) {}

  @Get()
  findSettings(@Param('orgId') orgId: string, @CurrentUser() user: JwtUser) {
    return this.service.findSettings(orgId, user.userId);
  }

  @Patch()
  updateSettings(
    @Param('orgId') orgId: string,
    @Body() body: unknown,
    @CurrentUser() user: JwtUser,
  ) {
    const result = updateExportSettingsSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({ message: 'Validation failed', errors: result.error.issues });
    }
    return this.service.updateSettings(orgId, user.userId, result.data);
  }

  @Patch('active-documents')
  updateActiveDocuments(
    @Param('orgId') orgId: string,
    @Body() body: unknown,
    @CurrentUser() user: JwtUser,
  ) {
    const result = updateActiveDocumentsSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({ message: 'Validation failed', errors: result.error.issues });
    }
    return this.service.updateActiveDocuments(orgId, user.userId, result.data);
  }
}
