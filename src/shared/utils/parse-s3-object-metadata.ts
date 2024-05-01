import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseS3ObjectMetadata = <T extends z.ZodObject<any>>(
  metadata: Record<string, unknown>,
  schema: T
): z.infer<T> => schema.parse(metadata);
