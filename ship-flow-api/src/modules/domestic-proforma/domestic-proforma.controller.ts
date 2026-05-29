import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { DomesticProformaService } from './domestic-proforma.service';
import {
  createDomesticProformaSchema,
  updateDomesticProformaSchema,
} from './domestic-proforma.schema';

@Controller('domestic-proformas')
export class DomesticProformaController {
  constructor(
    private readonly domesticProformaService: DomesticProformaService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: unknown) {
    const result = createDomesticProformaSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.domesticProformaService.create(result.data);
  }

  @Get('next-number')
  @HttpCode(HttpStatus.OK)
  getNextNumber() {
    return this.domesticProformaService.getNextNumber();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.domesticProformaService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.domesticProformaService.findOne(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() body: unknown) {
    const result = updateDomesticProformaSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.domesticProformaService.update(id, result.data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.domesticProformaService.remove(id);
  }
}
