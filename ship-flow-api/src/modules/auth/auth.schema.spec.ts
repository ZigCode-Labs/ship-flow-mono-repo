import { loginSchema, registerSchema } from './auth.schema';

describe('auth.schema', () => {
  describe('registerSchema', () => {
    it('accepts camelCase registration payloads', () => {
      const result = registerSchema.safeParse({
        firstName: 'Dev',
        lastName: 'User',
        email: 'dev@example.com',
        password: 'secret123',
      });

      expect(result.success).toBe(true);
    });

    it('normalizes snake_case payloads nested under data', () => {
      const result = registerSchema.safeParse({
        data: {
          first_name: 'Dev',
          last_name: 'User',
          email_address: 'dev@example.com',
          password: 'secret123',
        },
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual({
          firstName: 'Dev',
          lastName: 'User',
          email: 'dev@example.com',
          password: 'secret123',
        });
      }
    });

    it('normalizes alternate wrappers and short aliases', () => {
      const result = registerSchema.safeParse({
        payload: {
          first: 'Dev',
          last: 'User',
          email: 'dev@example.com',
          pass: 'secret123',
        },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('normalizes nested login payloads', () => {
      const result = loginSchema.safeParse({
        body: {
          email_address: 'dev@example.com',
          pass: 'secret123',
        },
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual({
          email: 'dev@example.com',
          password: 'secret123',
        });
      }
    });
  });
});
