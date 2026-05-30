import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@shipflow/database';
import { CreateOrgDto, UpdateOrgDto } from './organizations.schema';
import * as fs from 'fs';
import * as path from 'path';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const PROFILE_FIELDS = [
  'tradeName', 'addressLine1', 'addressLine2', 'city', 'state', 'pincode',
  'country', 'fax', 'phone', 'phone2', 'phone3', 'email', 'website',
  'authorizedSignatoryName', 'authorizedSignatoryDesignation',
] as const;

const COMPLIANCE_FIELDS = [
  'iecCode', 'gstNumber', 'panNumber', 'cinNumber', 'registrationNumber',
  'adCode', 'rcmcNumber', 'rcmcExpiry', 'dgftAuth', 'dgftExpiry',
  'tanNumber', 'ircNo', 'portRegistrationNumber', 'sedexRegistrationNumber',
  'complianceNotes',
] as const;

const BANKING_FIELDS = [
  'bankName', 'bankAccountNo', 'bankIFSC', 'bankBranch', 'bankAddress', 'swiftCode',
] as const;

const SMTP_FIELDS = [
  'smtpEnabled', 'smtpHost', 'smtpPort', 'smtpFromEmail', 'smtpFromName',
  'smtpUseTls', 'emailReplyTo',
] as const;

const EXPORT_DEFAULTS_FIELDS = [
  'masterCurrency', 'countryOfOrigin', 'portOfLoading', 'placeOfReceipt',
  'itemCodePrefix', 'itemCodeDigits', 'defaultInvoiceTerms', 'defaultProformaTerms',
] as const;

