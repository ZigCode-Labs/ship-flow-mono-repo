import { Module } from '@nestjs/common';
import { DocumentSettingsController } from './document-settings.controller';
import { DocumentSettingsService } from './document-settings.service';

@Module({
  imports: [],
  controllers: [DocumentSettingsController],
  providers: [DocumentSettingsService],
  exports: [DocumentSettingsService],
})
export class DocumentSettingsModule {}
