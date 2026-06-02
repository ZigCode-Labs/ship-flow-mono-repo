import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserProfileService } from './user-profile.service';
import {
  changePasswordSchema,
  changeEmailSchema,
  verify2faSchema,
  disable2faSchema,
  updateProfileSchema,
} from './user-profile.schema';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

type MulterFile = {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
};

@Controller('users/me')
export class UserProfileController {
  constructor(private service: UserProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: JwtUser) {
    return this.service.getProfile(user.userId);
  }

  @Patch()
  updateProfile(@Body() body: unknown, @CurrentUser() user: JwtUser) {
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({ message: 'Validation failed', errors: result.error.issues });
    }
    return this.service.updateProfile(user.userId, result.data);
  }

  @Post('photo')
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(@UploadedFile() file: MulterFile, @CurrentUser() user: JwtUser) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.service.uploadProfilePhoto(user.userId, file);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(@Body() body: unknown, @CurrentUser() user: JwtUser) {
    const result = changePasswordSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({ message: 'Validation failed', errors: result.error.issues });
    }
    return this.service.changePassword(user.userId, result.data);
  }

  @Post('change-email')
  @HttpCode(HttpStatus.OK)
  changeEmail(@Body() body: unknown, @CurrentUser() user: JwtUser) {
    const result = changeEmailSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({ message: 'Validation failed', errors: result.error.issues });
    }
    return this.service.changeEmail(user.userId, result.data);
  }

  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  setup2fa(@CurrentUser() user: JwtUser) {
    return this.service.setup2fa(user.userId);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  verify2fa(@Body() body: unknown, @CurrentUser() user: JwtUser) {
    const result = verify2faSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({ message: 'Validation failed', errors: result.error.issues });
    }
    return this.service.verify2fa(user.userId, result.data);
  }

  @Delete('2fa')
  @HttpCode(HttpStatus.OK)
  disable2fa(@Body() body: unknown, @CurrentUser() user: JwtUser) {
    const result = disable2faSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({ message: 'Validation failed', errors: result.error.issues });
    }
    return this.service.disable2fa(user.userId, result.data);
  }
}
