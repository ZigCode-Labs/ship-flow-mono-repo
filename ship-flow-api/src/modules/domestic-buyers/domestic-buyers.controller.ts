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
  Put,
  Query,
} from '@nestjs/common';
import { DomesticBuyersService } from './domestic-buyers.service';
import {
  createDomesticBuyerSchema,
  domesticBuyerIdSchema,
  domesticBuyerStatusSchema,
  updateDomesticBuyerSchema,
} from './domestic-buyers.schema';

@Controller('domestic-buyers')
export class DomesticBuyersController {
  constructor(private readonly domesticBuyersService: DomesticBuyersService) {}

  private parseId(id: string) {
    const result = domesticBuyerIdSchema.safeParse(id);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return result.data;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: unknown) {
    const result = createDomesticBuyerSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.domesticBuyersService.create(result.data);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query('status') status?: string) {
    if (!status) {
      return this.domesticBuyersService.findAll();
    }

    const result = domesticBuyerStatusSchema.safeParse(status);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.domesticBuyersService.findAll(result.data);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.domesticBuyersService.findOne(this.parseId(id));
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  replace(@Param('id') id: string, @Body() body: unknown) {
    const result = createDomesticBuyerSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.domesticBuyersService.update(this.parseId(id), result.data);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() body: unknown) {
    const result = updateDomesticBuyerSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.domesticBuyersService.update(this.parseId(id), result.data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.domesticBuyersService.remove(this.parseId(id));
  }
}
