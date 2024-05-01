import { z } from 'zod';
import { parseS3ObjectMetadata } from '@/shared/utils/index.js';

describe('parseS3ObjectMetadata', () => {
  test('should parse the S3 object metadata and return the typed object', () => {
    const metadata = {
      belongsTo: 'test@test.com',
      displayName: 'Test',
      size: 1000,
      type: 'text/csv',
    };

    const schema = parseS3ObjectMetadata(
      metadata,
      z.object({
        belongsTo: z.string().min(1),
        displayName: z.string().min(1),
        size: z.number().min(1),
        type: z.string().min(1),
      })
    );

    expect(schema).toStrictEqual({
      belongsTo: 'test@test.com',
      displayName: 'Test',
      size: 1000,
      type: 'text/csv',
    });
  });
});
