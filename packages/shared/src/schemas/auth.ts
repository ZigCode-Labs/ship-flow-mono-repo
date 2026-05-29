import { z } from 'zod';

type UnknownRecord = Record<string, unknown>;

const requiredTrimmedString = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const toRecord = (value: unknown): UnknownRecord | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as UnknownRecord;
};

const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

const pickValue = (source: UnknownRecord | null, aliases: string[]): string | undefined => {
  if (!source) return undefined;
  const entries = Object.entries(source);
  for (const alias of aliases) {
    const match = entries.find(([key]) => normalizeKey(key) === alias);
    if (match && typeof match[1] === 'string') return match[1];
  }
  return undefined;
};

const normalizeAuthPayload = (input: unknown) => {
  const root = toRecord(input);
  const nestedContainers = [root?.data, root?.user, root?.body, root?.payload, root?.form].map(
    toRecord,
  );
  const sources = [root, ...nestedContainers];

  const read = (aliases: string[]) => {
    for (const source of sources) {
      const value = pickValue(source, aliases);
      if (value !== undefined) return value;
    }
    return undefined;
  };

  return {
    firstName: read(['firstname', 'givenname', 'first']),
    lastName: read(['lastname', 'surname', 'familyname', 'last']),
    email: read(['email', 'emailaddress']),
    password: read(['password', 'pass']),
  };
};

const normalizedRegisterSchema = z.object({
  firstName: requiredTrimmedString('firstName'),
  lastName: requiredTrimmedString('lastName'),
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const normalizedLoginSchema = z.object({
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.preprocess(normalizeAuthPayload, normalizedRegisterSchema);
export const loginSchema = z.preprocess(normalizeAuthPayload, normalizedLoginSchema);

export type RegisterDto = z.infer<typeof normalizedRegisterSchema>;
export type LoginDto = z.infer<typeof normalizedLoginSchema>;
