'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require('zod');
const requiredTrimmedString = (fieldName) =>
  zod_1.z.string().trim().min(1, `${fieldName} is required`);
const toRecord = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value;
};
const normalizeKey = (key) => key.toLowerCase().replace(/[^a-z0-9]/g, '');
const pickValue = (source, aliases) => {
  if (!source) return undefined;
  const entries = Object.entries(source);
  for (const alias of aliases) {
    const match = entries.find(([key]) => normalizeKey(key) === alias);
    if (match && typeof match[1] === 'string') return match[1];
  }
  return undefined;
};
const normalizeAuthPayload = (input) => {
  const root = toRecord(input);
  const nestedContainers = [root?.data, root?.user, root?.body, root?.payload, root?.form].map(
    toRecord,
  );
  const sources = [root, ...nestedContainers];
  const read = (aliases) => {
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
const normalizedRegisterSchema = zod_1.z.object({
  firstName: requiredTrimmedString('firstName'),
  lastName: requiredTrimmedString('lastName'),
  email: zod_1.z.string().trim().email('Valid email is required'),
  password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
const normalizedLoginSchema = zod_1.z.object({
  email: zod_1.z.string().trim().email('Valid email is required'),
  password: zod_1.z.string().min(1, 'Password is required'),
});
exports.registerSchema = zod_1.z.preprocess(normalizeAuthPayload, normalizedRegisterSchema);
exports.loginSchema = zod_1.z.preprocess(normalizeAuthPayload, normalizedLoginSchema);
//# sourceMappingURL=auth.js.map