function pick<T extends Record<string, unknown>>(obj: T, keys: readonly string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

function hasFields(obj: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.some((k) => k in obj);
}

function flattenOrg(org: Record<string, unknown>): Record<string, unknown> {
  const { profile, compliance, banking, smtp, exportDefaults, ...core } = org;
  return {
    ...core,
    ...(profile as Record<string, unknown> | null),
    ...(compliance as Record<string, unknown> | null),
    ...(banking as Record<string, unknown> | null),
    ...(smtp as Record<string, unknown> | null),
    ...(exportDefaults as Record<string, unknown> | null),
  };
}

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateOrgDto) {
    const baseSlug = slugify(data.name);
    const slug = await this.uniqueSlug(baseSlug);

    const org = await this.prisma.organization.create({
      data: {
        name: data.name,
        slug,
        profile: {
          create: {
            tradeName: data.tradeName,
            country: data.country ?? 'India',
          },
        },
        members: {
          create: { userId, role: 'OWNER' },
        },
      },
      include: { members: true },
    });

    return org;
  }

  async findAll(userId: string) {
    const orgs = await this.prisma.organization.findMany({
      where: {
        deletedAt: null,
        members: { some: { userId } },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
        profile: {
          select: { tradeName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return orgs.map((org) => {
      const { profile, ...rest } = org;
      return { ...rest, tradeName: profile?.tradeName ?? null };
    });
  }

  async findOne(orgId: string, userId: string) {
    const org = await this.prisma.organization.findFirst({
      where: {
        id: orgId,
        deletedAt: null,
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        profile: true,
        compliance: true,
        banking: true,
        smtp: true,
        exportDefaults: true,
      },
    });

    if (!org) throw new NotFoundException('Organization not found');
    return flattenOrg(org as unknown as Record<string, unknown>);
  }

  async update(orgId: string, userId: string, data: UpdateOrgDto) {
    await this.assertMember(orgId, userId);

    const coreData: Record<string, unknown> = {};
    if ('name' in data) coreData.name = data.name;
    if ('onboardingDone' in data) coreData.onboardingDone = data.onboardingDone;

    const profileData = pick(data as Record<string, unknown>, PROFILE_FIELDS);
    const complianceData = pick(data as Record<string, unknown>, COMPLIANCE_FIELDS);
    const bankingData = pick(data as Record<string, unknown>, BANKING_FIELDS);
    const smtpData = pick(data as Record<string, unknown>, SMTP_FIELDS);
    const exportData = pick(data as Record<string, unknown>, EXPORT_DEFAULTS_FIELDS);

    if (complianceData.rcmcExpiry) complianceData.rcmcExpiry = new Date(complianceData.rcmcExpiry as string);
    if (complianceData.dgftExpiry) complianceData.dgftExpiry = new Date(complianceData.dgftExpiry as string);

    const operations: Promise<unknown>[] = [];

    if (Object.keys(coreData).length > 0) {
      operations.push(
        this.prisma.organization.update({
          where: { id: orgId },
          data: coreData,
        }),
      );
    }

    if (hasFields(data as Record<string, unknown>, PROFILE_FIELDS)) {
      operations.push(
        this.prisma.organizationProfile.upsert({
          where: { organizationId: orgId },
          create: { organizationId: orgId, ...profileData },
          update: profileData,
        }),
      );
    }

    if (hasFields(data as Record<string, unknown>, COMPLIANCE_FIELDS)) {
      operations.push(
        this.prisma.organizationCompliance.upsert({
          where: { organizationId: orgId },
          create: { organizationId: orgId, ...complianceData },
          update: complianceData,
        }),
      );
    }

    if (hasFields(data as Record<string, unknown>, BANKING_FIELDS)) {
      operations.push(
        this.prisma.organizationBanking.upsert({
          where: { organizationId: orgId },
          create: { organizationId: orgId, ...bankingData },
          update: bankingData,
        }),
      );
    }

    if (hasFields(data as Record<string, unknown>, SMTP_FIELDS)) {
      operations.push(
        this.prisma.organizationSmtp.upsert({
          where: { organizationId: orgId },
          create: { organizationId: orgId, ...smtpData },
          update: smtpData,
        }),
      );
    }

    if (hasFields(data as Record<string, unknown>, EXPORT_DEFAULTS_FIELDS)) {
      operations.push(
        this.prisma.organizationExportDefaults.upsert({
          where: { organizationId: orgId },
          create: { organizationId: orgId, ...exportData },
          update: exportData,
        }),
      );
    }

    await Promise.all(operations);

    return this.findOne(orgId, userId);
  }

  async softDelete(orgId: string, userId: string) {
    await this.assertOwner(orgId, userId);

    return this.prisma.organization.update({
      where: { id: orgId },
      data: { deletedAt: new Date() },
    });
  }

  async listMembers(orgId: string, userId: string) {
    await this.assertMember(orgId, userId);

    return this.prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async changeMemberRole(
    orgId: string,
    targetUserId: string,
    requesterId: string,
    role: 'OWNER' | 'ADMIN' | 'MEMBER',
  ) {
    await this.assertOwner(orgId, requesterId);

    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: orgId, userId: targetUserId },
      },
    });

    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.organizationMember.update({
      where: {
        organizationId_userId: { organizationId: orgId, userId: targetUserId },
      },
      data: { role },
    });
  }

  async removeMember(orgId: string, targetUserId: string, requesterId: string) {
    await this.assertOwner(orgId, requesterId);

    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: { organizationId: orgId, userId: targetUserId },
      },
    });

    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.organizationMember.delete({
      where: {
        organizationId_userId: { organizationId: orgId, userId: targetUserId },
      },
    });
  }

  async isMember(orgId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });
    return !!member;
  }

  private async assertMember(orgId: string, userId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });
    if (!member)
      throw new ForbiddenException('Not a member of this organization');
  }

  private async assertOwner(orgId: string, userId: string) {
    const member = await this.prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });
    if (!member || member.role !== 'OWNER')
      throw new ForbiddenException('Owner access required');
  }

  async saveFile(
    orgId: string,
    userId: string,
    file: { originalname: string; buffer: Buffer },
    field: 'logoUrl' | 'signatureUrl' | 'stampUrl',
  ) {
    await this.assertMember(orgId, userId);

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const filename = `${orgId}-${field}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    const fileUrl = `/uploads/${filename}`;
    await this.prisma.organizationProfile.upsert({
      where: { organizationId: orgId },
      create: { organizationId: orgId, [field]: fileUrl },
      update: { [field]: fileUrl },
    });

    return { url: fileUrl };
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = base;
    let attempt = 0;
    while (true) {
      const existing = await this.prisma.organization.findUnique({
        where: { slug },
      });
      if (!existing) return slug;
      attempt++;
      slug = `${base}-${attempt}`;
    }
  }
}
