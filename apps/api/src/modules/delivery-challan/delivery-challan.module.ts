import { Module } from '@nestjs/common';
import { DeliveryChallanController } from './delivery-challan.controller';
import { DeliveryChallanService } from './delivery-challan.service';

@Module({
  controllers: [DeliveryChallanController],
  providers: [DeliveryChallanService],
})
export class DeliveryChallanModule {}
