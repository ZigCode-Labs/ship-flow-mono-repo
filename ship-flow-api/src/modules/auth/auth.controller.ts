import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from './auth.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: unknown, @Res() res: Response) {
    try {
      const result = registerSchema.safeParse(body);

      if (!result.success) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: result.error.issues,
        });
      }

      const user = await this.authService.register(result.data);

      return res.status(HttpStatus.CREATED).json({
        message: 'User registered successfully',
        data: user,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Something went wrong',
        errors:
          error instanceof BadRequestException
            ? (error.getResponse() as { errors?: unknown }).errors
            : undefined,
      });
    }
  }

  @Post('login')
  async login(@Body() body: unknown, @Res() res: Response) {
    try {
      const result = loginSchema.safeParse(body);

      if (!result.success) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: result.error.issues,
        });
      }

      const user = await this.authService.login(result.data);

      return res.status(HttpStatus.OK).json({
        message: 'Login successful',
        data: user,
      });
    } catch (error: any) {
      const status =
        error instanceof BadRequestException
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.UNAUTHORIZED;

      return res.status(status).json({
        message: error.message || 'Invalid credentials',
        errors:
          error instanceof BadRequestException
            ? (error.getResponse() as { errors?: unknown }).errors
            : undefined,
      });
    }
  }
}
