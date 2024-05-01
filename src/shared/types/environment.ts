import { z } from 'zod';

export const Environment = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

export const environmentSchema = z.nativeEnum(Environment);
