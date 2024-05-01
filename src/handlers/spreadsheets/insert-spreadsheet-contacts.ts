import { SQSEvent } from 'aws-lambda';
import { contacts } from '@/db/schema.js';
import { db } from '@/shared/clients/drizzle.js';
import { ProcessedContactBatch } from '@/shared/types/events/index.js';
import { logger } from '@/shared/utils/index.js';

export const insertSpreadsheetContacts = async (event: SQSEvent) => {
  const contactsBatches = event.Records.reduce<ProcessedContactBatch[]>(
    (batches, record) => {
      const batch = JSON.parse(record.body) as ProcessedContactBatch;

      return [...batches, batch];
    },
    []
  );

  const insertedContactsBatches = await Promise.allSettled(
    contactsBatches.map(async (batch) =>
      db.insert(contacts).values(
        batch.data.map((contact) => ({
          ...contact,
          ownerId: batch.ownerId,
          spreadsheetId: batch.spreadsheetId,
        }))
      )
    )
  );

  const failedInserts = insertedContactsBatches.filter(
    ({ status }) => status === 'rejected'
  ).length;

  logger.info({
    failedInserts,
    successfulInserts: insertedContactsBatches.length,
  });
};
