import { Module } from '@nestjs/common';
import { DomesticProformaService } from './domestic-proforma.service';
import { DomesticProformaController } from './domestic-proforma.controller';

@Module({
  controllers: [DomesticProformaController],
  providers: [DomesticProformaService],
  exports: [DomesticProformaService],
})
export class DomesticProformaModule {}
