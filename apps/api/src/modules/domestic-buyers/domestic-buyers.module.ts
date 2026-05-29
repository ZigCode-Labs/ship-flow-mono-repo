import { Module } from '@nestjs/common';
import { DomesticBuyersController } from './domestic-buyers.controller';
import { DomesticBuyersService } from './domestic-buyers.service';

@Module({
  controllers: [DomesticBuyersController],
  providers: [DomesticBuyersService],
  exports: [DomesticBuyersService],
})
export class DomesticBuyersModule {}
