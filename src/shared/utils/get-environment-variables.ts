import process from 'node:process';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getEnvironmentVariables = <T extends z.ZodObject<any>>(
  schema: T
): z.infer<T> => schema.parse(process.env);
