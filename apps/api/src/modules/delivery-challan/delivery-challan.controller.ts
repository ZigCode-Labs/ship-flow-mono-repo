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
import { DeliveryChallanService } from './delivery-challan.service';
import {
  createDeliveryChallanSchema,
  updateDeliveryChallanSchema,
} from './delivery-challan.schema';

@Controller('delivery-challans')
export class DeliveryChallanController {
  constructor(
    private readonly deliveryChallanService: DeliveryChallanService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: unknown) {
    const result = createDeliveryChallanSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.deliveryChallanService.create(result.data);
  }

  @Get('next-number')
  @HttpCode(HttpStatus.OK)
  getNextNumber() {
    return this.deliveryChallanService.getNextNumber();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.deliveryChallanService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.deliveryChallanService.findOne(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() body: unknown) {
    const result = updateDeliveryChallanSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.deliveryChallanService.update(id, result.data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.deliveryChallanService.remove(id);
  }
}
