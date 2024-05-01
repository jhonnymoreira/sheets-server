import { z } from 'zod';
import { insertContactSchema } from '@/shared/domain/contact.js';
import { StructuredContact } from '@/shared/types/index.js';

export const parseCsvRow = (row: unknown): StructuredContact | undefined => {
  const { success, data } = z
    .tuple([
      insertContactSchema.shape.email,
      insertContactSchema.shape.firstName,
      /**
       * Don't derive lastName from insertContactSchema because it can
       * be null and has a minimum length of 1.
       */
      z.string().max(50),
    ])
    .safeParse(row);

  if (!success) {
    return;
  }

  const [email, firstName, lastName] = data;

  return {
    email,
    firstName,
    ...(lastName ? { lastName } : {}),
  };
};
