import { Module } from '@nestjs/common';
import { OrgEmailTemplatesController } from './org-email-templates.controller';
import { OrgEmailTemplatesService } from './org-email-templates.service';

@Module({
  controllers: [OrgEmailTemplatesController],
  providers: [OrgEmailTemplatesService],
})
export class OrgEmailTemplatesModule {}
