import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentSettingsModule } from './modules/document-settings/document-settings.module';
import { DomesticProformaModule } from './modules/domestic-proforma/domestic-proforma.module';
import { DeliveryChallanModule } from './modules/delivery-challan/delivery-challan.module';
import { DomesticBuyersModule } from './modules/domestic-buyers/domestic-buyers.module';
import { TaxInvoiceModule } from './modules/tax-invoice/tax-invoice.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DocumentSettingsModule,
    DomesticProformaModule,
    DeliveryChallanModule,
    DomesticBuyersModule,
    TaxInvoiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
