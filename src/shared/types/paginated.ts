import { z } from 'zod';

export type Paginated<T> = {
  currentPage: number;
  data: T[];
  itemsPerPage: number;
  lastPage: number;
  total: number;
};

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  itemsPerPage: z
    .enum(['25', '50', '100'])
    .default('100')
    .transform((value) => Number(value)),
});
