import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '@shipflow/database';
import {
  ChangePasswordDto,
  ChangeEmailDto,
  Verify2faDto,
  Disable2faDto,
  UpdateProfileDto,
} from './user-profile.schema';

// otplib and qrcode are optional — install with:
//   pnpm --filter @shipflow/api add otplib qrcode
//   pnpm --filter @shipflow/api add -D @types/qrcode
let totp: { generateSecret(): string; keyuri(email: string, service: string, secret: string): string; verify(opts: { token: string; secret: string }): boolean } | null = null;
let qrcodeToDataURL: ((text: string) => Promise<string>) | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const otplib = require('otplib');
  totp = otplib.totp;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const qrcode = require('qrcode');
  qrcodeToDataURL = qrcode.toDataURL;
} catch {
  // 2FA unavailable until packages installed
}

@Injectable()
export class UserProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        profilePhotoUrl: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profilePhotoUrl: true,
        twoFactorEnabled: true,
      },
    });
  }

  async uploadProfilePhoto(
    userId: string,
    file: { originalname: string; buffer: Buffer },
  ) {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = path.extname(file.originalname);
    const filename = `user-${userId}-photo-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    const photoUrl = `/uploads/${filename}`;
    await this.prisma.user.update({ where: { id: userId }, data: { profilePhotoUrl: photoUrl } });
    return { url: photoUrl };
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await argon2.verify(user.password, data.currentPassword);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const hashed = await argon2.hash(data.newPassword);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { message: 'Password changed successfully' };
  }

  async changeEmail(userId: string, data: ChangeEmailDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await argon2.verify(user.password, data.password);
    if (!valid) throw new UnauthorizedException('Incorrect password');

    const existing = await this.prisma.user.findUnique({ where: { email: data.newEmail } });
    if (existing) throw new BadRequestException('Email already in use');

    await this.prisma.user.update({
      where: { id: userId },
      data: { email: data.newEmail, emailVerified: false, refreshToken: null },
    });
    return { message: 'Email updated. Please log in again with your new email.' };
  }

  async setup2fa(userId: string) {
    if (!totp || !qrcodeToDataURL) {
      throw new BadRequestException(
        '2FA is not available. Install: pnpm --filter @shipflow/api add otplib qrcode',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.twoFactorEnabled) throw new BadRequestException('2FA is already enabled');

    const secret = totp.generateSecret();
    const otpAuthUrl = totp.keyuri(user.email, 'ShipFlow', secret);
    const qrCodeDataUrl = await qrcodeToDataURL(otpAuthUrl);

    await this.prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });

    return { qrCodeDataUrl, secret, otpAuthUrl };
  }

  async verify2fa(userId: string, data: Verify2faDto) {
    if (!totp) throw new BadRequestException('2FA packages not installed');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.twoFactorSecret) throw new BadRequestException('Run 2FA setup first');
    if (user.twoFactorEnabled) throw new BadRequestException('2FA is already enabled');

    const valid = totp.verify({ token: data.token, secret: user.twoFactorSecret });
    if (!valid) throw new BadRequestException('Invalid verification code');

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
    return { message: '2FA enabled successfully' };
  }

  async disable2fa(userId: string, data: Disable2faDto) {
    if (!totp) throw new BadRequestException('2FA packages not installed');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.twoFactorEnabled) throw new BadRequestException('2FA is not enabled');

    const valid = totp.verify({ token: data.token, secret: user.twoFactorSecret! });
    if (!valid) throw new BadRequestException('Invalid verification code');

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    return { message: '2FA disabled successfully' };
  }
}
