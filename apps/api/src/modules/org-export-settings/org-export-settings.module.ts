import { Module } from '@nestjs/common';
import { OrgExportSettingsController } from './org-export-settings.controller';
import { OrgExportSettingsService } from './org-export-settings.service';

@Module({
  controllers: [OrgExportSettingsController],
  providers: [OrgExportSettingsService],
})
export class OrgExportSettingsModule {}
