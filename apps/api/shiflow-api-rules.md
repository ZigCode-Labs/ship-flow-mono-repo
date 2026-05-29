# Ship-Flow API: Organic Rules & Code Conventions

This document defines the organic rules, code conventions, and best practices for the Ship-Flow API project. All team members and contributors should follow these guidelines to maintain consistency, readability, and maintainability across the codebase.

---

## Table of Contents

1.  [Naming Conventions](#naming-conventions)
2.  [Code Style & Formatting](#code-style--formatting)
3.  [TypeScript Configuration](#typescript-configuration)
4.  [NestJS Architecture Patterns](#nestjs-architecture-patterns)
5.  [Testing Guidelines](#testing-guidelines)
6.  [Development Workflow](#development-workflow)
7.  [Git & Contribution Guidelines](#git--contribution-guidelines)
8.  [Common Patterns & Examples](#common-patterns--examples)
9.  [Configuration Rationale](#configuration-rationale)

---

## Naming Conventions

### File Naming

Files follow a **kebab-case convention with descriptive feature suffixes**:

Element

Pattern

Example

Controllers

`[feature].controller.ts`

`user.controller.ts`, `product.controller.ts`

Services

`[feature].service.ts`

`user.service.ts`, `product.service.ts`

Modules

`[feature].module.ts`

`user.module.ts`, `product.module.ts`

DTOs

`[feature].dto.ts`

`create-user.dto.ts`, `update-product.dto.ts`

Interfaces

`[feature].interface.ts`

`user.interface.ts`, `product.interface.ts`

Constants

`[feature].constants.ts`

`user.constants.ts`

Unit Tests

`[feature].spec.ts`

`user.service.spec.ts`, `user.controller.spec.ts`

E2E Tests

`[feature].e2e-spec.ts`

`user.e2e-spec.ts`

### Class Naming

Classes use **PascalCase**:

```typescript
// Controllersexport class UserController {}export class ProductController {}// Servicesexport class UserService {}export class ProductService {}// Modulesexport class UserModule {}export class AppModule {}// DTOsexport class CreateUserDto {}export class UpdateProductDto {}// Interfacesexport class UserEntity {}export interface IUser {}
```

### Method & Function Naming

Methods and functions use **camelCase** with descriptive action verbs:

```typescript
// Service methodsfindAll()findById(id: string)create(dto: CreateUserDto)update(id: string, dto: UpdateUserDto)delete(id: string)getUserWithOrders(userId: string)validateUserEmail(email: string)// Controller methodsgetHello()getAllUsers()getUserById(id: string)createUser(dto: CreateUserDto)updateUser(id: string, dto: UpdateUserDto)deleteUser(id: string)
```

### Variable & Property Naming

Variables and properties use **camelCase**:

```typescript
// Variablesconst userId = 'user-123';let totalPrice = 0;const isActive = true;const userList = [];// Private properties with readonly modifierprivate readonly userService: UserService;private readonly configService: ConfigService;private readonly logger = new Logger('UserController');// Public properties (avoid when possible; prefer private)public username: string;
```

### Constants

Constants use **UPPER_SNAKE_CASE**:

```typescript
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;
const API_VERSION = 'v1';
const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  INVALID_EMAIL: 'Invalid email format',
};
```

---

## Code Style & Formatting

### Formatter & Linter

- **Formatter**: Prettier 3.4.2
- **Linter**: ESLint 9.x with TypeScript support
- **Integration**: ESLint enforces Prettier compatibility

### Code Formatting Rules

Setting

Value

Purpose

Line Endings

`auto`

Handles Windows/Unix compatibility

Indentation

2 spaces

Default Prettier setting

Quote Style

Single quotes (TS files)

ESLint/Prettier default

Semicolons

Required

Explicit semicolon usage

Trailing Comma

ES5 compatible

Prettier default

Arrow Parens

Always

`(param) => {}` not `param => {}`

Print Width

80 chars (default)

Line readability

### Running Formatters

```bash
# Format all TypeScript files in src/ and test/npm run format# Run ESLint with auto-fix for violationsnpm run lint# Check without fixing (useful in CI)npm run lint -- --no-fix
```

### Linting Rules

#### Enforced Rules (Errors)

- **Prettier formatting** — Code must conform to Prettier output format
- **Type safety** — TypeScript strict mode enabled (see [TypeScript Configuration](#typescript-configuration))

#### Warning Rules

- `@typescript-eslint/no-floating-promises` — Unhandled promise rejections
- `@typescript-eslint/no-unsafe-argument` — Unsafe function arguments
- `@typescript-eslint/no-explicit-any` — **OFF** (allowed for rapid development)

#### Disabled Rules

- `@typescript-eslint/no-explicit-any` — Team decision for flexibility
- `@typescript-eslint/strictBindCallApply` — Allows bind/call/apply patterns
- `noFallthroughCasesInSwitch` — Switch fall-through patterns allowed with caution

### Code Conventions

```typescript
// ✅ Good: Use const and readonly for immutabilityprivate readonly userService: UserService;const MAX_USERS = 100;// ✅ Good: Group imports logicallyimport { Controller, Get, Post } from '@nestjs/common';import { Logger } from '@nestjs/common';import { UserService } from './user.service';import { CreateUserDto } from './dto/create-user.dto';// ✅ Good: Use dependency injection in constructorconstructor(  private readonly userService: UserService,  private readonly logger: Logger,  private readonly configService: ConfigService,) {}// ❌ Avoid: Logging without structureconsole.log('User created');// ✅ Good: Use structured logging with NestJS Loggerthis.logger.log('User created with ID: ' + userId);this.logger.error('Failed to create user', error);// ✅ Good: Error handling with try-catchtry {  const user = await this.userService.findById(id);  return user;} catch (error) {  this.logger.error(`Error fetching user ${id}:`, error);  throw new NotFoundException('User not found');}// ✅ Good: Use explicit types (avoid implicit any)const users: User[] = [];const config: IConfig = {};
```

---

## TypeScript Configuration

### Compiler Options

Setting

Value

Purpose

**target**

ES2023

Modern JavaScript features

**module**

nodenext

ES modules with Node.js support

**lib**

ES2023

Standard library definitions

**strict**

true

Enables all strict type checks

**strictNullChecks**

true

Null/undefined handling required

**noImplicitAny**

false

Allows implicit `any` for flexibility

**experimentalDecorators**

true

Required for NestJS decorators

**emitDecoratorMetadata**

true

Required for NestJS dependency injection

**declaration**

true

Generate `.d.ts` files

**declarationMap**

true

Enable declaration source maps

**sourceMap**

true

Generate source maps for debugging

**outDir**

./dist

Compiled output location

**rootDir**

./src

Source root directory

**removeComments**

true

Remove comments in production

**incremental**

true

Enable incremental compilation

### TypeScript Best Practices

```typescript
// ✅ Good: Define explicit interfaces for complex typesinterface UserQuery {  page: number;  limit: number;  search?: string;}interface UserResponse {  data: User[];  total: number;  page: number;}// ✅ Good: Use strict null checksconst user: User | null = await this.userService.findById(id);if (user === null) {  throw new NotFoundException('User not found');}// ✅ Good: Use typed DTOs with Zod validationimport { z } from 'zod';export const createUserSchema = z.object({  name: z.string().min(1, 'Name is required'),  email: z.string().email('Invalid email format'),});export type CreateUserDto = z.infer<typeof createUserSchema>;// ✅ Good: Return typed responses from servicesasync findAll(): Promise<User[]> {  return this.userRepository.find();}// ❌ Avoid: Implicit any in return typesasync findAll() {  // TypeScript infers this as Promise<any>  return this.userRepository.find();}
```

---

## NestJS Architecture Patterns

### Module Structure

Each feature should have its own module organizing related components:

```typescript
// user.module.tsimport { Module } from '@nestjs/common';import { UserController } from './user.controller';import { UserService } from './user.service';@Module({  imports: [],  controllers: [UserController],  providers: [UserService],  exports: [UserService], // Export for other modules})export class UserModule {}
```

### Controller Pattern

Controllers handle HTTP requests and delegate to services:

```typescript
// user.controller.tsimport {  Controller,  Get,  Post,  Body,  Param,  Delete,  Put,  HttpCode,  HttpStatus,} from '@nestjs/common';import { UserService } from './user.service';import { CreateUserDto } from './dto/create-user.dto';import { UpdateUserDto } from './dto/update-user.dto';@Controller('users')export class UserController {  constructor(private readonly userService: UserService) {}  @Get()  @HttpCode(HttpStatus.OK)  findAll() {    return this.userService.findAll();  }  @Get(':id')  @HttpCode(HttpStatus.OK)  findById(@Param('id') id: string) {    return this.userService.findById(id);  }  @Post()  @HttpCode(HttpStatus.CREATED)  create(@Body() createUserDto: CreateUserDto) {    return this.userService.create(createUserDto);  }  @Put(':id')  @HttpCode(HttpStatus.OK)  update(    @Param('id') id: string,    @Body() updateUserDto: UpdateUserDto,  ) {    return this.userService.update(id, updateUserDto);  }  @Delete(':id')  @HttpCode(HttpStatus.NO_CONTENT)  delete(@Param('id') id: string) {    return this.userService.delete(id);  }}
```

### Service Pattern

Services contain business logic and database operations:

```typescript
// user.service.tsimport { Injectable, NotFoundException } from '@nestjs/common';import { CreateUserDto } from './dto/create-user.dto';import { UpdateUserDto } from './dto/update-user.dto';import { User } from './user.entity';@Injectable()export class UserService {  constructor() {    // Inject repositories, other services, config, etc.  }  async findAll(): Promise<User[]> {    try {      return await this.prisma.user.findMany();    } catch (error) {      this.logger.error('Error fetching users', error);      throw error;    }  }  async findById(id: string): Promise<User> {    const user = await this.prisma.user.findUnique({      where: { id },    });    if (!user) {      throw new NotFoundException(`User with ID ${id} not found`);    }    return user;  }  async create(createUserDto: CreateUserDto): Promise<User> {    // Zod validates input at runtime with schema.parse()    // Execute business logic    // Persist to database    const user = await this.prisma.user.create({      data: createUserDto,    });    return user;  }  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {    await this.findById(id); // Ensures user exists    return await this.prisma.user.update({      where: { id },      data: updateUserDto,    });  }  async delete(id: string): Promise<void> {    await this.findById(id); // Ensures user exists    await this.prisma.user.delete({      where: { id },    });  }}
```

### Prisma Service Integration

Create a `PrismaService` wrapper for database access:

```typescript
// prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

Then provide it in your module:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
```

### Dependency Injection

Always use NestJS's constructor-based dependency injection:

```typescript
// ✅ Good: Constructor-based dependency injection@Injectable()export class UserService {  constructor(    private readonly prisma: PrismaService,    private readonly emailService: EmailService,    private readonly logger: Logger,    private readonly configService: ConfigService,  ) {}}// ✅ Good: Injecting scoped services@Controller('users')export class UserController {  constructor(    private readonly userService: UserService,    private readonly logger: Logger,  ) {}}// ❌ Avoid: Direct instantiation (breaks DI)export class UserService {  private emailService = new EmailService(); // ❌ Wrong}
```

### Input Validation with Zod

Use Zod schemas to validate and transform request data in controllers:

```typescript
// user.controller.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import { createUserSchema, updateUserSchema } from './user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: unknown) {
    try {
      const validatedDto = createUserSchema.parse(body);
      return this.userService.create(validatedDto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      throw error;
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    try {
      const validatedDto = updateUserSchema.parse(body);
      return this.userService.update(id, validatedDto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      throw error;
    }
  }
}

// Optional: Create a reusable validation pipe
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      throw error;
    }
  }
}

// Usage with pipe
@Post()
@HttpCode(HttpStatus.CREATED)
create(
  @Body(new ZodValidationPipe(createUserSchema))
  createUserDto: CreateUserDto,
) {
  return this.userService.create(createUserDto);
}
```

### Error Handling

Use NestJS built-in HTTP exceptions:

```typescript
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'; // ✅ Use appropriate exceptionsif (!user) {  throw new NotFoundException('User not found');}if (user.email === existingEmail) {  throw new ConflictException('Email already in use');}if (!isValidInput) {  throw new BadRequestException('Invalid input format');}if (!hasPermission) {  throw new ForbiddenException('Access denied');}if (!isAuthenticated) {  throw new UnauthorizedException('Authentication required');}
```

---

## Testing Guidelines

### Unit Tests

Unit tests verify individual components in isolation:

```typescript
// user.service.spec.tsimport { Test, TestingModule } from '@nestjs/testing';import { UserService } from './user.service';import { NotFoundException } from '@nestjs/common';describe('UserService', () => {  let service: UserService;  let mockUserRepository: any;  beforeEach(async () => {    // Mock dependencies    mockUserRepository = {      find: jest.fn(),      findOne: jest.fn(),      create: jest.fn(),      save: jest.fn(),    };    // Create testing module    const module: TestingModule = await Test.createTestingModule({      providers: [        UserService,        {          provide: 'USER_REPOSITORY',          useValue: mockUserRepository,        },      ],    }).compile();    service = module.get<UserService>(UserService);  });  describe('findById', () => {    it('should return a user when found', async () => {      const user = { id: '1', name: 'John', email: 'john@example.com' };      mockUserRepository.findOne.mockResolvedValue(user);      const result = await service.findById('1');      expect(result).toEqual(user);    });    it('should throw NotFoundException when user not found', async () => {      mockUserRepository.findOne.mockResolvedValue(null);      await expect(service.findById('999')).rejects.toThrow(        NotFoundException,      );    });  });  describe('create', () => {    it('should create and return a new user', async () => {      const createDto = { name: 'Jane', email: 'jane@example.com' };      const user = { id: '2', ...createDto };      mockUserRepository.create.mockReturnValue(user);      mockUserRepository.save.mockResolvedValue(user);      const result = await service.create(createDto);      expect(result).toEqual(user);      expect(mockUserRepository.create).toHaveBeenCalledWith(createDto);    });  });});
```

### E2E Tests

E2E tests verify complete workflows through the API:

```typescript
// user.e2e-spec.tsimport { INestApplication } from '@nestjs/common';import { Test, TestingModule } from '@nestjs/testing';import * as request from 'supertest';import { AppModule } from '../src/app.module';describe('User API (e2e)', () => {  let app: INestApplication;  beforeAll(async () => {    const moduleFixture: TestingModule = await Test.createTestingModule({      imports: [AppModule],    }).compile();    app = moduleFixture.createNestApplication();    await app.init();  });  afterAll(async () => {    await app.close();  });  describe('GET /users', () => {    it('should return an array of users', () => {      return request(app.getHttpServer())        .get('/users')        .expect(200)        .expect((res) => {          expect(Array.isArray(res.body)).toBe(true);        });    });  });  describe('POST /users', () => {    it('should create a new user', () => {      const createUserDto = {        name: 'Test User',        email: 'test@example.com',      };      return request(app.getHttpServer())        .post('/users')        .send(createUserDto)        .expect(201)        .expect((res) => {          expect(res.body).toHaveProperty('id');          expect(res.body.name).toBe(createUserDto.name);          expect(res.body.email).toBe(createUserDto.email);        });    });  });});
```

### Test File Naming & Organization

Type

Pattern

Example

Location

Unit Tests

`[feature].spec.ts`

`user.service.spec.ts`

Same directory as source

E2E Tests

`[feature].e2e-spec.ts`

`user.e2e-spec.ts`

`test/` directory

### Running Tests

```bash
# Run all unit testsnpm run test# Run tests in watch modenpm run test:watch# Run tests with coverage reportnpm run test:cov# Run E2E testsnpm run test:e2e
```

---

## Development Workflow

### Local Development

```bash
# Install dependenciesnpm install# Start development server with hot reloadnpm run start:dev# The API will run on http://localhost:4000 (or $PORT environment variable)
```

### Building for Production

```bash
# Build the projectnpm run build# Runs: tsc (TypeScript compilation)# Output: ./dist/ directory with compiled JavaScript
```

### Running Production Build

```bash
# Start production servernpm run start:prod# Runs: node dist/main.js# No source maps, optimized code
```

### Debugging

```bash
# Start with Node.js debuggernpm run start:debug# Opens debugger on default inspector port (9229)# Attach with VS Code or Chrome DevTools
```

### Code Quality Checks

```bash
# Format code with Prettiernpm run format# Lint and auto-fix issues with ESLintnpm run lint# Run all testsnpm run test# Run tests with coveragenpm run test:cov# Run E2E testsnpm run test:e2e
```

### Environment Configuration

Configuration is managed via environment variables:

```bash
# .env examplePORT=4000NODE_ENV=development# DatabaseDB_HOST=localhostDB_PORT=5432DB_USER=postgresDB_PASSWORD=passwordDB_NAME=shipflow_dev# APIAPI_KEY=your-api-key-hereCORS_ORIGIN=http://localhost:3000
```

Access environment variables using `ConfigService`:

```typescript
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MyService {
  constructor(private configService: ConfigService) {}
  doSomething() {
    const port = this.configService.get('PORT');
    const dbHost = this.configService.get('DB_HOST');
  }
}
```

---

## Git & Contribution Guidelines

### Branch Naming

- **Feature branches**: `feature/description` (e.g., `feature/user-authentication`)
- **Bug fix branches**: `fix/description` (e.g., `fix/password-reset-email`)
- **Refactor branches**: `refactor/description` (e.g., `refactor/service-layer`)
- **Docs branches**: `docs/description` (e.g., `docs/api-documentation`)

### Commit Messages

Commit messages should be clear, concise, and follow this format:

```
<type>: <subject><body (optional)><footer (optional)>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Examples:

```
feat: add user authentication servicefix: resolve email validation bugdocs: update API documentationrefactor: simplify user controller methodstest: add unit tests for user service
```

### Pre-commit Checklist

Before committing code:

- Code follows naming conventions
- Code is formatted (`npm run format`)
- Code passes linting (`npm run lint`)
- Unit tests pass (`npm run test`)
- Code changes are minimal and focused
- Commit message is clear and descriptive
- No `console.log` statements (use Logger instead)
- No hardcoded values (use environment variables or constants)

### Pull Request Process

1.  Create feature branch from main: `git checkout -b feature/description`
2.  Make changes and commit with descriptive messages
3.  Push to remote: `git push origin feature/description`
4.  Create pull request with clear title and description
5.  Ensure all tests pass in CI/CD pipeline
6.  Request code review from team members
7.  Address feedback and make requested changes
8.  After approval, merge to main branch

---

## Common Patterns & Examples

### Creating a New Feature Module

```bash
# Generate a new module with NestJS CLInest generate service user          # Creates user.service.tsnest generate controller user       # Creates user.controller.tsnest generate module user           # Creates user.module.ts
```

### DTO with Zod Validation

```typescript
// user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
}).partial();

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

// Usage in controller
@Post()
@HttpCode(HttpStatus.CREATED)
create(@Body() body: unknown) {
  const createUserDto = createUserSchema.parse(body);
  return this.userService.create(createUserDto);
}
```

### Prisma Schema Definition

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  hashedPassword String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

**Key Prisma Patterns**:

- `@id` — Primary key (unique identifier)
- `@default(cuid())` — Generate unique ID on creation
- `@unique` — Enforce uniqueness constraint
- `@default(now())` — Auto-set current timestamp
- `@updatedAt` — Auto-update timestamp on any change
- `@@map` — Map model to database table name

### Resource (DTO) Pattern

When returning data to the API client, transform Prisma models to exclude sensitive fields:

```typescript
// user.dto.ts
import { z } from 'zod';
import { User } from '@prisma/client';

export const userResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserResource = z.infer<typeof userResourceSchema>;

// Helper function to transform Prisma model to resource
export const toUserResource = (user: User): UserResource => ({
  id: user.id,
  name: user.name,
  email: user.email,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  // Note: hashedPassword is never included in response
});

// Controller usage
@Get(':id')
async findById(@Param('id') id: string) {
  const user = await this.userService.findById(id);
  return toUserResource(user); // Transform before returning
}
```

---

## Configuration Rationale

### Why ES2023 Target?

- Modern JavaScript features (optional chaining, nullish coalescing, etc.)
- Better performance in modern Node.js environments
- Cleaner, more readable code

### Why Decorator Metadata?

- Required for NestJS dependency injection system
- Enables runtime type information for validation, serialization
- Powers NestJS middleware and interceptors

### Why Strict TypeScript?

- Catches potential null/undefined errors at compile time
- Improves code reliability and maintainability
- Makes refactoring safer

### Why Allow Implicit Any?

- Balance between type safety and development velocity
- Useful for rapid prototyping and third-party APIs with poor types
- Team decision to enable faster iteration

### Why ESLint + Prettier?

- **ESLint**: Catches code quality issues and bugs
- **Prettier**: Enforces consistent code formatting automatically
- **Together**: Eliminates formatting debates; developers focus on logic
- **Integration**: Prettier writes code, ESLint validates

### Why Zod for Validation?

- **Type-safe validation**: Automatically infers TypeScript types from schema
- **Runtime validation**: Validates at runtime with clear error messages
- **No decorators**: Schema-based approach is cleaner and more functional
- **Composable**: Easily combine and reuse validation schemas
- **Framework agnostic**: Works with any framework, not tied to decorators
- **Better performance**: Lighter weight than decorator-based validation

### Why Prisma for ORM?

- **Type safety**: Auto-generated typed client with full IDE autocomplete
- **Developer experience**: Intuitive query API with migrations
- **Database agnostic**: Works with PostgreSQL, MySQL, SQLite, etc.
- **Migration management**: Built-in schema versioning via migration files
- **Performance**: Efficient query building and relationship handling
- **Introspection**: Can generate schema from existing databases
- **Modern tooling**: Better integrates with modern Node.js practices

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [ESLint Configuration](./eslint.config.mjs)
- [TypeScript Configuration](./tsconfig.json)
- [NestJS CLI](https://docs.nestjs.com/cli/overview)

---

**Last Updated**: April 3, 2026  
**Maintained By**: Ship-Flow Development Team  
**Version**: 1.0.0
