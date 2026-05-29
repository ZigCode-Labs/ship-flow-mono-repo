import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrganizationsService } from './organizations.service';

type UploadedFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};
import {
  createOrgSchema,
  updateOrgSchema,
  orgIdSchema,
  memberRoleSchema,
} from './organizations.schema';
import {
  CurrentUser,
  JwtUser,
} from '../../common/decorators/current-user.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: unknown, @CurrentUser() user: JwtUser) {
    const result = createOrgSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }
    return this.orgsService.create(user.userId, result.data);
  }

  @Get()
  findAll(@CurrentUser() user: JwtUser) {
    return this.orgsService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const parsed = orgIdSchema.safeParse(id);
    if (!parsed.success)
      throw new BadRequestException('Invalid organization ID');
    return this.orgsService.findOne(parsed.data, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: JwtUser,
  ) {
    const idParsed = orgIdSchema.safeParse(id);
    if (!idParsed.success)
      throw new BadRequestException('Invalid organization ID');
    const result = updateOrgSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }
    return this.orgsService.update(idParsed.data, user.userId, result.data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  softDelete(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const parsed = orgIdSchema.safeParse(id);
    if (!parsed.success)
      throw new BadRequestException('Invalid organization ID');
    return this.orgsService.softDelete(parsed.data, user.userId);
  }

  @Get(':id/members')
  listMembers(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    const parsed = orgIdSchema.safeParse(id);
    if (!parsed.success)
      throw new BadRequestException('Invalid organization ID');
    return this.orgsService.listMembers(parsed.data, user.userId);
  }

  @Patch(':id/members/:uid')
  changeMemberRole(
    @Param('id') id: string,
    @Param('uid') uid: string,
    @Body() body: unknown,
    @CurrentUser() user: JwtUser,
  ) {
    const idParsed = orgIdSchema.safeParse(id);
    if (!idParsed.success)
      throw new BadRequestException('Invalid organization ID');
    const uidParsed = orgIdSchema.safeParse(uid);
    if (!uidParsed.success) throw new BadRequestException('Invalid user ID');
    const result = memberRoleSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }
    return this.orgsService.changeMemberRole(
      idParsed.data,
      uidParsed.data,
      user.userId,
      result.data.role,
    );
  }

  @Delete(':id/members/:uid')
  @HttpCode(HttpStatus.OK)
  removeMember(
    @Param('id') id: string,
    @Param('uid') uid: string,
    @CurrentUser() user: JwtUser,
  ) {
    const idParsed = orgIdSchema.safeParse(id);
    if (!idParsed.success)
      throw new BadRequestException('Invalid organization ID');
    const uidParsed = orgIdSchema.safeParse(uid);
    if (!uidParsed.success) throw new BadRequestException('Invalid user ID');
    return this.orgsService.removeMember(
      idParsed.data,
      uidParsed.data,
      user.userId,
    );
  }

  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file'))
  uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: UploadedFile,
    @CurrentUser() user: JwtUser,
  ) {
    const idParsed = orgIdSchema.safeParse(id);
    if (!idParsed.success)
      throw new BadRequestException('Invalid organization ID');
    if (!file) throw new BadRequestException('No file uploaded');
    return this.orgsService.saveFile(
      idParsed.data,
      user.userId,
      file,
      'logoUrl',
    );
  }

  @Post(':id/signature')
  @UseInterceptors(FileInterceptor('file'))
  uploadSignature(
    @Param('id') id: string,
    @UploadedFile() file: UploadedFile,
    @CurrentUser() user: JwtUser,
  ) {
    const idParsed = orgIdSchema.safeParse(id);
    if (!idParsed.success)
      throw new BadRequestException('Invalid organization ID');
    if (!file) throw new BadRequestException('No file uploaded');
    return this.orgsService.saveFile(
      idParsed.data,
      user.userId,
      file,
      'signatureUrl',
    );
  }
}
