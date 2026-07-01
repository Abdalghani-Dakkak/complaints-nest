export const IS_PUBLIC_KEY = 'isPublic';

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'iam-dev-secret',
};

export const complaintsSystemId = Number(process.env.COMPLAINTS_SYSTEM_ID ?? 1);
