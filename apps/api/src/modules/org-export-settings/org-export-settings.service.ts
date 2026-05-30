import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@shipflow/database';
import {
  UpdateExportSettingsDto,
  UpdateActiveDocumentsDto,
  ALL_DOCUMENTS,
} from './org-export-settings.schema';

@Injectable()
export class OrgExportSettingsService {
  constructor(private prisma: PrismaService) {}

  async findSettings(orgId: string, userId: string) {
    await this.assertMember(orgId, userId);

    const settings = await this.prisma.organizationExportDefaults.findUnique({
      where: { organizationId: orgId },
      select: {
        industryType: true,
        documentSet: true,
        defaultAdditionalDetails: true,
        defaultDescriptionOfGoods: true,
        defaultAdditionalInfo: true,
        defaultFreightBasis: true,
      },
    });

    const savedDocs = await this.prisma.organizationActiveDocument.findMany({
      where: { organizationId: orgId },
    });

    const savedMap = new Map(savedDocs.map((d) => [d.documentName, d]));

    const activeDocuments = ALL_DOCUMENTS.map((doc) => {
      const saved = savedMap.get(doc.name);
      return {
        documentName: doc.name,
        label: doc.label,
        isCore: doc.isCore,
        isEnabled: saved ? saved.isEnabled : doc.isCore,
        displayOrder: saved ? saved.displayOrder : doc.defaultOrder,
      };
    });

    return {
      industryType: settings?.industryType ?? null,
      documentSet: settings?.documentSet ?? 'standard',
      defaultAdditionalDetails: settings?.defaultAdditionalDetails ?? null,
      defaultDescriptionOfGoods: settings?.defaultDescriptionOfGoods ?? null,
      defaultAdditionalInfo: settings?.defaultAdditionalInfo ?? null,
      defaultFreightBasis: settings?.defaultFreightBasis ?? null,
      activeDocuments,
    };
  }

  async updateSettings(orgId: string, userId: string, data: UpdateExportSettingsDto) {
    await this.assertMember(orgId, userId);

    return this.prisma.organizationExportDefaults.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        industryType: data.industryType ?? undefined,
        documentSet: data.documentSet ?? undefined,
        defaultAdditionalDetails: data.defaultAdditionalDetails ?? undefined,
        defaultDescriptionOfGoods: data.defaultDescriptionOfGoods ?? undefined,
        defaultAdditionalInfo: data.defaultAdditionalInfo ?? undefined,
        defaultFreightBasis: data.defaultFreightBasis ?? undefined,
      },
      update: {
        industryType: data.industryType ?? undefined,
        documentSet: data.documentSet ?? undefined,
        defaultAdditionalDetails: data.defaultAdditionalDetails ?? undefined,
        defaultDescriptionOfGoods: data.defaultDescriptionOfGoods ?? undefined,
        defaultAdditionalInfo: data.defaultAdditionalInfo ?? undefined,
        defaultFreightBasis: data.defaultFreightBasis ?? undefined,
      },
      select: {
        industryType: true,
        documentSet: true,
        defaultAdditionalDetails: true,
        defaultDescriptionOfGoods: true,
        defaultAdditionalInfo: true,
        defaultFreightBasis: true,
      },
    });
  }

  async updateActiveDocuments(orgId: string, userId: string, data: UpdateActiveDocumentsDto) {
    await this.assertMember(orgId, userId);

    await Promise.all(
      data.documents.map((doc) =>
        this.prisma.organizationActiveDocument.upsert({
          where: {
            organizationId_documentName: {
              organizationId: orgId,
              documentName: doc.documentName,
            },
          },
          create: {
            organizationId: orgId,
            documentName: doc.documentName,
            isEnabled: doc.isEnabled,
            displayOrder: doc.displayOrder ?? 0,
          },
          update: {
            isEnabled: doc.isEnabled,
            displayOrder: doc.displayOrder ?? undefined,
          },
        }),
      ),
    );

    return { message: 'Active documents updated' };
  }

  private async assertMember(orgId: string, userId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this organization');
  }
}
