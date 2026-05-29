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

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateOrgDto) {
    const baseSlug = slugify(data.name);
    const slug = await this.uniqueSlug(baseSlug);

    const org = await this.prisma.organization.create({
      data: {
        name: data.name,
        tradeName: data.tradeName,
        country: data.country ?? 'India',
        slug,
        members: {
          create: { userId, role: 'OWNER' },
        },
      },
      include: { members: true },
    });

    return org;
  }

  async findAll(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        deletedAt: null,
        members: { some: { userId } },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
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
      },
    });

    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(orgId: string, userId: string, data: UpdateOrgDto) {
    await this.assertMember(orgId, userId);

    return this.prisma.organization.update({
      where: { id: orgId },
      data: {
        ...data,
        rcmcExpiry: data.rcmcExpiry ? new Date(data.rcmcExpiry) : undefined,
        dgftExpiry: data.dgftExpiry ? new Date(data.dgftExpiry) : undefined,
      },
    });
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
    await this.prisma.organization.update({
      where: { id: orgId },
      data: { [field]: fileUrl },
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
