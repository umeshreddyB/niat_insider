/** bcrypt salt rounds for password hashing */
export const BCRYPT_SALT_ROUNDS = 10;

/** minimum password length for registration */
export const MIN_PASSWORD_LENGTH = 8;

/** school name when admin creates or types a campus */
export const MIN_CAMPUS_NAME_LENGTH = 2;
export const MAX_CAMPUS_NAME_LENGTH = 120;

/** NIAT campus / school options — moderators are scoped to one */
export const NIAT_CAMPUSES = [
  'NIAT Bengaluru Central',
  'NIAT Hyderabad Tech',
  'NIAT Pune Riverside',
  'NIAT Chennai Bay',
  'NIAT Delhi NCR',
  'NIAT Kochi Harbor',
] as const;

/** Stored on admin users; not a real teaching campus */
export const ADMIN_CAMPUS_PLACEHOLDER = 'NIAT HQ (Admin)';
