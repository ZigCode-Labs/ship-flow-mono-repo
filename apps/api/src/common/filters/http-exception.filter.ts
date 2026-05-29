import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@shipflow/database';

function prismaStatus(e: Prisma.PrismaClientKnownRequestError): number {
  switch (e.code) {
    case 'P2002': return HttpStatus.CONFLICT;
    case 'P2025': return HttpStatus.NOT_FOUND;
    case 'P2003': return HttpStatus.BAD_REQUEST;
    default: return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

function prismaMessage(e: Prisma.PrismaClientKnownRequestError): string {
  switch (e.code) {
    case 'P2002': return 'A record with that value already exists';
    case 'P2025': return 'Record not found';
    case 'P2003': return 'Related record not found';
    default: return 'Database error';
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errors: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : ((exceptionResponse as { message?: string })?.message ?? 'An error occurred');
      errors =
        typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? (exceptionResponse as { errors?: unknown }).errors
          : undefined;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = prismaStatus(exception);
      message = prismaMessage(exception);
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) this.logger.error(exception);
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid request data';
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Service temporarily unavailable';
      this.logger.error(exception);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      this.logger.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      ...(errors !== undefined && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
