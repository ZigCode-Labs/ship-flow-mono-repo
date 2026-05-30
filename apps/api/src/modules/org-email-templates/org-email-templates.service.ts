import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@shipflow/database';
import { UpsertEmailTemplateDto, EXPORT_DOC_TYPES, DEFAULT_TEMPLATES, ExportDocType } from './org-email-templates.schema';

@Injectable()
export class OrgEmailTemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, userId: string) {
    await this.assertMember(orgId, userId);

    const existing = await this.prisma.organizationEmailTemplate.findMany({
      where: { organizationId: orgId },
    });

    const existingMap = new Map(existing.map((t) => [t.documentType, t]));

    return EXPORT_DOC_TYPES.map((docType) => {
      const saved = existingMap.get(docType);
      if (saved) return saved;
      const def = DEFAULT_TEMPLATES[docType];
      return {
        id: null,
        organizationId: orgId,
        documentType: docType,
        subjectTemplate: def.subject,
        bodyTemplate: def.body,
        defaultCc: null,
        defaultBcc: null,
        createdAt: null,
        updatedAt: null,
      };
    });
  }

  async findOne(orgId: string, docType: string, userId: string) {
    await this.assertMember(orgId, userId);

    const saved = await this.prisma.organizationEmailTemplate.findUnique({
      where: { organizationId_documentType: { organizationId: orgId, documentType: docType } },
    });

    if (saved) return saved;

    if (EXPORT_DOC_TYPES.includes(docType as ExportDocType)) {
      const def = DEFAULT_TEMPLATES[docType as ExportDocType];
      return {
        id: null,
        organizationId: orgId,
        documentType: docType,
        subjectTemplate: def.subject,
        bodyTemplate: def.body,
        defaultCc: null,
        defaultBcc: null,
      };
    }

    throw new NotFoundException('Template not found');
  }

  async upsert(orgId: string, docType: string, userId: string, data: UpsertEmailTemplateDto) {
    await this.assertMember(orgId, userId);

    return this.prisma.organizationEmailTemplate.upsert({
      where: { organizationId_documentType: { organizationId: orgId, documentType: docType } },
      create: {
        organizationId: orgId,
        documentType: docType,
        subjectTemplate: data.subjectTemplate,
        bodyTemplate: data.bodyTemplate,
        defaultCc: data.defaultCc ?? null,
        defaultBcc: data.defaultBcc ?? null,
      },
      update: {
        subjectTemplate: data.subjectTemplate,
        bodyTemplate: data.bodyTemplate,
        defaultCc: data.defaultCc ?? null,
        defaultBcc: data.defaultBcc ?? null,
      },
    });
  }

  private async assertMember(orgId: string, userId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });
    if (!member) throw new ForbiddenException('Not a member of this organization');
  }
}
