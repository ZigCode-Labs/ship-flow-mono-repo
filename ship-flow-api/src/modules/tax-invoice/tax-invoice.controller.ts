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
  Query,
} from '@nestjs/common';
import { TaxInvoiceService } from './tax-invoice.service';
import {
  createTaxInvoiceSchema,
  updateTaxInvoiceSchema,
  filterTaxInvoiceSchema,
} from './dto';

@Controller('tax-invoices')
export class TaxInvoiceController {
  constructor(private readonly taxInvoiceService: TaxInvoiceService) {}

  private parseUuid(id: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException({ message: 'Invalid ID format' });
    }
    return id;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: unknown) {
    const result = createTaxInvoiceSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.taxInvoiceService.create(result.data);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: unknown) {
    const result = filterTaxInvoiceSchema.safeParse(query);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.taxInvoiceService.findAll(result.data);
  }

  @Get('trash')
  @HttpCode(HttpStatus.OK)
  findTrash(@Query() query: unknown) {
    const result = filterTaxInvoiceSchema.safeParse(query);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.taxInvoiceService.findTrash(result.data);
  }

  @Get('next-number')
  @HttpCode(HttpStatus.OK)
  getNextNumber() {
    return this.taxInvoiceService.getNextNumber();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.taxInvoiceService.findOne(this.parseUuid(id));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() body: unknown) {
    const result = updateTaxInvoiceSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.taxInvoiceService.update(this.parseUuid(id), result.data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.taxInvoiceService.remove(this.parseUuid(id));
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  restore(@Param('id') id: string) {
    return this.taxInvoiceService.restore(this.parseUuid(id));
  }
}
