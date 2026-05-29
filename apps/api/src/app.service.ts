import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shipflow/database';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }
}
