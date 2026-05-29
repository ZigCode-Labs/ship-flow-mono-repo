import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@shipflow/database';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentSettingsModule } from './modules/document-settings/document-settings.module';
import { DomesticProformaModule } from './modules/domestic-proforma/domestic-proforma.module';
import { DeliveryChallanModule } from './modules/delivery-challan/delivery-challan.module';
import { DomesticBuyersModule } from './modules/domestic-buyers/domestic-buyers.module';
import { TaxInvoiceModule } from './modules/tax-invoice/tax-invoice.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProformaEmailModule } from './modules/proforma-email/proforma-email.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

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
    OrganizationsModule,
    ProformaEmailModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
